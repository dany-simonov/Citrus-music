/**
 * Страница поиска - Apple/Microsoft Style
 * @module app/search/page
 */

'use client';

import { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout';
import { useAuthStore } from '@/store/auth';
import { useVKSearch } from '@/hooks/use-vk-api';
import { useYandexSearch } from '@/hooks/use-yandex-api';
import { TrackList } from '@/components/track';
import { transformVKAudiosToTracks } from '@/lib/transformers';
import { debounce } from '@/lib/utils';
import { Search as SearchIcon, Loader2, Music, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function SearchPage() {
  const { isAuthenticated, vkUser, yandexUser } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeSource, setActiveSource] = useState<'all' | 'vk' | 'yandex'>('all');

  const { data: vkResults, isLoading: vkLoading, isFetching: vkFetching } = useVKSearch(
    debouncedQuery && (activeSource === 'all' || activeSource === 'vk') && vkUser ? debouncedQuery : ''
  );
  
  const { data: yandexResults, isLoading: yandexLoading, isFetching: yandexFetching } = useYandexSearch(
    debouncedQuery && (activeSource === 'all' || activeSource === 'yandex') && yandexUser ? debouncedQuery : ''
  );

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query: unknown) => {
      setDebouncedQuery(query as string);
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const vkTracks = vkResults ? transformVKAudiosToTracks(vkResults.items) : [];
  const isLoading = vkLoading || yandexLoading;
  const isFetching = vkFetching || yandexFetching;

  return (
    <MainLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Поиск</h1>
          <p className="text-gray-500 dark:text-gray-400">Найдите любимую музыку</p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-3xl">
          <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Поиск треков, артистов, альбомов..."
            className="w-full pl-14 pr-14 py-5 text-lg bg-gray-100/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-neutral-700/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
            autoFocus
          />
          {isFetching && (
            <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-orange-500 animate-spin" />
          )}
        </div>

        {/* Source tabs */}
        {isAuthenticated && (vkUser || yandexUser) && debouncedQuery && (
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSource('all')}
              className={`px-5 py-2.5 rounded-2xl font-medium transition-all ${
                activeSource === 'all'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700'
              }`}
            >
              Все источники
            </button>
            {vkUser && (
              <button
                onClick={() => setActiveSource('vk')}
                className={`px-5 py-2.5 rounded-2xl font-medium transition-all ${
                  activeSource === 'vk'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700'
                }`}
              >
                ВКонтакте
              </button>
            )}
            {yandexUser && (
              <button
                onClick={() => setActiveSource('yandex')}
                className={`px-5 py-2.5 rounded-2xl font-medium transition-all ${
                  activeSource === 'yandex'
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                    : 'bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700'
                }`}
              >
                Яндекс Музыка
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {!isAuthenticated ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-3xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-6">
              <Music className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-xl font-semibold mb-2">Войдите, чтобы искать музыку</p>
            <p className="text-gray-500 mb-6">
              Подключите VK или Яндекс для доступа к поиску
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Войти
            </Link>
          </div>
        ) : !debouncedQuery ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-3xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-6">
              <SearchIcon className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-2xl font-bold mb-2">Найдите свою музыку</p>
            <p className="text-gray-500">
              Введите название трека или имя исполнителя
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
            <p className="text-gray-500">Ищем музыку...</p>
          </div>
        ) : vkTracks.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Найдено {vkResults?.count || 0} результатов для "<span className="font-medium text-black dark:text-white">{debouncedQuery}</span>"
              </p>
            </div>
            <TrackList tracks={vkTracks} showIndex={false} />
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-3xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-6">
              <Music className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-2xl font-bold mb-2">Ничего не найдено</p>
            <p className="text-gray-500">
              Попробуйте изменить поисковый запрос
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
