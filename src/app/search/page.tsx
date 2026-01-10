/**
 * Страница поиска - Apple/Microsoft Style
 * @module app/search/page
 */

'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { useAuthStore } from '@/store/auth';
import { useVKSearch } from '@/hooks/use-vk-api';
import { TrackItem } from '@/components/track/track-item';
import { usePlayerStore } from '@/store/player';
import { useHistoryStore } from '@/store/history';
import { transformVKAudiosToTracks } from '@/lib/transformers';
import { debounce } from '@/lib/utils';
import type { Track } from '@/types/audio';
import { 
  Search as SearchIcon, 
  Loader2, 
  Music, 
  X,
  Clock,
  TrendingUp,
  User,
  Mic2
} from 'lucide-react';
import Link from 'next/link';

// Типы поиска
type SearchType = 'all' | 'tracks' | 'artists';

// Интерфейс для истории поиска
interface SearchHistoryItem {
  query: string;
  timestamp: number;
  type: SearchType;
}

// Загрузка истории поиска из localStorage
const loadSearchHistory = (): SearchHistoryItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('citrus_search_history');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Сохранение истории поиска
const saveSearchHistory = (history: SearchHistoryItem[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('citrus_search_history', JSON.stringify(history.slice(0, 20)));
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const { isAuthenticated, vkUser, yandexUser } = useAuthStore();
  const { playPlaylist } = usePlayerStore();
  const { addToHistory } = useHistoryStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(true);
  const [initialQueryProcessed, setInitialQueryProcessed] = useState(false);

  // Загружаем историю при монтировании
  useEffect(() => {
    setSearchHistory(loadSearchHistory());
  }, []);
  
  // Обрабатываем параметры URL (?q=...&auto=1)
  useEffect(() => {
    if (initialQueryProcessed) return;
    
    const queryFromUrl = searchParams.get('q');
    const autoSearch = searchParams.get('auto') === '1';
    
    if (queryFromUrl) {
      setSearchQuery(queryFromUrl);
      if (autoSearch) {
        // Сразу ищем по исполнителю
        setDebouncedQuery(queryFromUrl);
        setSearchType('artists'); // Ищем именно по исполнителю
        setShowHistory(false);
      }
      setInitialQueryProcessed(true);
    }
  }, [searchParams, initialQueryProcessed]);

  // Поиск по VK с опцией performer_only для поиска по артисту
  // Поиск работает для авторизованных пользователей без необходимости vkUser
  const { data: vkResults, isLoading: vkLoading, isFetching: vkFetching } = useVKSearch(
    debouncedQuery && isAuthenticated ? debouncedQuery : '',
    searchType === 'artists' ? { performer_only: 1 } : undefined
  );

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query: unknown) => {
      const q = query as string;
      setDebouncedQuery(q);
      if (q.trim()) {
        setShowHistory(false);
      }
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim()) {
      debouncedSearch(value);
    } else {
      setDebouncedQuery('');
      setShowHistory(true);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setShowHistory(true);
  };

  // Добавить в историю поиска
  const addToSearchHistory = (query: string, type: SearchType) => {
    const newItem: SearchHistoryItem = {
      query,
      timestamp: Date.now(),
      type,
    };
    
    const filtered = searchHistory.filter(item => item.query.toLowerCase() !== query.toLowerCase());
    const newHistory = [newItem, ...filtered].slice(0, 20);
    setSearchHistory(newHistory);
    saveSearchHistory(newHistory);
  };

  // Поиск по истории
  const handleHistoryClick = (item: SearchHistoryItem) => {
    setSearchQuery(item.query);
    setDebouncedQuery(item.query);
    setSearchType(item.type);
    setShowHistory(false);
  };

  // Удалить из истории
  const removeFromHistory = (query: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = searchHistory.filter(item => item.query !== query);
    setSearchHistory(newHistory);
    saveSearchHistory(newHistory);
  };

  // Очистить всю историю
  const clearAllHistory = () => {
    setSearchHistory([]);
    saveSearchHistory([]);
  };

  // При получении результатов сохраняем в историю
  useEffect(() => {
    if (debouncedQuery && vkResults && vkResults.items.length > 0) {
      addToSearchHistory(debouncedQuery, searchType);
    }
  }, [vkResults]);

  const vkTracks = vkResults ? transformVKAudiosToTracks(vkResults.items) : [];
  const isLoading = vkLoading;
  const isFetching = vkFetching;

  // Воспроизвести трек
  const handleTrackClick = useCallback((track: Track, index: number) => {
    playPlaylist(vkTracks, index);
    addToHistory(track);
  }, [vkTracks, playPlaylist, addToHistory]);

  // Популярные запросы (можно кастомизировать)
  const popularSearches = [
    'Playboi Carti',
    'Travis Scott',
    'Kanye West',
    'Drake',
    'The Weeknd',
    'Doja Cat',
  ];

  return (
    <MainLayout>
      <div className="p-4 md:p-8 pb-32">
        {/* Header with gradient */}
        <div className="relative rounded-2xl md:rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 p-6 md:p-8 mb-6 md:mb-8 overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 md:w-96 h-48 md:h-96 rounded-full bg-white blur-3xl" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center">
                <SearchIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div className="text-white">
                <h1 className="text-2xl md:text-4xl font-bold">Поиск</h1>
                <p className="text-white/80 text-sm md:text-base">Найдите любимую музыку</p>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <SearchIcon className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Треки, артисты..."
                className="w-full pl-12 md:pl-14 pr-12 py-4 md:py-5 text-base md:text-lg bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-xl md:rounded-2xl border-0 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all shadow-xl"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              )}
              {isFetching && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-purple-500 animate-spin" />
              )}
            </div>
          </div>
        </div>

        {/* Search type tabs */}
        {isAuthenticated && debouncedQuery && (
          <div className="flex gap-2 mb-6 p-1.5 bg-gray-100 dark:bg-neutral-800 rounded-xl md:rounded-2xl w-fit">
            <button
              onClick={() => setSearchType('all')}
              className={`px-4 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl font-medium transition-all text-sm flex items-center gap-2 ${
                searchType === 'all'
                  ? 'bg-white dark:bg-neutral-700 shadow-sm text-black dark:text-white'
                  : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <Music className="w-4 h-4" />
              Всё
            </button>
            <button
              onClick={() => setSearchType('tracks')}
              className={`px-4 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl font-medium transition-all text-sm flex items-center gap-2 ${
                searchType === 'tracks'
                  ? 'bg-white dark:bg-neutral-700 shadow-sm text-black dark:text-white'
                  : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <Mic2 className="w-4 h-4" />
              Треки
            </button>
            <button
              onClick={() => setSearchType('artists')}
              className={`px-4 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl font-medium transition-all text-sm flex items-center gap-2 ${
                searchType === 'artists'
                  ? 'bg-white dark:bg-neutral-700 shadow-sm text-black dark:text-white'
                  : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              Артисты
            </button>
          </div>
        )}

        {/* Not authenticated */}
        {!isAuthenticated ? (
          <div className="text-center py-12 md:py-20">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4 md:mb-6">
              <Music className="w-10 h-10 md:w-12 md:h-12 text-gray-400" />
            </div>
            <p className="text-lg md:text-xl font-semibold mb-2">Войдите, чтобы искать музыку</p>
            <p className="text-gray-500 mb-6 text-sm md:text-base">
              Подключите VK для доступа к поиску
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-semibold rounded-xl md:rounded-2xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/35 transition-all"
            >
              Войти
            </Link>
          </div>
        ) : showHistory && !debouncedQuery ? (
          /* История поиска и популярное */
          <div className="space-y-8">
            {/* История поиска */}
            {searchHistory.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    Недавние запросы
                  </h2>
                  <button
                    onClick={clearAllHistory}
                    className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                  >
                    Очистить
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.slice(0, 10).map((item, index) => (
                    <div
                      key={`${item.query}-${index}`}
                      className="group flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-xl transition-all cursor-pointer"
                      onClick={() => handleHistoryClick(item)}
                    >
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{item.query}</span>
                      <button
                        onClick={(e) => removeFromHistory(item.query, e)}
                        className="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-all"
                      >
                        <X className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Популярные запросы */}
            <section>
              <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Популярное
              </h2>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((query) => (
                  <button
                    key={query}
                    onClick={() => {
                      setSearchQuery(query);
                      setDebouncedQuery(query);
                      setShowHistory(false);
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-orange-500/10 to-pink-500/10 hover:from-orange-500/20 hover:to-pink-500/20 border border-orange-500/20 rounded-xl text-sm font-medium transition-all"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </section>

            {/* Подсказка */}
            <div className="text-center py-8">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
              </div>
              <p className="text-lg md:text-xl font-bold mb-2">Найдите свою музыку</p>
              <p className="text-gray-500 text-sm md:text-base">
                Введите название трека или имя исполнителя
              </p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="w-10 h-10 md:w-12 md:h-12 animate-spin text-purple-500 mb-4" />
            <p className="text-gray-500">Ищем музыку...</p>
          </div>
        ) : vkTracks.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Найдено {vkResults?.count || 0} результатов для "<span className="font-medium text-black dark:text-white">{debouncedQuery}</span>"
                {searchType === 'artists' && <span className="text-purple-500 ml-1">(по артисту)</span>}
              </p>
            </div>
            <div className="space-y-1">
              {vkTracks.map((track, index) => (
                <TrackItem
                  key={track.id}
                  track={track}
                  index={index}
                  onClick={() => handleTrackClick(track, index)}
                />
              ))}
            </div>
          </div>
        ) : debouncedQuery ? (
          <div className="text-center py-12 md:py-20">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4 md:mb-6">
              <Music className="w-10 h-10 md:w-12 md:h-12 text-gray-400" />
            </div>
            <p className="text-lg md:text-2xl font-bold mb-2">Ничего не найдено</p>
            <p className="text-gray-500 text-sm md:text-base">
              Попробуйте изменить поисковый запрос
            </p>
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
}
