/**
 * Callback страница для Yandex OAuth
 * @module app/auth/yandex/callback/page
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { yandexApiService, yandexAuthService } from '@/services/yandex';
import { MusicSource } from '@/types/audio';
import { Music2, CheckCircle, XCircle, Loader2, Key } from 'lucide-react';
import Image from 'next/image';

export default function YandexCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleYandexCallback, setYandexUser, setYandexTokens } = useAuthStore();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'manual'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processCallback = async () => {
      // Yandex использует implicit flow, токен в hash
      const hash = window.location.hash;
      
      // Если токен пришёл в hash - обрабатываем автоматически
      if (hash && hash.includes('access_token')) {
        try {
          handleYandexCallback(hash);
          await fetchUserAndRedirect();
        } catch (err) {
          console.error('Yandex callback error:', err);
          setStatus('manual');
          setErrorMessage('Не удалось автоматически обработать токен');
        }
        return;
      }
      
      // Проверяем на ошибку в query params
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      if (error) {
        setStatus('error');
        setErrorMessage(errorDescription || error || 'Ошибка авторизации Yandex');
        return;
      }

      // Если ничего нет - показываем форму ручного ввода
      setStatus('manual');
    };

    processCallback();
  }, [searchParams]);

  const fetchUserAndRedirect = async () => {
    try {
      const yandexUser = await yandexApiService.getCurrentUser();
      
      setYandexUser({
        id: yandexUser.uid.toString(),
        firstName: yandexUser.name || yandexUser.login,
        lastName: '',
        source: MusicSource.YANDEX,
      });

      setStatus('success');
      
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      throw err;
    }
  };

  const handleManualToken = async () => {
    if (!manualToken.trim()) return;
    
    setIsProcessing(true);
    
    try {
      // Сохраняем токен вручную
      const tokens = {
        accessToken: manualToken.trim(),
        expiresIn: 365 * 24 * 60 * 60, // 1 год в секундах
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        userId: '',
      };
      
      yandexAuthService.saveTokens(tokens);
      setYandexTokens(tokens);
      
      await fetchUserAndRedirect();
    } catch (err) {
      console.error('Manual token error:', err);
      setStatus('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Не удалось использовать токен'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        {/* Logo */}
        <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-orange-500/30">
          <Image 
            src="/logo.png"
            alt="Citrus"
            width={56}
            height={56}
            className="w-14 h-14 object-contain"
          />
        </div>

        {status === 'loading' && (
          <div className="animate-fade-in">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-2">Авторизация...</h1>
            <p className="text-gray-500">Подключаем ваш аккаунт Яндекс</p>
          </div>
        )}

        {status === 'success' && (
          <div className="animate-scale-in">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-2">Успешно!</h1>
            <p className="text-gray-500">Вы вошли через Яндекс. Перенаправляем...</p>
          </div>
        )}

        {status === 'manual' && (
          <div className="animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-6">
              <Key className="w-8 h-8 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Введите токен</h1>
            <p className="text-gray-500 mb-6">
              Скопируйте токен со страницы Яндекса и вставьте его ниже
            </p>
            
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
                {errorMessage}
              </div>
            )}
            
            <div className="space-y-4">
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Вставьте токен (y0__...)"
                className="w-full px-5 py-4 bg-gray-100 dark:bg-neutral-800 rounded-2xl border border-gray-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-center font-mono text-sm"
              />
              
              <button
                onClick={handleManualToken}
                disabled={isProcessing || !manualToken.trim()}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Проверяем...
                  </>
                ) : (
                  'Войти с токеном'
                )}
              </button>
              
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
              >
                Вернуться к выбору входа
              </button>
            </div>
            
            <div className="mt-8 p-4 bg-gray-50 dark:bg-neutral-900 rounded-2xl text-left">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Как получить токен:</p>
              <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside">
                <li>Нажмите "Войти через Яндекс"</li>
                <li>Разрешите доступ приложению</li>
                <li>Скопируйте токен со страницы</li>
                <li>Вставьте его в поле выше</li>
              </ol>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="animate-fade-in">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-2">Ошибка авторизации</h1>
            <p className="text-gray-500 mb-8">{errorMessage}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/login')}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all"
              >
                Попробовать снова
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-8 py-4 bg-gray-100 dark:bg-neutral-800 rounded-2xl font-medium hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all"
              >
                На главную
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
