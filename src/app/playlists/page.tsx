/**
 * Страница плейлистов
 * @module app/playlists/page
 */

'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useVKPlaylists } from '@/hooks/use-vk-api';
import { useYandexPlaylists } from '@/hooks/use-yandex-api';
import { PlaylistCard } from '@/components/playlist/playlist-card';
import { MainLayout } from '@/components/layout';
import { 
  ListMusic, 
  Plus, 
  Loader2,
  Music2,
  Disc3
} from 'lucide-react';
import Link from 'next/link';

type SourceTab = 'all' | 'vk' | 'yandex';

export default function PlaylistsPage() {
  const { vkTokens, yandexTokens, vkUser, yandexUser } = useAuthStore();
  const [activeSource, setActiveSource] = useState<SourceTab>('all');

  const isVKConnected = !!vkTokens?.accessToken;
  const isYandexConnected = !!yandexTokens?.accessToken;
  const hasAnyConnection = isVKConnected || isYandexConnected;

  // Fetch data from both sources
  const { 
    data: vkPlaylistsData, 
    isLoading: vkLoading 
  } = useVKPlaylists(
    isVKConnected && (activeSource === 'all' || activeSource === 'vk') 
      ? { owner_id: Number(vkUser?.id) } 
      : undefined
  );

  const { 
    data: yandexPlaylists, 
    isLoading: yandexLoading 
  } = useYandexPlaylists();
  
  // Extract playlists array from VK response
  const vkPlaylists = vkPlaylistsData?.items || [];

  const isLoading = vkLoading || yandexLoading;

  // Combine playlists based on active source
  const getDisplayPlaylists = () => {
    const allPlaylists: Array<{
      id: string;
      title: string;
      cover?: string;
      trackCount?: number;
      source: 'vk' | 'yandex';
    }> = [];

    if ((activeSource === 'all' || activeSource === 'vk') && vkPlaylists && vkPlaylists.length > 0) {
      vkPlaylists.forEach((p: any) => {
        allPlaylists.push({
          id: `vk-${p.id}`,
          title: p.title,
          cover: p.photo?.photo_300 || p.thumbs?.[0]?.photo_300,
          trackCount: p.count,
          source: 'vk',
        });
      });
    }

    if ((activeSource === 'all' || activeSource === 'yandex') && yandexPlaylists && isYandexConnected) {
      (yandexPlaylists as any[]).forEach((p: any) => {
        allPlaylists.push({
          id: `yandex-${p.kind}`,
          title: p.title,
          cover: p.cover?.uri?.replace('%%', '400x400'),
          trackCount: p.trackCount,
          source: 'yandex',
        });
      });
    }

    return allPlaylists;
  };

  const displayPlaylists = getDisplayPlaylists();

  const sourceTabs = [
    { id: 'all' as SourceTab, label: 'Все', count: displayPlaylists.length },
    ...(isVKConnected ? [{ id: 'vk' as SourceTab, label: 'VK', count: vkPlaylists.length }] : []),
    ...(isYandexConnected ? [{ id: 'yandex' as SourceTab, label: 'Яндекс', count: yandexPlaylists?.length || 0 }] : []),
  ];

  return (
    <MainLayout>
      <div className="p-4 md:p-8 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <ListMusic className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Плейлисты</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {displayPlaylists.length} плейлистов
              </p>
            </div>
          </div>

          <button className="px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Создать
          </button>
        </div>

        {/* Not connected state */}
        {!hasAnyConnection && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mb-6">
              <Music2 className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Подключите музыку</h2>
            <p className="text-gray-500 mb-8 max-w-md">
              Войдите через VK или Яндекс, чтобы увидеть свои плейлисты
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
          <div className="flex gap-2 mb-8 p-1.5 bg-gray-100 dark:bg-neutral-800 rounded-2xl w-fit">
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
        {hasAnyConnection && !isLoading && (
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
                        <img
                          src={playlist.cover}
                          alt={playlist.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
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
