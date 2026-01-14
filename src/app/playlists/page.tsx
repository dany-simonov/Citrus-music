/**
 * Страница плейлистов
 * @module app/playlists/page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth';
import { usePlaylistsStore } from '@/store/playlists';
import { vkApiService } from '@/services/vk';
import { MainLayout } from '@/components/layout';
import { SafeImage } from '@/components/ui/safe-image';
import { 
  ListMusic, 
  Plus, 
  Loader2,
  Music2,
  Disc3,
  RefreshCw,
  AlertCircle,
  X,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type SourceTab = 'all' | 'vk' | 'yandex' | 'my';

interface PlaylistItem {
  id: string;
  title: string;
  cover?: string;
  trackCount?: number;
  source: 'vk' | 'yandex' | 'local';
  ownerId?: number;
  accessKey?: string;
}

export default function PlaylistsPage() {
  const { vkTokens, yandexTokens, isAuthenticated } = useAuthStore();
  const { 
    playlists: userPlaylists, 
    loadPlaylists: loadUserPlaylists, 
    createPlaylist, 
    deletePlaylist, 
    isLoading: userPlaylistsLoading,
    vkPlaylists: cachedVKPlaylists,
    setVKPlaylists,
    isVKPlaylistsCacheValid,
  } = usePlaylistsStore();
  
  const [activeSource, setActiveSource] = useState<SourceTab>('all');
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Модальное окно создания плейлиста
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const isVKConnected = !!vkTokens?.accessToken;
  const isYandexConnected = !!yandexTokens?.accessToken;
  const hasAnyConnection = isVKConnected || isYandexConnected;

  // Загрузка плейлистов из VK
  const loadVKPlaylists = useCallback(async (forceRefresh = false) => {
    if (!isVKConnected) return [];
    
    // Используем кэш если он валиден и не принудительное обновление
    if (!forceRefresh && isVKPlaylistsCacheValid() && cachedVKPlaylists.length > 0) {
      console.log('[Playlists] Using cached VK playlists');
      return cachedVKPlaylists.map(p => ({
        id: `vk_${p.ownerId}_${p.id}`,
        title: p.title,
        cover: p.cover,
        trackCount: p.trackCount,
        source: 'vk' as const,
        ownerId: p.ownerId,
        accessKey: p.accessKey,
      }));
    }
    
    const vkPlaylists: PlaylistItem[] = [];
    
    try {
      console.log('[Playlists] Loading VK playlists from API...');
      const currentUser = await vkApiService.getCurrentUser();
      if (!currentUser?.id) return [];
      
      const vkData = await vkApiService.getPlaylists({ 
        owner_id: currentUser.id,
        count: 100 
      });
      
      if (vkData?.items) {
        const cacheItems: Array<{
          id: string;
          title: string;
          cover?: string;
          trackCount: number;
          ownerId: number;
          accessKey?: string;
        }> = [];
        
        vkData.items.forEach((p) => {
          let cover = p.photo?.photo_600 || 
                      p.photo?.photo_300 || 
                      (p.thumbs && p.thumbs.length > 0 ? (p.thumbs[0].photo_600 || p.thumbs[0].photo_300) : undefined);
          
          vkPlaylists.push({
            id: `vk_${p.owner_id}_${p.id}`,
            title: p.title,
            cover: cover,
            trackCount: p.count,
            source: 'vk',
            ownerId: p.owner_id,
            accessKey: p.access_key,
          });
          
          // Сохраняем в кэш
          cacheItems.push({
            id: String(p.id),
            title: p.title,
            cover: cover,
            trackCount: p.count,
            ownerId: p.owner_id,
            accessKey: p.access_key,
          });
        });
        
        // Сохраняем в store
        setVKPlaylists(cacheItems);
      }
    } catch (err) {
      console.error('Error loading VK playlists:', err);
    }
    
    return vkPlaylists;
  }, [isVKConnected, cachedVKPlaylists, isVKPlaylistsCacheValid, setVKPlaylists]);

  // Загрузка всех плейлистов
  const loadAllPlaylists = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Загружаем пользовательские плейлисты
      await loadUserPlaylists(forceRefresh);
      
      // Загружаем VK плейлисты
      const vkPlaylists = await loadVKPlaylists(forceRefresh);
      
      setPlaylists(vkPlaylists);
    } catch (err: any) {
      console.error('Error loading playlists:', err);
      setError(err.message || 'Ошибка загрузки плейлистов');
    } finally {
      setIsLoading(false);
    }
  }, [loadUserPlaylists, loadVKPlaylists]);

  // Загружаем при монтировании (без принудительного обновления - используем кэш)
  useEffect(() => {
    loadAllPlaylists(false);
  }, [loadAllPlaylists]);

  // Функция принудительного обновления
  const handleRefresh = () => {
    loadAllPlaylists(true);
  };

  // Создание нового плейлиста
  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    
    setIsCreating(true);
    try {
      const playlist = await createPlaylist(newPlaylistName.trim());
      if (playlist) {
        setShowCreateModal(false);
        setNewPlaylistName('');
      }
    } catch (err) {
      console.error('Error creating playlist:', err);
    } finally {
      setIsCreating(false);
    }
  };

  // Удаление плейлиста
  const handleDeletePlaylist = async (playlistId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm('Удалить этот плейлист?')) {
      await deletePlaylist(playlistId);
    }
  };

  // Преобразуем пользовательские плейлисты в общий формат
  const localPlaylists: PlaylistItem[] = userPlaylists.map(p => ({
    id: `local_${p.id}`,
    title: p.title,
    cover: p.coverUrl || p.tracks?.[0]?.coverUrl,
    trackCount: p.trackCount || p.tracks?.length || 0,
    source: 'local' as const,
  }));

  // Все плейлисты (пользовательские + VK)
  const allPlaylists = [...localPlaylists, ...playlists];

  // Фильтрация плейлистов по источнику
  const displayPlaylists = activeSource === 'all' 
    ? allPlaylists 
    : activeSource === 'my'
    ? localPlaylists
    : playlists.filter(p => p.source === activeSource);

  const vkCount = playlists.filter(p => p.source === 'vk').length;
  const yandexCount = playlists.filter(p => p.source === 'yandex').length;
  const myCount = localPlaylists.length;

  const sourceTabs = [
    { id: 'all' as SourceTab, label: 'Все', count: allPlaylists.length },
    { id: 'my' as SourceTab, label: 'Мои', count: myCount },
    ...(isVKConnected ? [{ id: 'vk' as SourceTab, label: 'VK', count: vkCount }] : []),
    ...(isYandexConnected ? [{ id: 'yandex' as SourceTab, label: 'Яндекс', count: yandexCount }] : []),
  ];

  return (
    <MainLayout>
      <div className="p-4 md:p-8 pb-32">
        {/* Header with gradient - как у избранного */}
        <div className="relative rounded-2xl md:rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 p-6 md:p-8 mb-6 md:mb-8 overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 md:w-96 h-48 md:h-96 rounded-full bg-white blur-3xl" />
          </div>
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end gap-4 md:gap-6">
            <div className="w-24 h-24 md:w-40 md:h-40 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl mx-auto sm:mx-0">
              <ListMusic className="w-12 h-12 md:w-20 md:h-20 text-white" />
            </div>
            <div className="flex-1 text-white text-center sm:text-left pb-2">
              <p className="text-xs md:text-sm font-medium opacity-80 mb-1">Коллекция</p>
              <h1 className="text-2xl md:text-4xl font-bold mb-2">Плейлисты</h1>
              <p className="opacity-80 text-sm md:text-base">
                {displayPlaylists.length} плейлистов
              </p>
            </div>
          </div>

          {/* Create button */}
          <div className="relative z-10 flex gap-3 mt-6 justify-center sm:justify-start">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-6 md:px-8 py-3 md:py-4 bg-white text-black rounded-full font-semibold shadow-lg hover:scale-105 transition-transform flex items-center gap-2 text-sm md:text-base"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              Создать плейлист
            </button>
            <button 
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 md:px-5 py-3 md:py-4 bg-white/20 hover:bg-white/30 text-white rounded-full font-semibold transition-all flex items-center gap-2 text-sm md:text-base disabled:opacity-50"
              title="Обновить плейлисты"
            >
              <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Modal for creating playlist */}
        {showCreateModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          >
            <div 
              className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-neutral-800">
                <h2 className="text-xl font-bold">Новый плейлист</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <input
                  type="text"
                  placeholder="Название плейлиста"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                  autoFocus
                  className={cn(
                    'w-full px-4 py-3 rounded-xl mb-4',
                    'bg-gray-100 dark:bg-neutral-800',
                    'border-2 border-transparent focus:border-orange-500',
                    'outline-none transition-colors'
                  )}
                />
                
                <button
                  onClick={handleCreatePlaylist}
                  disabled={!newPlaylistName.trim() || isCreating}
                  className={cn(
                    'w-full py-3 rounded-xl font-semibold',
                    'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
                    'hover:from-orange-600 hover:to-orange-700 transition-all',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'flex items-center justify-center gap-2'
                  )}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Создание...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Создать
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Not connected state */}
        {!hasAnyConnection && localPlaylists.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mb-4 md:mb-6">
              <Music2 className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">Подключите музыку</h2>
            <p className="text-gray-500 mb-6 md:mb-8 max-w-md px-4 text-sm md:text-base">
              Войдите через VK или Яндекс, чтобы увидеть свои плейлисты
            </p>
            <Link
              href="/login"
              className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl md:rounded-2xl font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all text-sm md:text-base"
            >
              Войти
            </Link>
          </div>
        )}

        {/* Error state */}
        {error && hasAnyConnection && (
          <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 md:mb-6">
              <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-red-500" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">Ошибка загрузки</h2>
            <p className="text-gray-500 mb-6 md:mb-8 max-w-md px-4 text-sm md:text-base">
              {error}
            </p>
            <button
              onClick={handleRefresh}
              className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl md:rounded-2xl font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all text-sm md:text-base flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Повторить
            </button>
          </div>
        )}

        {/* Source tabs */}
        {(hasAnyConnection || localPlaylists.length > 0) && !error && sourceTabs.length > 1 && (
          <div className="flex gap-2 mb-6 md:mb-8 p-1.5 bg-gray-100 dark:bg-neutral-800 rounded-xl md:rounded-2xl w-fit">
            {sourceTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSource(tab.id)}
                className={`px-4 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl font-medium transition-all text-sm md:text-base ${
                  activeSource === tab.id
                    ? 'bg-white dark:bg-neutral-700 shadow-sm text-black dark:text-white'
                    : 'text-gray-500 hover:text-black dark:hover:text-white'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 text-xs opacity-60">({tab.count})</span>
                )}
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

        {/* Playlists grid */}
        {(hasAnyConnection || localPlaylists.length > 0) && !isLoading && !error && (
          <>
            {displayPlaylists.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                {displayPlaylists.map((playlist) => {
                  const isLocal = playlist.source === 'local';
                  const localId = isLocal ? playlist.id.replace('local_', '') : null;
                  
                  return (
                    <div key={playlist.id} className="group relative">
                      <Link 
                        href={isLocal ? `/playlist/local/${localId}` : `/playlist/${playlist.id}`}
                        className="block"
                      >
                        <div className="aspect-square rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-neutral-800 dark:to-neutral-900 overflow-hidden mb-3 shadow-lg group-hover:shadow-xl transition-all relative">
                          {playlist.cover ? (
                            <SafeImage
                              src={playlist.cover}
                              alt={playlist.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              fallbackIcon={<Disc3 className="w-16 h-16 text-gray-400" />}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-500/20 to-pink-500/20">
                              <Disc3 className="w-16 h-16 text-gray-400" />
                            </div>
                          )}
                          
                          {/* Source badge */}
                          <div className={cn(
                            'absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-medium',
                            playlist.source === 'vk' && 'bg-blue-500/80 text-white',
                            playlist.source === 'yandex' && 'bg-yellow-500/80 text-black',
                            playlist.source === 'local' && 'bg-orange-500/80 text-white'
                          )}>
                            {playlist.source === 'vk' ? 'VK' : playlist.source === 'yandex' ? 'Я' : '💾'}
                          </div>
                        </div>
                        <h3 className="font-semibold truncate group-hover:text-orange-500 transition-colors">
                          {playlist.title}
                        </h3>
                        {playlist.trackCount !== undefined && (
                          <p className="text-sm text-gray-500 mt-0.5">
                            {playlist.trackCount} треков
                          </p>
                        )}
                      </Link>
                      
                      {/* Delete button for local playlists */}
                      {isLocal && localId && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeletePlaylist(localId, e);
                          }}
                          className="absolute top-2 left-2 p-2 rounded-xl bg-red-500/80 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                          title="Удалить плейлист"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-6">
                  <ListMusic className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold mb-2">Нет плейлистов</h2>
                <p className="text-gray-500">
                  Создайте свой первый плейлист или добавьте музыку
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
