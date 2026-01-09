/**
 * Страница аккаунта
 * @module app/account/page
 */

'use client';

import { useAuthStore } from '@/store/auth';
import { useHistoryStore } from '@/store/history';
import { MainLayout } from '@/components/layout';
import { 
  User, 
  Music, 
  Heart, 
  Clock, 
  ListMusic,
  LogOut,
  Settings,
  ChevronRight,
  Crown,
  Star,
  Calendar,
  Disc3,
  Mail,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const router = useRouter();
  const { 
    isAuthenticated,
    vkUser, 
    yandexUser,
    logout 
  } = useAuthStore();
  const { history } = useHistoryStore();

  const user = vkUser || yandexUser;
  const source = vkUser ? 'VK' : yandexUser ? 'Яндекс' : null;

  // Если не авторизован - показываем страницу входа
  if (!isAuthenticated || !user) {
    return (
      <MainLayout>
        <div className="p-4 md:p-8 pb-32">
          <div className="max-w-md mx-auto text-center py-12">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-6">
              <User className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Войдите в аккаунт</h1>
            <p className="text-gray-500 mb-8">
              Чтобы получить доступ к вашей музыке и плейлистам
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all"
            >
              Войти
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const stats = [
    { icon: Heart, label: 'Избранное', value: '473', href: '/favorites', color: 'text-red-500' },
    { icon: ListMusic, label: 'Плейлисты', value: '12', href: '/playlists', color: 'text-purple-500' },
    { icon: Clock, label: 'История', value: String(history.length), href: '/history', color: 'text-blue-500' },
  ];

  const menuItems = [
    { icon: Heart, label: 'Избранное', href: '/favorites' },
    { icon: ListMusic, label: 'Мои плейлисты', href: '/playlists' },
    { icon: Clock, label: 'История', href: '/history' },
    { icon: Disc3, label: 'Загрузки', href: '#' },
    { icon: Settings, label: 'Настройки', href: '/settings' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <MainLayout>
      <div className="p-4 md:p-8 pb-32 max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="relative rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 p-6 md:p-8 mb-6 overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white blur-3xl" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.firstName}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white/30 shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center border-4 border-white/30">
                <User className="w-12 h-12 md:w-16 md:h-16 text-white" />
              </div>
            )}
            
            {/* User info */}
            <div className="text-center md:text-left text-white">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold">
                  {user.firstName} {user.lastName}
                </h1>
                <Crown className="w-6 h-6 text-yellow-300" />
              </div>
              <p className="text-white/80 mb-4">
                {source} • ID: {user.id}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                  <Star className="w-4 h-4 inline mr-1" />
                  Premium
                </div>
                <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  с 2024
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-gray-200 dark:border-neutral-800 hover:border-orange-500/50 transition-colors text-center group"
            >
              <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </Link>
          ))}
        </div>

        {/* Menu */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 overflow-hidden mb-6">
          {menuItems.map((item, index) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-gray-200 dark:border-neutral-800' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <span className="font-medium">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          ))}
        </div>

        {/* Connected Services */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-gray-200 dark:border-neutral-800 mb-6">
          <h2 className="text-lg font-bold mb-4">Подключённые сервисы</h2>
          
          <div className="space-y-3">
            {vkUser && (
              <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                    <Music className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">VK Музыка</p>
                    <p className="text-sm text-gray-500">{vkUser.firstName} {vkUser.lastName}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-500/20 text-green-600 rounded-full text-sm font-medium">
                  Подключено
                </span>
              </div>
            )}
            
            {yandexUser && (
              <div className="flex items-center justify-between p-4 bg-yellow-500/10 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center">
                    <Music className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Яндекс Музыка</p>
                    <p className="text-sm text-gray-500">{yandexUser.firstName}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-500/20 text-green-600 rounded-full text-sm font-medium">
                  Подключено
                </span>
              </div>
            )}
            
            {!vkUser && (
              <Link
                href="/settings"
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-800 rounded-2xl hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                    <Music className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium">Подключить VK Музыку</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            )}
          </div>
        </div>

        {/* Support */}
        <a
          href="mailto:citrus.helper.team@gmail.com"
          className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 hover:border-orange-500/50 transition-colors mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="font-medium">Помощь и поддержка</p>
              <p className="text-sm text-gray-500">citrus.helper.team@gmail.com</p>
            </div>
          </div>
          <Mail className="w-5 h-5 text-gray-400" />
        </a>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 p-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl font-semibold transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Выйти из аккаунта
        </button>
      </div>
    </MainLayout>
  );
}
