/**
 * Главная страница - Apple/Microsoft Style
 * @module app/page
 */

'use client';

import { useEffect } from 'react';
import { MainLayout } from '@/components/layout';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Play, LogIn, Sparkles, Cloud, Smartphone, Music } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const { isAuthenticated, vkUser, yandexUser, checkAuth } = useAuthStore();
  
  const user = vkUser || yandexUser;

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-12 md:py-16 animate-fade-in">
        <div className="text-center max-w-4xl mx-auto px-4">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-[1.5rem] md:rounded-[2rem] bg-gradient-to-br from-orange-500 to-orange-600 mb-6 md:mb-8 shadow-2xl shadow-orange-500/30">
            <Image 
              src="/logo1.png"
              alt="Цитрус"
              width={64}
              height={64}
              className="w-12 h-12 md:w-16 md:h-16 object-contain"
              priority
            />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 tracking-tight">
            Добро пожаловать в{' '}
            <span className="text-gradient">Цитрус</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
            Слушайте музыку из ВКонтакте и Яндекс Музыки в одном удобном приложении.
            Бесплатно и без подписки.
          </p>

          {isAuthenticated ? (
            <div className="space-y-6 animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Привет, {user?.firstName}! 👋
              </div>
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
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up">
              <Link href="/login">
                <Button variant="primary" icon={LogIn} className="w-full sm:w-auto">
                  Войти в приложение
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <h2 className="text-3xl font-bold mb-10 text-center tracking-tight">Возможности</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            title="VK Музыка"
            description="Подключите аккаунт ВКонтакте и получите доступ ко всей музыке"
            icon={<Music className="w-7 h-7" />}
            color="blue"
          />
          <FeatureCard
            title="Яндекс Музыка"
            description="Интеграция с Яндекс Музыкой для максимального выбора"
            icon={<Sparkles className="w-7 h-7" />}
            color="red"
            badge="Новое"
          />
          <FeatureCard
            title="Оффлайн режим"
            description="Скачивайте треки и слушайте без интернета"
            icon={<Cloud className="w-7 h-7" />}
            color="green"
            badge="Скоро"
          />
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <h2 className="text-3xl font-bold mb-10 text-center tracking-tight">Как начать</h2>
        
        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <Step number={1} title="Войдите" description="Авторизуйтесь через VK или Яндекс" />
          <Step number={2} title="Синхронизация" description="Плейлисты загрузятся автоматически" />
          <Step number={3} title="Слушайте" description="Наслаждайтесь любимой музыкой" />
          <Step number={4} title="Сохраняйте" description="Скачайте для оффлайн" />
        </div>
      </section>
    </MainLayout>
  );
}

function FeatureCard({ 
  title, 
  description, 
  icon,
  color,
  badge
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
  color: 'blue' | 'red' | 'green' | 'orange';
  badge?: string;
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/30',
    red: 'from-red-500 to-red-600 shadow-red-500/30',
    green: 'from-green-500 to-green-600 shadow-green-500/30',
    orange: 'from-orange-500 to-orange-600 shadow-orange-500/30',
  };

  return (
    <div className="card text-center p-8 hover-lift group relative">
      {badge && (
        <span className="absolute top-4 right-4 px-3 py-1 text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
          {badge}
        </span>
      )}
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colorClasses[color]} shadow-lg flex items-center justify-center mx-auto mb-5 text-white group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
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
    <div className="text-center group">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/25 group-hover:scale-110 transition-transform duration-300">
        {number}
      </div>
      <h4 className="font-semibold text-lg mb-2">{title}</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
}
