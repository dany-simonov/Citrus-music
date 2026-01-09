/**
 * Страница истории прослушивания
 * @module app/history/page
 */

'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { TrackItem } from '@/components/track/track-item';
import { 
  Clock, 
  Loader2,
  Music2,
  Trash2,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

type SourceTab = 'all' | 'vk' | 'yandex';

export default function HistoryPage() {
  const { vkTokens, yandexTokens } = useAuthStore();
  const [activeSource, setActiveSource] = useState<SourceTab>('all');

  const isVKConnected = !!vkTokens?.accessToken;
  const isYandexConnected = !!yandexTokens?.accessToken;
  const hasAnyConnection = isVKConnected || isYandexConnected;

  // TODO: Implement history fetching/tracking
  const isLoading = false;
  const history: any[] = [];

  const sourceTabs = [
    { id: 'all' as SourceTab, label: 'Все' },
    ...(isVKConnected ? [{ id: 'vk' as SourceTab, label: 'VK' }] : []),
    ...(isYandexConnected ? [{ id: 'yandex' as SourceTab, label: 'Яндекс' }] : []),
  ];

  // Group history by date
  const groupedHistory: { [key: string]: any[] } = {};
  history.forEach((item) => {
    const date = new Date(item.playedAt).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    if (!groupedHistory[date]) {
      groupedHistory[date] = [];
    }
    groupedHistory[date].push(item);
  });

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">История</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {history.length} прослушанных треков
              </p>
            </div>
          </div>

          {history.length > 0 && (
            <button className="px-5 py-3 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-2xl font-medium transition-colors flex items-center gap-2 text-red-500">
              <Trash2 className="w-5 h-5" />
              Очистить
            </button>
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
              Войдите через VK или Яндекс, чтобы отслеживать историю прослушивания
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

        {/* History list */}
        {hasAnyConnection && !isLoading && (
          <>
            {Object.keys(groupedHistory).length > 0 ? (
              <div className="space-y-8">
                {Object.entries(groupedHistory).map(([date, tracks]) => (
                  <div key={date}>
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <h2 className="text-sm font-medium text-gray-500">{date}</h2>
                    </div>
                    <div className="space-y-1">
                      {tracks.map((track, index) => (
                        <TrackItem
                          key={`${track.id}-${index}`}
                          track={track}
                          index={index + 1}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold mb-2">История пуста</h2>
                <p className="text-gray-500">
                  Начните слушать музыку, и она появится здесь
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
