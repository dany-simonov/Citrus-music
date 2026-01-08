/**
 * Динамическая страница плейлиста
 * @module app/playlist/[id]/page
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { useAuthStore } from '@/store/auth';
import { useVKPlaylistAudios } from '@/hooks/use-vk-api';
import { usePlayerStore } from '@/store/player';
import { TrackList } from '@/components/track';
import { transformVKAudiosToTracks, parseVKPlaylistId } from '@/lib/transformers';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  Play, 
  Shuffle, 
  ArrowLeft, 
  ListMusic,
  Clock,
  MoreHorizontal 
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDuration } from '@/lib/utils';

export default function PlaylistPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { playPlaylist } = usePlayerStore();

  const playlistId = params.id as string;
  const parsedId = parseVKPlaylistId(playlistId);

  const { data: audioData, isLoading, error } = useVKPlaylistAudios(
    parsedId?.ownerId || 0,
    parsedId?.id || 0,
    undefined,
    !!parsedId && isAuthenticated
  );

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (!parsedId) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-red-500">Неверный ID плейлиста</p>
          <Link href="/library" className="text-citrus-accent hover:underline mt-2 inline-block">
            Вернуться в библиотеку
          </Link>
        </div>
      </MainLayout>
    );
  }

  const tracks = audioData ? transformVKAudiosToTracks(audioData.items) : [];
  const totalDuration = tracks.reduce((sum, t) => sum + t.duration, 0);
  const firstTrackCover = tracks[0]?.coverUrl;

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      const availableTracks = tracks.filter(t => t.isAvailable);
      playPlaylist(availableTracks, 0);
    }
  };

  const handleShuffle = () => {
    if (tracks.length > 0) {
      const availableTracks = tracks.filter(t => t.isAvailable);
      const randomIndex = Math.floor(Math.random() * availableTracks.length);
      playPlaylist(availableTracks, randomIndex);
    }
  };

  return (
    <MainLayout>
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-black dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Назад</span>
      </button>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-citrus-accent" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Не удалось загрузить плейлист</p>
          <Button variant="secondary" onClick={() => router.push('/library')}>
            Вернуться в библиотеку
          </Button>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* Cover */}
            <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-xl overflow-hidden bg-gray-200 dark:bg-neutral-800 flex-shrink-0 shadow-xl">
              {firstTrackCover ? (
                <Image
                  src={firstTrackCover}
                  alt="Playlist cover"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ListMusic className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col justify-end">
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Плейлист</p>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Плейлист</h1>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{audioData?.count || 0} треков</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTotalDuration(totalDuration)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 mt-6">
                <Button 
                  variant="primary" 
                  icon={Play}
                  onClick={handlePlayAll}
                  disabled={tracks.length === 0}
                >
                  Слушать
                </Button>
                <Button 
                  variant="secondary" 
                  icon={Shuffle}
                  onClick={handleShuffle}
                  disabled={tracks.length === 0}
                >
                  Перемешать
                </Button>
                <Button variant="icon">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Track list */}
          {tracks.length > 0 ? (
            <TrackList tracks={tracks} />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <ListMusic className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>В этом плейлисте пока нет треков</p>
            </div>
          )}
        </>
      )}
    </MainLayout>
  );
}

function formatTotalDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} ч ${minutes} мин`;
  }
  return `${minutes} мин`;
}
