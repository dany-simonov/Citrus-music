/**
 * Страница входа
 * @module app/login/page
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Music2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
  const { isAuthenticated, isLoading, error, initiateVKAuth, clearError } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleVKLogin = async () => {
    clearError();
    await initiateVKAuth();
  };

  const handleYandexLogin = () => {
    // TODO: Implement Yandex login
    alert('Вход через Яндекс будет доступен в следующей версии');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex">
      {/* Left side - decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-citrus-accent to-orange-600 items-center justify-center p-12">
        <div className="text-white text-center">
          <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-8">
            <Music2 className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Citrus</h1>
          <p className="text-xl opacity-90">
            Вся ваша музыка в одном месте
          </p>
        </div>
      </div>

      {/* Right side - login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Back button */}
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-black dark:hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>На главную</span>
          </Link>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-citrus-accent flex items-center justify-center">
              <Music2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">Citrus</span>
          </div>

          <h2 className="text-2xl font-bold mb-2">Добро пожаловать</h2>
          <p className="text-gray-500 mb-8">
            Войдите через одну из платформ, чтобы получить доступ к своей музыке
          </p>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Login buttons */}
          <div className="space-y-4">
            <button
              onClick={handleVKLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#0077FF] text-white rounded-xl font-medium hover:bg-[#0066DD] transition-colors disabled:opacity-70"
            >
              <VKIcon className="w-6 h-6" />
              {isLoading ? 'Загрузка...' : 'Войти через ВКонтакте'}
            </button>

            <button
              onClick={handleYandexLogin}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#FC3F1D] text-white rounded-xl font-medium hover:bg-[#E33A1A] transition-colors"
            >
              <YandexIcon className="w-6 h-6" />
              Войти через Яндекс
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">скоро</span>
            </button>
          </div>

          {/* Terms */}
          <p className="mt-8 text-xs text-gray-400 text-center">
            Входя в приложение, вы соглашаетесь с{' '}
            <a href="#" className="text-citrus-accent hover:underline">
              условиями использования
            </a>{' '}
            и{' '}
            <a href="#" className="text-citrus-accent hover:underline">
              политикой конфиденциальности
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
