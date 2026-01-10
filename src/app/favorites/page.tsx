/**
 * Страница избранного - VK треки + система лайков
 * @module app/favorites/page
 */

'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/auth';
import { useHistoryStore } from '@/store/history';
import { useFavoritesStore } from '@/store/favorites';
import { TrackItem } from '@/components/track/track-item';
import { Tooltip } from '@/components/ui/tooltip';
import { vkApiService } from '@/services/vk';
import { usePlayerStore } from '@/store/player';
import { MainLayout } from '@/components/layout';
import type { Track } from '@/types/audio';
import { MusicSource } from '@/types/audio';
import { getVKAudioCover } from '@/lib/cover-utils';
import { 
  Heart, 
  Loader2,
  Music2,
  Play,
  Shuffle,
  Search,
  X,
  RefreshCw,
  History,
  Plus,
  Minus
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

type TabType = 'tracks' | 'history';

export default function FavoritesPage() {
  const { vkTokens, yandexTokens } = useAuthStore();
  const { playPlaylist } = usePlayerStore();
  const { addToHistory } = useHistoryStore();
  const { 
    favorites, 
    actionsHistory,
    unreadActionsCount,
    isInitialized,
    bulkAddToFavorites,
    markHistoryAsRead,
    isLoading: storeLoading 
  } = useFavoritesStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('tracks');
  const [isLoadingVK, setIsLoadingVK] = useState(false);
  const [vkLoadProgress, setVkLoadProgress] = useState({ loaded: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const isLoadingRef = useRef(false);

  const isVKConnected = !!vkTokens?.accessToken;
  const isYandexConnected = !!yandexTokens?.accessToken;
  const hasAnyConnection = isVKConnected || isYandexConnected;

  // Загружаем VK треки при первом входе (если store ещё не инициализирован)
  useEffect(() => {
    const loadVKTracks = async () => {
      if (!isVKConnected || isLoadingRef.current || isInitialized) return;
      isLoadingRef.current = true;
      
      setIsLoadingVK(true);
      setError(null);
      
      try {
        const allTracks: Track[] = [];
        
        // Первый запрос
        const firstResponse = await vkApiService.getAudio({ count: 100, offset: 0 });
        setVkLoadProgress({ loaded: firstResponse.items.length, total: firstResponse.count });
        
        firstResponse.items.forEach((item) => {
          allTracks.push({
            id: `vk_${item.id}`,
            title: item.title,
            artist: item.artist,
            duration: item.duration,
            coverUrl: getVKAudioCover(item),
            audioUrl: item.url,
            source: MusicSource.VK,
            isAvailable: !!item.url,
          });
        });
        
        // Сразу добавляем первую порцию
        bulkAddToFavorites(allTracks);
        
        // Загружаем остальные
        if (firstResponse.count > 100) {
          const totalPages = Math.ceil(firstResponse.count / 100);
          
          for (let page = 1; page < totalPages; page++) {
            try {
              const response = await vkApiService.getAudio({ 
                count: 100, 
                offset: page * 100 
              });
              
              const pageTracks: Track[] = response.items.map((item) => ({
                id: `vk_${item.id}`,
                title: item.title,
                artist: item.artist,
                duration: item.duration,
                coverUrl: getVKAudioCover(item),
                audioUrl: item.url,
                source: MusicSource.VK,
                isAvailable: !!item.url,
              }));
              
              allTracks.push(...pageTracks);
              bulkAddToFavorites(pageTracks);
              setVkLoadProgress({ loaded: allTracks.length, total: firstResponse.count });
              
              await new Promise(resolve => setTimeout(resolve, 300));
            } catch (err) {
              console.error(`Error loading page ${page}:`, err);
            }
          }
        }
        
        setIsLoadingVK(false);
      } catch (err) {
        console.error('Failed to load VK audio:', err);
        setError(err instanceof Error ? err.message : 'Ошибка загрузки треков');
        setIsLoadingVK(false);
      }
    };
    
    loadVKTracks();
  }, [isVKConnected, isInitialized, bulkAddToFavorites]);

  // Фильтрация
  const filteredFavorites = useMemo(() => {
    if (!searchQuery.trim()) return favorites;
    
    const query = searchQuery.toLowerCase().trim();
    return favorites.filter(track => 
      track.title.toLowerCase().includes(query) ||
      track.artist.toLowerCase().includes(query)
    );
  }, [favorites, searchQuery]);

  const handlePlayAll = useCallback(() => {
    if (filteredFavorites.length > 0) {
      playPlaylist(filteredFavorites, 0);
      addToHistory(filteredFavorites[0]);
    }
  }, [filteredFavorites, playPlaylist, addToHistory]);

  const handleShuffle = useCallback(() => {
    if (filteredFavorites.length > 0) {
      const shuffled = [...filteredFavorites].sort(() => Math.random() - 0.5);
      playPlaylist(shuffled, 0);
      addToHistory(shuffled[0]);
    }
  }, [filteredFavorites, playPlaylist, addToHistory]);

  const handleTrackClick = useCallback((track: Track, index: number) => {
    playPlaylist(filteredFavorites, index);
    addToHistory(track);
  }, [filteredFavorites, playPlaylist, addToHistory]);

  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  const isLoading = isLoadingVK || storeLoading;

  return (
    <MainLayout>
      <div className="p-4 md:p-8 pb-32">
        {/* Header with gradient */}
        <div className="relative rounded-2xl md:rounded-3xl bg-gradient-to-br from-pink-500 via-red-500 to-orange-500 p-6 md:p-8 mb-6 md:mb-8 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 md:w-96 h-48 md:h-96 rounded-full bg-white blur-3xl" />
          </div>
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end gap-4 md:gap-6">
            <div className="w-24 h-24 md:w-40 md:h-40 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl mx-auto sm:mx-0">
              <Heart className="w-12 h-12 md:w-20 md:h-20 text-white fill-white" />
            </div>
            <div className="flex-1 text-white text-center sm:text-left pb-2">
              <p className="text-xs md:text-sm font-medium opacity-80 mb-1">Коллекция</p>
              <h1 className="text-2xl md:text-4xl font-bold mb-2">Избранное</h1>
              <p className="opacity-80 text-sm md:text-base">
                {favorites.length} треков
                {isLoadingVK && vkLoadProgress.total > 0 && (
                  <span className="ml-2 text-xs opacity-70">
                    (загрузка {vkLoadProgress.loaded} / {vkLoadProgress.total})
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Play buttons */}
          {favorites.length > 0 && (
            <div className="relative z-10 flex gap-3 mt-6 justify-center sm:justify-start">
              <Tooltip content="Воспроизвести все треки" position="bottom">
                <button 
                  onClick={handlePlayAll}
                  className="px-6 md:px-8 py-3 md:py-4 bg-white text-black rounded-full font-semibold shadow-lg hover:scale-105 transition-transform flex items-center gap-2 text-sm md:text-base"
                >
                  <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                  Слушать
                </button>
              </Tooltip>
              <Tooltip content="Перемешать и воспроизвести" position="bottom">
                <button 
                  onClick={handleShuffle}
                  className="px-5 md:px-6 py-3 md:py-4 bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold hover:bg-white/30 transition-colors flex items-center gap-2 text-sm md:text-base"
                >
                  <Shuffle className="w-4 h-4 md:w-5 md:h-5" />
                  Перемешать
                </button>
              </Tooltip>
              <Tooltip content="Обновить список" position="bottom">
                <button 
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="p-3 md:p-4 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </Tooltip>
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
            <p className="text-gray-500 mb-6 md:mb-8 max-w-md text-sm md:text-base px-4">
              Войдите через VK или Яндекс, чтобы увидеть избранные треки
            </p>
            <Link
              href="/login"
              className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl md:rounded-2xl font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all text-sm md:text-base"
            >
              Войти
            </Link>
          </div>
        )}

        {/* Search + Tabs в одной строке */}
        {hasAnyConnection && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            {/* Search */}
            {favorites.length > 0 && (
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск треков..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 bg-gray-100 dark:bg-neutral-800 rounded-xl md:rounded-2xl text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                />
                {searchQuery && (
                  <Tooltip content="Очистить поиск">
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </Tooltip>
                )}
              </div>
            )}
            
            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-gray-100 dark:bg-neutral-800 rounded-xl">
              <Tooltip content="Все избранные треки">
                <button
                  onClick={() => setActiveTab('tracks')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all text-sm flex items-center gap-2 ${
                    activeTab === 'tracks'
                      ? 'bg-white dark:bg-neutral-700 shadow-sm text-black dark:text-white'
                      : 'text-gray-500 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  Треки
                </button>
              </Tooltip>
              <Tooltip content="История добавлений и удалений">
                <button
                  onClick={() => {
                    setActiveTab('history');
                    markHistoryAsRead(); // Отмечаем как прочитанное при переходе
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all text-sm flex items-center gap-2 ${
                    activeTab === 'history'
                      ? 'bg-white dark:bg-neutral-700 shadow-sm text-black dark:text-white'
                      : 'text-gray-500 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <History className="w-4 h-4" />
                  История
                  {unreadActionsCount > 0 && (
                    <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      {unreadActionsCount > 99 ? '99+' : unreadActionsCount}
                    </span>
                  )}
                </button>
              </Tooltip>
            </div>
          </div>
        )}

        {/* Tracks Tab */}
        {activeTab === 'tracks' && hasAnyConnection && (
          <>
            {isLoading && favorites.length === 0 && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-6 p-4 md:p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl md:rounded-2xl">
                <p className="text-red-600 dark:text-red-400 text-sm md:text-base mb-3">
                  {error}
                </p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Повторить попытку
                </button>
              </div>
            )}

            {/* Favorites list */}
            {!isLoading || favorites.length > 0 ? (
              <>
                {filteredFavorites.length > 0 ? (
                  <div className="space-y-0.5 md:space-y-1">
                    {filteredFavorites.map((track, index) => (
                      <TrackItem
                        key={track.id}
                        track={track}
                        index={index}
                        showIndex
                        onClick={() => handleTrackClick(track, index)}
                      />
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Ничего не найдено</h2>
                    <p className="text-gray-500">
                      Попробуйте изменить поисковый запрос
                    </p>
                  </div>
                ) : !error && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Пока пусто</h2>
                    <p className="text-gray-500 mb-4">
                      Нажмите ❤️ на любом треке, чтобы добавить его в избранное
                    </p>
                  </div>
                )}
              </>
            ) : null}
          </>
        )}

        {/* History Tab */}
        {activeTab === 'history' && hasAnyConnection && (
          <div className="space-y-2">
            {actionsHistory.length > 0 ? (
              actionsHistory.map((action, index) => (
                <div 
                  key={`${action.track.id}-${index}`}
                  className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-neutral-800/50 rounded-xl"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    action.type === 'add' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600' 
                      : 'bg-red-100 dark:bg-red-900/30 text-red-500'
                  }`}>
                    {action.type === 'add' ? <Plus className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{action.track.title}</p>
                    <p className="text-sm text-gray-500 truncate">{action.track.artist}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(action.timestamp), { addSuffix: true, locale: ru })}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                  <History className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold mb-2">История пуста</h2>
                <p className="text-gray-500">
                  Здесь будут отображаться добавления и удаления треков
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
