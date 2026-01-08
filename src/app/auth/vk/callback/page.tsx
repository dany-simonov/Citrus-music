/**
 * Callback страница для VK OAuth
 * @module app/auth/vk/callback/page
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { vkApiService } from '@/services/vk';
import { MusicSource } from '@/types/audio';
import { Music2, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VKCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleVKCallback, setVKUser } = useAuthStore();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Проверяем на ошибку от VK
      if (error) {
        setStatus('error');
        setErrorMessage(errorDescription || error || 'Ошибка авторизации VK');
        return;
      }

      // Проверяем наличие кода и state
      if (!code || !state) {
        setStatus('error');
        setErrorMessage('Отсутствуют необходимые параметры авторизации');
        return;
      }

      try {
        // Обмениваем код на токены
        await handleVKCallback(code, state);

        // Получаем информацию о пользователе
        const vkUser = await vkApiService.getCurrentUser();
        
        setVKUser({
          id: vkUser.id.toString(),
          firstName: vkUser.first_name,
          lastName: vkUser.last_name,
          avatarUrl: vkUser.photo_200 || vkUser.photo_100,
          source: MusicSource.VK,
        });

        setStatus('success');
        
        // Редирект на главную через 2 секунды
        setTimeout(() => {
          router.push('/');
        }, 2000);
        
      } catch (err) {
        console.error('VK callback error:', err);
        setStatus('error');
        setErrorMessage(
          err instanceof Error ? err.message : 'Произошла ошибка при авторизации'
        );
      }
    };

    processCallback();
  }, [searchParams, handleVKCallback, setVKUser, router]);

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl bg-citrus-accent flex items-center justify-center mx-auto mb-6">
          <Music2 className="w-8 h-8 text-white" />
        </div>

        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-citrus-accent animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Авторизация...</h1>
            <p className="text-gray-500">Подождите, мы подключаем ваш аккаунт VK</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Успешно!</h1>
            <p className="text-gray-500">Вы успешно вошли в аккаунт. Перенаправляем...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Ошибка авторизации</h1>
            <p className="text-gray-500 mb-6">{errorMessage}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-2 bg-citrus-accent text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Попробовать снова
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2 bg-gray-100 dark:bg-neutral-800 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
              >
                На главную
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
