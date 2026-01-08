/**
 * Страница библиотеки пользователя
 * @module app/library/page
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { useAuthStore } from '@/store/auth';
import { useVKPlaylists, useVKAudio } from '@/hooks/use-vk-api';
import { PlaylistCard } from '@/components/playlist';
import { TrackList } from '@/components/track';
import { transformVKPlaylistsToPlaylists, transformVKAudiosToTracks } from '@/lib/transformers';
import { Loader2, Music, ListMusic } from 'lucide-react';

export default function LibraryPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();
  
  const { data: playlistsData, isLoading: playlistsLoading } = useVKPlaylists();
  const { data: audioData, isLoading: audioLoading } = useVKAudio({ count: 50 });

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

  const playlists = playlistsData ? transformVKPlaylistsToPlaylists(playlistsData.items) : [];
  const tracks = audioData ? transformVKAudiosToTracks(audioData.items) : [];

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Моя библиотека</h1>
          <p className="text-gray-500">Ваши плейлисты и треки из ВКонтакте</p>
        </div>

        {/* Плейлисты */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <ListMusic className="w-5 h-5 text-citrus-accent" />
              Плейлисты
            </h2>
            {playlistsData && (
              <span className="text-sm text-gray-500">
                {playlistsData.count} {getPlaylistWord(playlistsData.count)}
              </span>
            )}
          </div>

          {playlistsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-citrus-accent" />
            </div>
          ) : playlists.length > 0 ? (
            <div className="playlist-grid">
              {playlists.map((playlist) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ListMusic className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>У вас пока нет плейлистов</p>
            </div>
          )}
        </section>

        {/* Треки */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Music className="w-5 h-5 text-citrus-accent" />
              Мои аудиозаписи
            </h2>
            {audioData && (
              <span className="text-sm text-gray-500">
                {audioData.count} {getTrackWord(audioData.count)}
              </span>
            )}
          </div>

          {audioLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-citrus-accent" />
            </div>
          ) : tracks.length > 0 ? (
            <TrackList tracks={tracks} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>У вас пока нет аудиозаписей</p>
            </div>
          )}
        </section>
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
