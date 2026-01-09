/**
 * Страница библиотеки пользователя - Apple/Microsoft Style
 * @module app/library/page
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { useAuthStore } from '@/store/auth';
import { useVKPlaylists, useVKAudio } from '@/hooks/use-vk-api';
import { useYandexPlaylists, useYandexLikedTracks } from '@/hooks/use-yandex-api';
import { PlaylistCard } from '@/components/playlist';
import { TrackList } from '@/components/track';
import { transformVKPlaylistsToPlaylists, transformVKAudiosToTracks } from '@/lib/transformers';
import { Loader2, Music, ListMusic, Sparkles } from 'lucide-react';

export default function LibraryPage() {
  const router = useRouter();
  const { isAuthenticated, vkUser, yandexUser, checkAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'all' | 'vk' | 'yandex'>('all');
  
  const { data: vkPlaylistsData, isLoading: vkPlaylistsLoading } = useVKPlaylists();
  const { data: vkAudioData, isLoading: vkAudioLoading } = useVKAudio({ count: 50 });
  const { data: yandexPlaylistsData, isLoading: yandexPlaylistsLoading } = useYandexPlaylists();
  const { data: yandexLikedData, isLoading: yandexLikedLoading } = useYandexLikedTracks();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const vkPlaylists = vkPlaylistsData ? transformVKPlaylistsToPlaylists(vkPlaylistsData.items) : [];
  const vkTracks = vkAudioData ? transformVKAudiosToTracks(vkAudioData.items) : [];
  
  const showVK = vkUser && (activeTab === 'all' || activeTab === 'vk');
  const showYandex = yandexUser && (activeTab === 'all' || activeTab === 'yandex');
  
  const isLoading = (showVK && (vkPlaylistsLoading || vkAudioLoading)) || 
                    (showYandex && (yandexPlaylistsLoading || yandexLikedLoading));

  return (
    <MainLayout>
      <div className="space-y-10 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Моя библиотека</h1>
            <p className="text-gray-500 dark:text-gray-400">
              {vkUser && yandexUser
                ? 'Плейлисты и треки из VK и Яндекс Музыки'
                : vkUser
                ? 'Ваши плейлисты и треки из ВКонтакте'
                : 'Ваши плейлисты и треки из Яндекс Музыки'}
            </p>
          </div>
          
          {/* Source indicator */}
          <div className="flex items-center gap-2">
            {vkUser && (
              <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                VK
              </span>
            )}
            {yandexUser && (
              <span className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-sm font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Яндекс
              </span>
            )}
          </div>
        </div>

        {/* Source tabs */}
        {vkUser && yandexUser && (
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-5 py-2.5 rounded-2xl font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700'
              }`}
            >
              Все источники
            </button>
            <button
              onClick={() => setActiveTab('vk')}
              className={`px-5 py-2.5 rounded-2xl font-medium transition-all ${
                activeTab === 'vk'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700'
              }`}
            >
              ВКонтакте
            </button>
            <button
              onClick={() => setActiveTab('yandex')}
              className={`px-5 py-2.5 rounded-2xl font-medium transition-all ${
                activeTab === 'yandex'
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                  : 'bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700'
              }`}
            >
              Яндекс Музыка
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
            <p className="text-gray-500">Загружаем вашу музыку...</p>
          </div>
        ) : (
          <>
            {/* VK Плейлисты */}
            {showVK && (
              <section className="animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <ListMusic className="w-5 h-5 text-blue-500" />
                    </div>
                    Плейлисты VK
                  </h2>
                  {vkPlaylistsData && (
                    <span className="px-3 py-1 bg-gray-100 dark:bg-neutral-800 rounded-full text-sm text-gray-500">
                      {vkPlaylistsData.count} {getPlaylistWord(vkPlaylistsData.count)}
                    </span>
                  )}
                </div>

                {vkPlaylists.length > 0 ? (
                  <div className="playlist-grid">
                    {vkPlaylists.map((playlist) => (
                      <PlaylistCard key={playlist.id} playlist={playlist} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 dark:bg-neutral-900 rounded-3xl">
                    <ListMusic className="w-14 h-14 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">У вас пока нет плейлистов в VK</p>
                  </div>
                )}
              </section>
            )}

            {/* VK Треки */}
            {showVK && (
              <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Music className="w-5 h-5 text-blue-500" />
                    </div>
                    Аудиозаписи VK
                  </h2>
                  {vkAudioData && (
                    <span className="px-3 py-1 bg-gray-100 dark:bg-neutral-800 rounded-full text-sm text-gray-500">
                      {vkAudioData.count} {getTrackWord(vkAudioData.count)}
                    </span>
                  )}
                </div>

                {vkTracks.length > 0 ? (
                  <TrackList tracks={vkTracks} />
                ) : (
                  <div className="text-center py-12 bg-gray-50 dark:bg-neutral-900 rounded-3xl">
                    <Music className="w-14 h-14 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">У вас пока нет аудиозаписей в VK</p>
                  </div>
                )}
              </section>
            )}

            {/* Yandex section placeholder */}
            {showYandex && (
              <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-red-500" />
                    </div>
                    Яндекс Музыка
                  </h2>
                </div>
                
                <div className="p-8 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-3xl border border-red-200/50 dark:border-red-800/50">
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    Интеграция с Яндекс Музыкой подключена! 
                    <br />
                    <span className="text-sm">Скоро здесь появятся ваши плейлисты и треки.</span>
                  </p>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}

function getPlaylistWord(count: number): string {
  const lastTwo = count % 100;
  const lastOne = count % 10;
  
  if (lastTwo >= 11 && lastTwo <= 19) return 'плейлистов';
  if (lastOne === 1) return 'плейлист';
  if (lastOne >= 2 && lastOne <= 4) return 'плейлиста';
  return 'плейлистов';
}

function getTrackWord(count: number): string {
  const lastTwo = count % 100;
  const lastOne = count % 10;
  
  if (lastTwo >= 11 && lastTwo <= 19) return 'треков';
  if (lastOne === 1) return 'трек';
  if (lastOne >= 2 && lastOne <= 4) return 'трека';
  return 'треков';
}
