/**
 * Компонент боковой панели - Apple/Microsoft Style
 * @module components/layout/sidebar
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import {
  Home,
  Search,
  Library,
  ListMusic,
  Heart,
  Clock,
  Settings,
  LogOut,
} from 'lucide-react';

const mainNavItems = [
  { href: '/', label: 'Главная', icon: Home },
  { href: '/search', label: 'Поиск', icon: Search },
  { href: '/library', label: 'Библиотека', icon: Library },
];

const libraryItems = [
  { href: '/playlists', label: 'Плейлисты', icon: ListMusic },
  { href: '/favorites', label: 'Избранное', icon: Heart },
  { href: '/history', label: 'История', icon: Clock },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isAuthenticated, vkUser, yandexUser, logout } = useAuthStore();
  
  // Используем пользователя из любого доступного сервиса
  const user = vkUser || yandexUser;

  return (
    <aside className="sidebar flex flex-col">
      {/* Логотип */}
      <div className="p-6 pb-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/40 transition-shadow">
            <Image 
              src="/logo.png"
              alt="Citrus"
              width={28}
              height={28}
              className="w-7 h-7 object-contain"
            />
          </div>
          <span className="text-2xl font-bold text-gradient">Citrus</span>
        </Link>
      </div>

      {/* Основная навигация */}
      <nav className="px-4">
        <ul className="space-y-1">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200',
                    isActive
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
                  )}
                >
                  <item.icon className={cn('w-5 h-5', isActive && 'drop-shadow-sm')} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Разделитель */}
      <div className="mx-6 my-5 h-px bg-gray-200/50 dark:bg-neutral-800/50" />

      {/* Библиотека */}
      {isAuthenticated && (
        <nav className="px-4 flex-1">
          <p className="px-4 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Библиотека
          </p>
          <ul className="space-y-1">
            {libraryItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200',
                      isActive
                        ? 'bg-black/5 dark:bg-white/10 text-orange-500'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {/* Нижняя часть */}
      <div className="mt-auto p-4 border-t border-gray-200/50 dark:border-neutral-800/50">
        {isAuthenticated && user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.firstName}
                  className="w-10 h-10 rounded-2xl object-cover shadow-sm"
                />
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-orange-500/20">
                  {user.firstName[0]}
                </div>
              )}
              <div className="min-w-0">
                <span className="block text-sm font-semibold truncate">
                  {user.firstName} {user.lastName}
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  {vkUser ? 'ВКонтакте' : yandexUser ? 'Яндекс' : ''}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-95"
              title="Выйти"
            >
              <LogOut className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="block text-center py-3.5 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-2xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 active:scale-[0.98]"
          >
            Войти
          </Link>
        )}

        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 mt-3 rounded-2xl text-gray-500 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Настройки</span>
        </Link>
      </div>
    </aside>
  );
}
