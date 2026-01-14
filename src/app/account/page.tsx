/**
 * Страница аккаунта с настройками
 * @module app/account/page
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useHistoryStore } from '@/store/history';
import { useFavoritesStore } from '@/store/favorites';
import { usePlaylistsStore } from '@/store/playlists';
import { useNotificationsStore } from '@/store/notifications';
import { MainLayout } from '@/components/layout';
import { MusicSource } from '@/types/audio';
import { 
  User, 
  Music, 
  Heart, 
  Clock, 
  ListMusic,
  LogOut,
  ChevronRight,
  Disc3,
  Construction,
  HelpCircle,
  Mail,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Trash2,
  Bell,
  Key
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const router = useRouter();
  const { 
    isAuthenticated,
    vkUser, 
    yandexUser,
    vkTokens,
    setVKTokens,
    setVKUser,
    clearVKAuth,
    logout 
  } = useAuthStore();
  const { items: history } = useHistoryStore();
  const { favorites } = useFavoritesStore();
  const { playlists } = usePlaylistsStore();
  const {
    settings: notificationSettings,
    permissionStatus,
    setPushEnabled,
    checkPermission,
  } = useNotificationsStore();

  const user = vkUser || yandexUser;
  const source = vkUser ? 'VK' : yandexUser ? 'Яндекс' : null;

  // Состояние для настроек VK токена
  const [vkToken, setVkToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [notificationLoading, setNotificationLoading] = useState(false);

  useEffect(() => {
    if (vkTokens?.accessToken) {
      setVkToken(vkTokens.accessToken);
    }
  }, [vkTokens]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const handleToggleNotifications = async () => {
    setNotificationLoading(true);
    try {
      const success = await setPushEnabled(!notificationSettings.pushEnabled);
      if (!success && !notificationSettings.pushEnabled) {
        setErrorMessage('Разрешите уведомления в настройках браузера');
      }
    } finally {
      setNotificationLoading(false);
    }
  };

  const handleSaveVKToken = async () => {
    if (!vkToken.trim()) {
      setSaveStatus('error');
      setErrorMessage('Введите токен');
      return;
    }

    try {
      const response = await fetch('/api/vk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'users.get',
          params: { fields: 'photo_200' },
          accessToken: vkToken,
        }),
      });
      const data = await response.json();

      if (data.error) {
        setSaveStatus('error');
        setErrorMessage(data.error.error_msg || 'Неверный токен');
        return;
      }

      const userData = data.response[0];

      setVKTokens({
        accessToken: vkToken,
        expiresIn: 0,
        userId: userData.id,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      });

      setVKUser({
        id: String(userData.id),
        firstName: userData.first_name,
        lastName: userData.last_name,
        avatarUrl: userData.photo_200,
        source: MusicSource.VK,
      });

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setSaveStatus('error');
      setErrorMessage('Ошибка проверки токена');
    }
  };

  const handleClearVK = () => {
    clearVKAuth();
    setVkToken('');
    setSaveStatus('idle');
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Если не авторизован - показываем страницу входа с формой токена
  if (!isAuthenticated || !user) {
    return (
      <MainLayout>
        <div className="p-4 md:p-8 pb-32 max-w-2xl mx-auto">
          <div className="text-center py-8 mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-6">
              <User className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Войдите в аккаунт</h1>
            <p className="text-gray-500">
              Введите токен VK для доступа к музыке
            </p>
          </div>

          {/* VK Token Form */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-gray-200 dark:border-neutral-800">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">VK Музыка</h2>
                <p className="text-gray-500 text-sm">
                  Для доступа к музыке VK нужен токен Kate Mobile
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Токен VK (Kate Mobile)
                </label>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={vkToken}
                    onChange={(e) => {
                      setVkToken(e.target.value);
                      setSaveStatus('idle');
                    }}
                    placeholder="Вставьте токен сюда..."
                    className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-neutral-800 rounded-xl border-2 border-transparent focus:border-orange-500 focus:outline-none transition-colors font-mono text-sm"
                  />
                  <button
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {saveStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errorMessage}
                </div>
              )}
              {saveStatus === 'success' && (
                <div className="flex items-center gap-2 text-green-500 text-sm">
                  <Check className="w-4 h-4" />
                  Токен сохранён! Перезагрузите страницу.
                </div>
              )}

              <button
                onClick={handleSaveVKToken}
                className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all"
              >
                Войти с токеном VK
              </button>

              <div className="text-center">
                <a
                  href="https://vkhost.github.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-orange-500 hover:underline"
                >
                  Как получить токен VK?
                </a>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const stats = [
    { icon: Heart, label: 'Избранное', value: String(favorites.length), href: '/favorites', color: 'text-red-500' },
    { icon: ListMusic, label: 'Плейлисты', value: String(playlists.length), href: '/playlists', color: 'text-purple-500' },
    { icon: Clock, label: 'История', value: String(history.length), href: '/history', color: 'text-blue-500' },
  ];

  const menuItems = [
    { icon: Heart, label: 'Избранное', href: '/favorites' },
    { icon: ListMusic, label: 'Мои плейлисты', href: '/playlists' },
    { icon: Clock, label: 'История', href: '/history' },
    { icon: Disc3, label: 'Загрузки', href: '#', badge: 'Скоро' },
  ];

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
              </div>
              <p className="text-white/80 mb-4">
                {source} • ID: {user.id}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                  <Music className="w-4 h-4 inline mr-1" />
                  Цитрус
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
                {'badge' in item && item.badge && (
                  <span className="px-2 py-0.5 bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-full text-xs font-medium flex items-center gap-1">
                    <Construction className="w-3 h-3" />
                    {item.badge}
                  </span>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          ))}
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 mb-6 border border-gray-200 dark:border-neutral-800">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Уведомления
          </h2>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-800 rounded-2xl">
            <div>
              <p className="font-medium">Push-уведомления</p>
              <p className="text-sm text-gray-500">Новые релизы и рекомендации</p>
              {permissionStatus === 'denied' && (
                <p className="text-xs text-red-500 mt-1">
                  Уведомления заблокированы в браузере
                </p>
              )}
            </div>
            <button
              onClick={handleToggleNotifications}
              disabled={notificationLoading || permissionStatus === 'not-supported'}
              className={`w-14 h-8 rounded-full transition-colors disabled:opacity-50 ${
                notificationSettings.pushEnabled ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform mx-1 ${
                notificationSettings.pushEnabled ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
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
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-green-500/20 text-green-600 rounded-full text-sm font-medium">
                    Подключено
                  </span>
                  <button
                    onClick={handleClearVK}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Отключить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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
              <div className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                    <Music className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium">VK не подключён</span>
                </div>
                <p className="text-sm text-gray-500">
                  Введите токен VK в разделе ниже для доступа к музыке
                </p>
              </div>
            )}
          </div>
        </div>

        {/* VK Token Settings */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-gray-200 dark:border-neutral-800 mb-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Key className="w-5 h-5" />
            Токен VK
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Токен Kate Mobile
              </label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={vkToken}
                  onChange={(e) => {
                    setVkToken(e.target.value);
                    setSaveStatus('idle');
                  }}
                  placeholder="Вставьте токен сюда..."
                  className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-neutral-800 rounded-xl border-2 border-transparent focus:border-orange-500 focus:outline-none transition-colors font-mono text-sm"
                />
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {saveStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                {errorMessage}
              </div>
            )}
            {saveStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-500 text-sm">
                <Check className="w-4 h-4" />
                Токен сохранён!
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSaveVKToken}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all"
              >
                Сохранить токен
              </button>
              {vkToken && (
                <button
                  onClick={() => {
                    setVkToken('');
                    setSaveStatus('idle');
                  }}
                  className="px-6 py-3 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Очистить
                </button>
              )}
            </div>

            <p className="text-sm text-gray-500">
              <a
                href="https://vkhost.github.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500 hover:underline"
              >
                Как получить токен VK?
              </a>
            </p>
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
