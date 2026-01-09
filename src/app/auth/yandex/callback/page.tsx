/**
 * Callback страница для Yandex OAuth
 * @module app/auth/yandex/callback/page
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { yandexApiService } from '@/services/yandex';
import { MusicSource } from '@/types/audio';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function YandexCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleYandexCallback, setYandexUser } = useAuthStore();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      // Yandex использует implicit flow, токен приходит в hash
      const hash = window.location.hash;
      
      // Проверяем на ошибку в query params
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      if (error) {
        setStatus('error');
        setErrorMessage(errorDescription || error || 'Ошибка авторизации Yandex');
        return;
      }
      
      // Если токен пришёл в hash - обрабатываем
      if (hash && hash.includes('access_token')) {
        try {
          // Парсим и сохраняем токен
          handleYandexCallback(hash);
          
          // Получаем информацию о пользователе через Yandex ID API
          const yandexUser = await yandexApiService.getCurrentUser();
          
          setYandexUser({
            id: String(yandexUser.uid),
            firstName: yandexUser.name || yandexUser.displayName || yandexUser.login,
            lastName: '',
            photoUrl: yandexUser.avatarUrl,
            source: MusicSource.YANDEX,
          });

          setStatus('success');
          
          // Редирект на главную
          setTimeout(() => {
            router.push('/');
          }, 1500);
          
        } catch (err) {
          console.error('Yandex callback error:', err);
          setStatus('error');
          setErrorMessage(
            err instanceof Error ? err.message : 'Произошла ошибка при авторизации'
          );
        }
        return;
      }

      // Если нет токена и нет ошибки - что-то пошло не так
      setStatus('error');
      setErrorMessage('Не получен токен авторизации');
    };

    processCallback();
  }, [searchParams, handleYandexCallback, setYandexUser, router]);

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
