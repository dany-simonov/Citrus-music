/**
 * Страница плейлистов
 * @module app/playlists/page
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
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
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

type SourceTab = 'all' | 'vk' | 'yandex';

interface PlaylistItem {
  id: string;
  title: string;
  cover?: string;
  trackCount?: number;
  source: 'vk' | 'yandex';
  ownerId?: number;
  accessKey?: string;
}

export default function PlaylistsPage() {
  const { vkTokens, yandexTokens, isAuthenticated } = useAuthStore();
  const [activeSource, setActiveSource] = useState<SourceTab>('all');
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isVKConnected = !!vkTokens?.accessToken;
  const isYandexConnected = !!yandexTokens?.accessToken;
  const hasAnyConnection = isVKConnected || isYandexConnected;

  // Загрузка плейлистов напрямую через API
  const loadPlaylists = async () => {
    if (!hasAnyConnection) return;
    
    setIsLoading(true);
    setError(null);
    
    const allPlaylists: PlaylistItem[] = [];
    
    try {
      // Загружаем плейлисты VK
      if (isVKConnected && (activeSource === 'all' || activeSource === 'vk')) {
        try {
          // Сначала получаем текущего пользователя для owner_id
          const currentUser = await vkApiService.getCurrentUser();
          
          if (!currentUser?.id) {
            throw new Error('Не удалось получить ID пользователя VK');
          }
          
          // Теперь запрашиваем плейлисты с owner_id
          const vkData = await vkApiService.getPlaylists({ 
            owner_id: currentUser.id,
            count: 100 
          });
          
          if (vkData?.items && vkData.items.length > 0) {
            vkData.items.forEach((p) => {
              // Получаем обложку из разных полей
              let cover = p.photo?.photo_600 || 
                          p.photo?.photo_300 || 
                          (p.thumbs && p.thumbs.length > 0 ? (p.thumbs[0].photo_600 || p.thumbs[0].photo_300) : undefined);
              
              allPlaylists.push({
                id: `vk_${p.owner_id}_${p.id}`,
                title: p.title,
                cover: cover,
                trackCount: p.count,
                source: 'vk',
                ownerId: p.owner_id,
                accessKey: p.access_key,
              });
            });
          }
        } catch (vkError: any) {
          console.error('Error loading VK playlists:', vkError);
          if (!allPlaylists.length) {
            throw vkError;
          }
        }
      }
      
      setPlaylists(allPlaylists);
    } catch (err: any) {
      console.error('Error loading playlists:', err);
      setError(err.message || 'Ошибка загрузки плейлистов');
    } finally {
      setIsLoading(false);
    }
  };

  // Загружаем плейлисты при монтировании и при смене источника
  useEffect(() => {
    if (hasAnyConnection) {
      loadPlaylists();
    }
  }, [isVKConnected, isYandexConnected, activeSource]);

  // Фильтрация плейлистов по источнику
  const displayPlaylists = activeSource === 'all' 
    ? playlists 
    : playlists.filter(p => p.source === activeSource);

  const vkCount = playlists.filter(p => p.source === 'vk').length;
  const yandexCount = playlists.filter(p => p.source === 'yandex').length;

  const sourceTabs = [
    { id: 'all' as SourceTab, label: 'Все', count: playlists.length },
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
            <button className="px-6 md:px-8 py-3 md:py-4 bg-white text-black rounded-full font-semibold shadow-lg hover:scale-105 transition-transform flex items-center gap-2 text-sm md:text-base">
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              Создать плейлист
            </button>
            {hasAnyConnection && (
              <button 
                onClick={loadPlaylists}
                disabled={isLoading}
                className="px-4 md:px-5 py-3 md:py-4 bg-white/20 hover:bg-white/30 text-white rounded-full font-semibold transition-all flex items-center gap-2 text-sm md:text-base disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Not connected state */}
        {!hasAnyConnection && (
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
              onClick={loadPlaylists}
              className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl md:rounded-2xl font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all text-sm md:text-base flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Повторить
            </button>
          </div>
        )}

        {/* Source tabs */}
        {hasAnyConnection && !error && sourceTabs.length > 1 && (
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
        {hasAnyConnection && !isLoading && !error && (
          <>
            {displayPlaylists.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                {displayPlaylists.map((playlist) => (
                  <Link 
                    key={playlist.id}
                    href={`/playlist/${playlist.id}`}
                    className="group"
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
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                          <Disc3 className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Source badge */}
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-medium ${
                        playlist.source === 'vk' 
                          ? 'bg-blue-500/80 text-white' 
                          : 'bg-yellow-500/80 text-black'
                      }`}>
                        {playlist.source === 'vk' ? 'VK' : 'Я'}
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
                ))}
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
