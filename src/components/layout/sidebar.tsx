/**
 * Компонент боковой панели
 * @module components/layout/sidebar
 */

'use client';

import Link from 'next/link';
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
  Music2,
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
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <aside className="sidebar flex flex-col">
      {/* Логотип */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-citrus-accent flex items-center justify-center">
            <Music2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gradient">Citrus</span>
        </Link>
      </div>

      {/* Основная навигация */}
      <nav className="px-3">
        <ul className="space-y-1">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-citrus-accent text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
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

      {/* Разделитель */}
      <div className="mx-6 my-4 h-px bg-gray-200 dark:bg-neutral-800" />

      {/* Библиотека */}
      {isAuthenticated && (
        <nav className="px-3 flex-1">
          <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
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
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                      isActive
                        ? 'bg-gray-100 dark:bg-neutral-800 text-citrus-accent'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {/* Нижняя часть */}
      <div className="mt-auto p-3 border-t border-gray-200 dark:border-neutral-800">
        {isAuthenticated && user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.firstName}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-citrus-accent flex items-center justify-center text-white font-medium">
                  {user.firstName[0]}
                </div>
              )}
              <span className="text-sm font-medium truncate">
                {user.firstName} {user.lastName}
              </span>
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              title="Выйти"
            >
              <LogOut className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="block text-center py-2 px-4 bg-citrus-accent text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Войти
          </Link>
        )}

        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 mt-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm">Настройки</span>
        </Link>
      </div>
    </aside>
  );
}
