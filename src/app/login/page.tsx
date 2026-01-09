/**
 * Страница входа
 * @module app/login/page
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { vkAuthService } from '@/services/vk';
import { ArrowLeft, ExternalLink, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// VK Icon component
function VKIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.576-1.496c.588-.19 1.341 1.26 2.14 1.818.605.422 1.064.33 1.064.33l2.137-.03s1.117-.071.587-.964c-.043-.073-.308-.661-1.588-1.87-1.34-1.264-1.16-1.059.453-3.246.983-1.332 1.376-2.145 1.253-2.493-.117-.332-.84-.244-.84-.244l-2.406.015s-.178-.025-.31.056c-.13.079-.212.262-.212.262s-.382 1.03-.89 1.907c-1.07 1.85-1.499 1.948-1.674 1.832-.407-.267-.305-1.075-.305-1.648 0-1.793.267-2.54-.521-2.733-.262-.065-.454-.107-1.123-.114-.858-.009-1.585.003-1.996.208-.274.136-.485.44-.356.457.159.022.519.099.71.363.246.341.237 1.107.237 1.107s.142 2.11-.33 2.371c-.325.18-.77-.187-1.725-1.865-.489-.859-.859-1.81-.859-1.81s-.07-.176-.198-.272c-.154-.115-.37-.151-.37-.151l-2.286.015s-.343.01-.469.162c-.112.135-.009.414-.009.414s1.781 4.232 3.8 6.36c1.851 1.95 3.953 1.822 3.953 1.822h.953z"/>
    </svg>
  );
}

// Yandex Icon component
function YandexIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.82 14.73h-2.04V9.3h-.53c-1.26 0-1.95.67-1.95 1.65 0 1.1.5 1.6 1.54 2.3l.85.57-2.53 3.91H7l2.24-3.41c-1.3-.95-2.03-1.87-2.03-3.42 0-2 1.44-3.52 4.04-3.52h2.57v10.35z"/>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { 
    isAuthenticated, 
    isLoading, 
    error, 
    initiateYandexAuth,
    handleVKCallback,
    setVKUser,
    clearError 
  } = useAuthStore();

  const [vkStep, setVkStep] = useState<'idle' | 'waiting' | 'success'>('idle');
  const [vkUrl, setVkUrl] = useState('');
  const [vkError, setVkError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleVKLogin = () => {
    clearError();
    setVkError('');
    const authUrl = vkAuthService.initiateAuth();
    window.open(authUrl, '_blank');
    setVkStep('waiting');
  };

  const handleVKUrlSubmit = async () => {
    if (!vkUrl.includes('access_token')) {
      setVkError('URL должен содержать access_token');
      return;
    }
    
    try {
      // Извлекаем hash часть (после #)
      const hashPart = vkUrl.includes('#') ? vkUrl.split('#')[1] : vkUrl;
      const tokens = handleVKCallback('#' + hashPart);
      
      // Получаем информацию о пользователе через прокси
      const response = await fetch('/api/vk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'users.get',
          params: { fields: 'photo_200' },
          accessToken: tokens.accessToken,
        }),
      });
      const data = await response.json();
      
      if (data.response?.[0]) {
        const user = data.response[0];
        setVKUser({
          id: String(user.id),
          firstName: user.first_name,
          lastName: user.last_name,
          photoUrl: user.photo_200,
        });
      }
      
      setVkStep('success');
      setTimeout(() => router.push('/'), 1000);
    } catch (err) {
      setVkError(err instanceof Error ? err.message : 'Ошибка авторизации');
    }
  };

  const handleYandexLogin = () => {
    clearError();
    initiateYandexAuth();
  };
      
  return (
    <div className="min-h-screen bg-citrus-bg-light dark:bg-citrus-bg-dark flex">
      {/* Left side - decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-citrus-accent via-orange-500 to-amber-500 items-center justify-center p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>
        
        <div className="text-white text-center relative z-10">
          {/* Logo */}
          <div className="w-32 h-32 rounded-[2.5rem] bg-white/20 backdrop-blur-xl flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-black/20 border border-white/20">
            <Image 
              src="/logo1.png" 
              alt="Цитрус Logo"
              width={80}
              height={80}
              className="w-20 h-20 object-contain"
              priority
            />
          </div>
          <h1 className="text-5xl font-bold mb-4 tracking-tight">Цитрус</h1>
          <p className="text-xl opacity-90 font-medium">
            Вся ваша музыка в одном месте
          </p>
          
          {/* Feature badges */}
          <div className="flex items-center justify-center gap-3 mt-10">
            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-2xl text-sm font-medium">
              VK Музыка
            </span>
            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-2xl text-sm font-medium">
              Яндекс Музыка
            </span>
          </div>
        </div>
      </div>

      {/* Right side - login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Back button */}
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-black dark:hover:text-white mb-10 transition-all duration-200 hover:-translate-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">На главную</span>
          </Link>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-4 mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-citrus-accent to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Image 
                src="/logo1.png" 
                alt="Цитрус Logo"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
              />
            </div>
            <span className="text-3xl font-bold text-gradient">Цитрус</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-3 tracking-tight">Добро пожаловать</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Войдите через одну из платформ для доступа к музыке
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-8 p-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl text-red-600 dark:text-red-400 text-sm animate-scale-in">
              {error}
            </div>
          )}

          {/* VK Login */}
          {vkStep === 'idle' && (
            <button
              onClick={handleVKLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-[#0077FF] text-white rounded-2xl font-semibold 
                         hover:bg-[#0066DD] active:scale-[0.98] transition-all duration-200 
                         shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30
                         disabled:opacity-70 disabled:cursor-not-allowed mb-4"
            >
              <VKIcon className="w-6 h-6" />
              Войти через ВКонтакте
            </button>
          )}

          {/* VK Step 2: Paste URL */}
          {vkStep === 'waiting' && (
            <div className="mb-4 p-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl animate-scale-in">
              <div className="flex items-center gap-2 mb-3">
                <ExternalLink className="w-5 h-5 text-blue-500" />
                <span className="font-semibold text-blue-700 dark:text-blue-300">Шаг 2: Вставьте URL</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                После авторизации в VK скопируйте <strong>весь URL</strong> из адресной строки и вставьте сюда:
              </p>
              <input
                type="text"
                value={vkUrl}
                onChange={(e) => {
                  setVkUrl(e.target.value);
                  setVkError('');
                }}
                placeholder="https://oauth.vk.com/blank.html#access_token=..."
                className="w-full px-4 py-3 bg-white dark:bg-neutral-800 rounded-xl border-2 border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:outline-none transition-colors text-sm font-mono mb-3"
              />
              {vkError && (
                <p className="text-red-500 text-sm mb-3">{vkError}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleVKUrlSubmit}
                  disabled={!vkUrl}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Подтвердить
                </button>
                <button
                  onClick={() => {
                    setVkStep('idle');
                    setVkUrl('');
                    setVkError('');
                  }}
                  className="px-4 py-3 bg-gray-100 dark:bg-neutral-700 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}

          {/* VK Success */}
          {vkStep === 'success' && (
            <div className="mb-4 p-5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-2xl animate-scale-in">
              <div className="flex items-center gap-3">
                <Check className="w-6 h-6 text-green-500" />
                <span className="font-semibold text-green-700 dark:text-green-300">Успешно! Перенаправляем...</span>
                <Loader2 className="w-5 h-5 text-green-500 animate-spin ml-auto" />
              </div>
            </div>
          )}

          {/* Yandex Login */}
          <button
            onClick={handleYandexLogin}
            disabled={isLoading || vkStep === 'waiting'}
            className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-[#FC3F1D] text-white rounded-2xl font-semibold 
                       hover:bg-[#E33A1A] active:scale-[0.98] transition-all duration-200 
                       shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30
                       disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <YandexIcon className="w-6 h-6" />
            {isLoading ? 'Загрузка...' : 'Войти через Яндекс'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-800" />
            <span className="text-xs text-gray-400 font-medium">ИЛИ</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-800" />
          </div>

          {/* Guest mode hint */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Хотите просто посмотреть?{' '}
            <Link href="/" className="text-citrus-accent hover:underline font-medium">
              Продолжить как гость
            </Link>
          </p>

          {/* Terms */}
          <p className="mt-10 text-xs text-gray-400 text-center leading-relaxed">
            Входя в приложение, вы соглашаетесь с{' '}
            <a href="#" className="text-citrus-accent hover:underline font-medium">
              условиями использования
            </a>{' '}
            и{' '}
            <a href="#" className="text-citrus-accent hover:underline font-medium">
              политикой конфиденциальности
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
