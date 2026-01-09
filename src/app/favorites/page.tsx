/**
 * Страница избранного
 * @module app/favorites/page
 */

'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { TrackItem } from '@/components/track/track-item';
import { 
  Heart, 
  Loader2,
  Music2,
  Play,
  Shuffle
} from 'lucide-react';
import Link from 'next/link';

type SourceTab = 'all' | 'vk' | 'yandex';

export default function FavoritesPage() {
  const { vkTokens, yandexTokens } = useAuthStore();
  const [activeSource, setActiveSource] = useState<SourceTab>('all');

  const isVKConnected = !!vkTokens?.accessToken;
  const isYandexConnected = !!yandexTokens?.accessToken;
  const hasAnyConnection = isVKConnected || isYandexConnected;

  // TODO: Implement favorites fetching from both services
  const isLoading = false;
  const favorites: any[] = [];

  const sourceTabs = [
    { id: 'all' as SourceTab, label: 'Все' },
    ...(isVKConnected ? [{ id: 'vk' as SourceTab, label: 'VK' }] : []),
    ...(isYandexConnected ? [{ id: 'yandex' as SourceTab, label: 'Яндекс' }] : []),
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        {/* Header with gradient */}
        <div className="relative rounded-3xl bg-gradient-to-br from-pink-500 via-red-500 to-orange-500 p-8 mb-8 overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white blur-3xl" />
          </div>
          
          <div className="relative z-10 flex items-end gap-6">
            <div className="w-40 h-40 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl">
              <Heart className="w-20 h-20 text-white fill-white" />
            </div>
            <div className="flex-1 text-white pb-2">
              <p className="text-sm font-medium opacity-80 mb-1">Коллекция</p>
              <h1 className="text-4xl font-bold mb-2">Избранное</h1>
              <p className="opacity-80">
                {favorites.length} треков
              </p>
            </div>
          </div>

          {/* Play buttons */}
          {favorites.length > 0 && (
            <div className="relative z-10 flex gap-3 mt-6">
              <button className="px-8 py-4 bg-white text-black rounded-full font-semibold shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                <Play className="w-5 h-5 fill-current" />
                Слушать
              </button>
              <button className="px-6 py-4 bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold hover:bg-white/30 transition-colors flex items-center gap-2">
                <Shuffle className="w-5 h-5" />
                Перемешать
              </button>
            </div>
          )}
        </div>

        {/* Not connected state */}
        {!hasAnyConnection && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mb-6">
              <Music2 className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Подключите музыку</h2>
            <p className="text-gray-500 mb-8 max-w-md">
              Войдите через VK или Яндекс, чтобы увидеть избранные треки
            </p>
            <Link
              href="/login"
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all"
            >
              Войти
            </Link>
          </div>
        )}

        {/* Source tabs */}
        {hasAnyConnection && sourceTabs.length > 1 && (
          <div className="flex gap-2 mb-6 p-1.5 bg-gray-100 dark:bg-neutral-800 rounded-2xl w-fit">
            {sourceTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSource(tab.id)}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                  activeSource === tab.id
                    ? 'bg-white dark:bg-neutral-700 shadow-sm text-black dark:text-white'
                    : 'text-gray-500 hover:text-black dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          </div>
        )}

        {/* Favorites list */}
        {hasAnyConnection && !isLoading && (
          <>
            {favorites.length > 0 ? (
              <div className="space-y-1">
                {favorites.map((track, index) => (
                  <TrackItem
                    key={track.id}
                    track={track}
                    index={index + 1}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold mb-2">Пока пусто</h2>
                <p className="text-gray-500">
                  Добавляйте треки в избранное, чтобы они появились здесь
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
