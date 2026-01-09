/**
 * Компонент боковой панели - Apple/Microsoft Style с адаптивностью
 * @module components/layout/sidebar
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import {
  Home,
  Search,
  ListMusic,
  Heart,
  Clock,
  Settings,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react';

const mainNavItems = [
  { href: '/', label: 'Главная', icon: Home },
  { href: '/search', label: 'Поиск', icon: Search },
];

const libraryItems = [
  { href: '/playlists', label: 'Плейлисты', icon: ListMusic },
  { href: '/favorites', label: 'Избранное', icon: Heart },
  { href: '/history', label: 'История', icon: Clock },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { isAuthenticated, vkUser, yandexUser, logout } = useAuthStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Используем пользователя из любого доступного сервиса
  const user = vkUser || yandexUser;

  // Закрываем мобильное меню при смене страницы
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Блокируем скролл при открытом мобильном меню
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const SidebarContent = () => (
    <>
      {/* Логотип */}
      <div className="p-4 lg:p-6 pb-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/40 transition-shadow">
            <Image 
              src="/logo.png"
              alt="Citrus"
              width={28}
              height={28}
              className="w-6 h-6 lg:w-7 lg:h-7 object-contain"
            />
          </div>
          <span className="text-xl lg:text-2xl font-bold text-gradient">Citrus</span>
        </Link>
      </div>

      {/* Основная навигация */}
      <nav className="px-3 lg:px-4">
        <ul className="space-y-1">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl transition-all duration-200',
                    isActive
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
                  )}
                >
                  <item.icon className={cn('w-5 h-5', isActive && 'drop-shadow-sm')} />
                  <span className="font-medium text-sm lg:text-base">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Разделитель */}
      <div className="mx-4 lg:mx-6 my-4 lg:my-5 h-px bg-gray-200/50 dark:bg-neutral-800/50" />

      {/* Библиотека */}
      {isAuthenticated && (
        <nav className="px-3 lg:px-4 flex-1 overflow-y-auto">
          <p className="px-3 lg:px-4 mb-2 lg:mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Моя музыка
          </p>
          <ul className="space-y-1">
            {libraryItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl transition-all duration-200',
                      isActive
                        ? 'bg-black/5 dark:bg-white/10 text-orange-500'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium text-sm lg:text-base">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {/* Нижняя часть - Аккаунт и Настройки */}
      <div className="mt-auto p-3 lg:p-4 border-t border-gray-200/50 dark:border-neutral-800/50 space-y-2">
        {/* Аккаунт */}
        {isAuthenticated && user ? (
          <Link
            href="/settings"
            className="flex items-center justify-between p-2 lg:p-3 rounded-xl lg:rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200"
          >
            <div className="flex items-center gap-2 lg:gap-3 min-w-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.firstName}
                  className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl lg:rounded-2xl object-cover shadow-sm"
                />
              ) : (
                <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl lg:rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-orange-500/20">
                  {user.firstName[0]}
                </div>
              )}
              <div className="min-w-0">
                <span className="block text-xs lg:text-sm font-semibold truncate">
                  {user.firstName} {user.lastName}
                </span>
                <span className="block text-[10px] lg:text-xs text-gray-500 dark:text-gray-400">
                  {vkUser ? 'ВКонтакте' : yandexUser ? 'Яндекс' : ''}
                </span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                logout();
              }}
              className="p-2 lg:p-2.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg lg:rounded-xl transition-all duration-200 active:scale-95"
              title="Выйти"
            >
              <LogOut className="w-4 h-4 text-gray-500" />
            </button>
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200"
          >
            <User className="w-5 h-5" />
            <span className="font-medium text-sm lg:text-base">Аккаунт</span>
          </Link>
        )}

        {/* Настройки */}
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl transition-all duration-200',
            pathname === '/settings'
              ? 'bg-black/5 dark:bg-white/10 text-orange-500'
              : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/5'
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm lg:text-base font-medium">Настройки</span>
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Кнопка мобильного меню */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 dark:border-neutral-700/50"
        aria-label="Открыть меню"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop sidebar */}
      <aside className={cn(
        'hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 xl:w-72',
        'backdrop-blur-2xl border-r border-gray-200/30 dark:border-neutral-800/50 z-40',
        'bg-gray-50/95 dark:bg-neutral-900/95',
        className
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside className={cn(
        'lg:hidden fixed left-0 top-0 h-full w-72 z-50',
        'backdrop-blur-2xl border-r border-gray-200/30 dark:border-neutral-800/50',
        'bg-white/95 dark:bg-neutral-900/95',
        'transform transition-transform duration-300 ease-out flex flex-col',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Кнопка закрытия */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors"
          aria-label="Закрыть меню"
        >
          <X className="w-5 h-5" />
        </button>
        
        <SidebarContent />
      </aside>
    </>
  );
}
