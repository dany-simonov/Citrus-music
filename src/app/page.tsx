/**
 * Главная страница
 * @module app/page
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Music2, Play, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-12">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-citrus-accent mb-6">
            <Music2 className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Добро пожаловать в{' '}
            <span className="text-gradient">Citrus</span>
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Слушайте музыку из ВКонтакте и Яндекс Музыки в одном удобном приложении.
            Бесплатно и без подписки.
          </p>

          {isAuthenticated ? (
            <div className="space-y-4">
              <p className="text-gray-500">
                Привет, <span className="font-medium text-black dark:text-white">{user?.firstName}</span>! 👋
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/library">
                  <Button variant="primary" icon={Play}>
                    Моя библиотека
                  </Button>
                </Link>
                <Link href="/search">
                  <Button variant="secondary">
                    Поиск музыки
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex justify-center gap-4">
              <Link href="/login">
                <Button variant="primary" icon={LogIn}>
                  Войти через VK
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-12">
        <h2 className="text-2xl font-bold mb-8 text-center">Возможности</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            title="Интеграция с VK"
            description="Подключите свой аккаунт ВКонтакте и получите доступ ко всей своей музыке"
            icon="🎵"
          />
          <FeatureCard
            title="Яндекс Музыка"
            description="Скоро! Интеграция с Яндекс Музыкой для ещё большего выбора"
            icon="🎶"
          />
          <FeatureCard
            title="Оффлайн режим"
            description="Скачивайте треки и слушайте без интернета"
            icon="📥"
          />
        </div>
      </section>

      {/* How it works */}
      <section className="py-12">
        <h2 className="text-2xl font-bold mb-8 text-center">Как это работает</h2>
        
        <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <Step number={1} title="Войдите" description="Авторизуйтесь через VK" />
          <Step number={2} title="Загрузите" description="Ваши плейлисты синхронизируются автоматически" />
          <Step number={3} title="Слушайте" description="Наслаждайтесь музыкой" />
          <Step number={4} title="Сохраняйте" description="Скачивайте для оффлайн прослушивания" />
        </div>
      </section>
    </MainLayout>
  );
}

function FeatureCard({ 
  title, 
  description, 
  icon 
}: { 
  title: string; 
  description: string; 
  icon: string; 
}) {
  return (
    <div className="card text-center p-6">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

function Step({ 
  number, 
  title, 
  description 
}: { 
  number: number; 
  title: string; 
  description: string; 
}) {
  return (
    <div className="text-center">
      <div className="w-10 h-10 rounded-full bg-citrus-accent text-white font-bold flex items-center justify-center mx-auto mb-3">
        {number}
      </div>
      <h4 className="font-medium mb-1">{title}</h4>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}
