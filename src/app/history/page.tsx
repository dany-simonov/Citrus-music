/**
 * Страница истории прослушивания
 * @module app/history/page
 */

'use client';

import { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/auth';
import { useHistoryStore, HistoryItem } from '@/store/history';
import { usePlayerStore } from '@/store/player';
import { TrackItem } from '@/components/track/track-item';
import { MainLayout } from '@/components/layout';
import { 
  Clock, 
  Music2,
  Trash2,
  Calendar,
  TrendingUp,
  Search,
  X
} from 'lucide-react';
import Link from 'next/link';

type ViewMode = 'recent' | 'mostPlayed';

export default function HistoryPage() {
  const { vkTokens, yandexTokens } = useAuthStore();
  const { items, clearHistory, removeFromHistory, getMostPlayed } = useHistoryStore();
  const { playPlaylist } = usePlayerStore();
  const [viewMode, setViewMode] = useState<ViewMode>('recent');
  const [searchQuery, setSearchQuery] = useState('');

  const isVKConnected = !!vkTokens?.accessToken;
  const isYandexConnected = !!yandexTokens?.accessToken;
  const hasAnyConnection = isVKConnected || isYandexConnected;

  // Группировка истории по дате
  const groupedHistory = useMemo(() => {
    const filteredItems = searchQuery.trim() 
      ? items.filter(item => 
          item.track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.track.artist.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : items;

    const groups: { [key: string]: HistoryItem[] } = {};
    
    filteredItems.forEach((item) => {
      const date = new Date(item.playedAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let dateKey: string;
      
      if (date.toDateString() === today.toDateString()) {
        dateKey = 'Сегодня';
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = 'Вчера';
      } else {
        dateKey = date.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
        });
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });
    
    return groups;
  }, [items, searchQuery]);

  // Самые прослушиваемые треки
  const mostPlayed = useMemo(() => {
    const filtered = searchQuery.trim()
      ? getMostPlayed(50).filter(item =>
          item.track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.track.artist.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : getMostPlayed(50);
    return filtered;
  }, [getMostPlayed, searchQuery]);

  const handlePlayTrack = (item: HistoryItem, allItems: HistoryItem[]) => {
    const tracks = allItems.map(i => i.track);
    const index = allItems.findIndex(i => i.track.id === item.track.id);
    playPlaylist(tracks, index);
  };

  const handleRemoveTrack = (trackId: string) => {
    removeFromHistory(trackId);
  };

  const formatPlayCount = (count: number) => {
    if (count === 1) return '1 прослушивание';
    if (count < 5) return `${count} прослушивания`;
    return `${count} прослушиваний`;
  };

  return (
    <MainLayout>
      <div className="p-4 md:p-8 pb-32">
        {/* Header with gradient - как у избранного */}
        <div className="relative rounded-2xl md:rounded-3xl bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 p-6 md:p-8 mb-6 md:mb-8 overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 md:w-96 h-48 md:h-96 rounded-full bg-white blur-3xl" />
          </div>
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end gap-4 md:gap-6">
            <div className="w-24 h-24 md:w-40 md:h-40 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl mx-auto sm:mx-0">
              <Clock className="w-12 h-12 md:w-20 md:h-20 text-white" />
            </div>
            <div className="flex-1 text-white text-center sm:text-left pb-2">
              <p className="text-xs md:text-sm font-medium opacity-80 mb-1">Коллекция</p>
              <h1 className="text-2xl md:text-4xl font-bold mb-2">История</h1>
              <p className="opacity-80 text-sm md:text-base">
                {items.length} прослушанных треков
              </p>
            </div>
          </div>

          {/* Clear button */}
          {items.length > 0 && (
            <div className="relative z-10 flex gap-3 mt-6 justify-center sm:justify-start">
              <button 
                onClick={clearHistory}
                className="px-5 md:px-6 py-3 md:py-4 bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold hover:bg-white/30 transition-colors flex items-center gap-2 text-sm md:text-base"
              >
                <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                Очистить историю
              </button>
            </div>
          )}
        </div>

        {/* Not connected state */}
        {!hasAnyConnection && (
          <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mb-4 md:mb-6">
              <Music2 className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">Подключите музыку</h2>
            <p className="text-gray-500 mb-6 md:mb-8 max-w-md px-4 text-sm md:text-base">
              Войдите через VK или Яндекс, чтобы отслеживать историю прослушивания
            </p>
            <Link
              href="/login"
              className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl md:rounded-2xl font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all text-sm md:text-base"
            >
              Войти
            </Link>
          </div>
        )}

        {/* Search and view mode */}
        {hasAnyConnection && items.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск в истории..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-gray-100 dark:bg-neutral-800 rounded-xl md:rounded-2xl text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* View mode tabs */}
            <div className="flex gap-2 p-1.5 bg-gray-100 dark:bg-neutral-800 rounded-xl md:rounded-2xl w-fit">
              <button
                onClick={() => setViewMode('recent')}
                className={`px-4 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl font-medium transition-all flex items-center gap-2 text-sm ${
                  viewMode === 'recent'
                    ? 'bg-white dark:bg-neutral-700 shadow-sm text-black dark:text-white'
                    : 'text-gray-500 hover:text-black dark:hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Недавние
              </button>
              <button
                onClick={() => setViewMode('mostPlayed')}
                className={`px-4 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl font-medium transition-all flex items-center gap-2 text-sm ${
                  viewMode === 'mostPlayed'
                    ? 'bg-white dark:bg-neutral-700 shadow-sm text-black dark:text-white'
                    : 'text-gray-500 hover:text-black dark:hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Популярные
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {hasAnyConnection && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mb-4 md:mb-6">
              <Clock className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">История пуста</h2>
            <p className="text-gray-500 max-w-md px-4 text-sm md:text-base">
              Начните слушать музыку, и она появится здесь
            </p>
          </div>
        )}

        {/* Recent view */}
        {hasAnyConnection && viewMode === 'recent' && items.length > 0 && (
          <div className="space-y-6">
            {Object.keys(groupedHistory).length === 0 && searchQuery ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold mb-2">Ничего не найдено</h2>
                <p className="text-gray-500">
                  Попробуйте изменить поисковый запрос
                </p>
              </div>
            ) : (
              Object.entries(groupedHistory).map(([date, dateItems]) => (
                <div key={date}>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                    {date}
                  </h3>
                  <div className="space-y-0.5 md:space-y-1">
                    {dateItems.map((item) => (
                      <TrackItem
                        key={`${item.track.id}-${item.playedAt}`}
                        track={item.track}
                        onClick={() => handlePlayTrack(item, dateItems)}
                        onRemove={() => handleRemoveTrack(item.track.id)}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Most played view */}
        {hasAnyConnection && viewMode === 'mostPlayed' && items.length > 0 && (
          <div className="space-y-0.5 md:space-y-1">
            {mostPlayed.length === 0 && searchQuery ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold mb-2">Ничего не найдено</h2>
                <p className="text-gray-500">
                  Попробуйте изменить поисковый запрос
                </p>
              </div>
            ) : (
              mostPlayed.map((item, index) => (
                <div key={item.track.id} className="flex items-center gap-2">
                  <span className="w-6 text-center text-sm font-bold text-gray-400">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <TrackItem
                      track={item.track}
                      onClick={() => handlePlayTrack(item, mostPlayed)}
                      onRemove={() => handleRemoveTrack(item.track.id)}
                    />
                  </div>
                  <span className="text-xs text-gray-400 px-2 hidden sm:block">
                    {formatPlayCount(item.playCount)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
