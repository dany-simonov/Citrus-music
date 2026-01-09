/**
 * Страница настроек
 * @module app/settings/page
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { MusicSource } from '@/types/audio';
import { 
  Settings, 
  Key, 
  ExternalLink, 
  Check, 
  AlertCircle,
  Eye,
  EyeOff,
  Trash2,
  Music,
  User,
  LogOut
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function SettingsPage() {
  const { 
    vkTokens, 
    yandexTokens, 
    vkUser, 
    yandexUser,
    setVKTokens,
    clearVKAuth,
    clearYandexAuth 
  } = useAuthStore();
  
  const [vkToken, setVkToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Загружаем сохранённый токен при монтировании
  useEffect(() => {
    if (vkTokens?.accessToken) {
      setVkToken(vkTokens.accessToken);
    }
  }, [vkTokens]);

  const handleSaveVKToken = async () => {
    if (!vkToken.trim()) {
      setSaveStatus('error');
      setErrorMessage('Введите токен');
      return;
    }

    try {
      // Проверяем токен запросом к API через прокси
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

      const user = data.response[0];

      // Сохраняем токен
      setVKTokens({
        accessToken: vkToken,
        expiresIn: 0, // Kate Mobile токены не истекают
        userId: user.id,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 год
      });

      // Обновляем информацию о пользователе в store
      useAuthStore.getState().setVKUser({
        id: String(user.id),
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.photo_200,
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

  const handleClearYandex = () => {
    clearYandexAuth();
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-3xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-neutral-800 dark:to-neutral-900 flex items-center justify-center">
            <Settings className="w-7 h-7 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Настройки</h1>
            <p className="text-gray-500">Управление аккаунтами и токенами</p>
          </div>
        </div>

        {/* VK Token Section */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 mb-6 border border-gray-200 dark:border-neutral-800">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">VK Музыка</h2>
              <p className="text-gray-500 text-sm">
                Для доступа к музыке VK нужен токен Kate Mobile
              </p>
            </div>
            {vkUser && (
              <div className="flex items-center gap-3 px-4 py-2 bg-green-500/10 rounded-xl">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-green-600 dark:text-green-400 font-medium">
                  Подключено
                </span>
              </div>
            )}
          </div>

          {/* Connected user info */}
          {vkUser && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-neutral-800 rounded-2xl mb-6">
              {vkUser.avatarUrl ? (
                <Image
                  src={vkUser.avatarUrl}
                  alt={vkUser.firstName}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold">{vkUser.firstName} {vkUser.lastName}</p>
                <p className="text-sm text-gray-500">VK ID: {vkUser.id}</p>
              </div>
              <button
                onClick={handleClearVK}
                className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                title="Отключить"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Token input */}
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
                  className="w-full px-4 py-3 pr-24 bg-gray-100 dark:bg-neutral-800 rounded-xl border-2 border-transparent focus:border-orange-500 focus:outline-none transition-colors font-mono text-sm"
                />
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Status messages */}
            {saveStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                {errorMessage}
              </div>
            )}
            {saveStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-500 text-sm">
                <Check className="w-4 h-4" />
                Токен сохранён и проверен!
              </div>
            )}

            {/* Actions */}
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
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-500/10 rounded-2xl">
            <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
              <Key className="w-4 h-4" />
              Как получить токен?
            </h3>
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-decimal list-inside">
              <li>
                Перейдите на{' '}
                <a
                  href="https://vkhost.github.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline inline-flex items-center gap-1"
                >
                  vkhost.github.io
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>Нажмите <strong>"Kate Mobile"</strong></li>
              <li>Авторизуйтесь в VK</li>
              <li>Скопируйте токен из адресной строки (после <code className="bg-gray-200 dark:bg-neutral-700 px-1 rounded">access_token=</code>)</li>
              <li>Вставьте токен в поле выше</li>
            </ol>
            <p className="text-xs text-gray-500 mt-3">
              ⚠️ Никому не передавайте свой токен! Он даёт полный доступ к вашему аккаунту VK.
            </p>
          </div>
        </div>

        {/* Yandex Section */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-gray-200 dark:border-neutral-800">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center flex-shrink-0">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">Яндекс</h2>
              <p className="text-gray-500 text-sm">
                Авторизация через Яндекс ID
              </p>
            </div>
            {yandexUser && (
              <div className="flex items-center gap-3 px-4 py-2 bg-green-500/10 rounded-xl">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-green-600 dark:text-green-400 font-medium">
                  Подключено
                </span>
              </div>
            )}
          </div>

          {yandexUser ? (
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-neutral-800 rounded-2xl">
              {yandexUser.avatarUrl ? (
                <Image
                  src={yandexUser.avatarUrl}
                  alt={yandexUser.firstName}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold">{yandexUser.firstName}</p>
                <p className="text-sm text-gray-500">Яндекс ID: {yandexUser.id}</p>
              </div>
              <button
                onClick={handleClearYandex}
                className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                title="Отключить"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Войти через Яндекс
            </Link>
          )}

          <p className="text-xs text-gray-500 mt-4">
            ℹ️ Яндекс Музыка API закрыт для сторонних приложений. Авторизация нужна только для идентификации.
          </p>
        </div>
      </div>
    </div>
  );
}
