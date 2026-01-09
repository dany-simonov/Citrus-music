/**
 * Динамическая страница плейлиста
 * @module app/playlist/[id]/page
 */

'use client';

import { useState, useRef, useEffect } from 'react';
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
  MoreHorizontal,
  Heart,
  Share2,
  Download,
  Trash2,
  Plus,
  Edit3,
  Copy
} from 'lucide-react';
import Link from 'next/link';
import { formatDuration } from '@/lib/utils';

export default function PlaylistPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { playPlaylist } = usePlayerStore();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const playlistId = params.id as string;
  const parsedId = parseVKPlaylistId(playlistId);

  const { data: audioData, isLoading, error } = useVKPlaylistAudios(
    parsedId?.ownerId || 0,
    parsedId?.id || 0,
    undefined,
    !!parsedId && isAuthenticated
  );

  // Закрытие меню при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (!parsedId) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-red-500">Неверный ID плейлиста</p>
          <Link href="/playlists" className="text-orange-500 hover:underline mt-2 inline-block">
            Вернуться к плейлистам
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
      const shuffled = [...availableTracks].sort(() => Math.random() - 0.5);
      playPlaylist(shuffled, 0);
    }
  };

  const menuItems = [
    { icon: Heart, label: 'Добавить в избранное', action: () => {} },
    { icon: Plus, label: 'Добавить в плейлист', action: () => {} },
    { icon: Download, label: 'Скачать плейлист', action: () => {} },
    { icon: Share2, label: 'Поделиться', action: () => {} },
    { icon: Copy, label: 'Копировать ссылку', action: () => navigator.clipboard.writeText(window.location.href) },
    { icon: Edit3, label: 'Редактировать', action: () => {} },
    { icon: Trash2, label: 'Удалить плейлист', action: () => {}, danger: true },
  ];

  return (
    <MainLayout>
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Не удалось загрузить плейлист</p>
          <Button variant="secondary" onClick={() => router.push('/playlists')}>
            Вернуться к плейлистам
          </Button>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* Cover */}
            <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-neutral-800 dark:to-neutral-900 flex-shrink-0 shadow-xl mx-auto md:mx-0">
              {firstTrackCover ? (
                <img
                  src={firstTrackCover}
                  alt="Playlist cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ListMusic className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col justify-end text-center md:text-left">
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Плейлист</p>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Плейлист</h1>
              
              <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-500">
                <span>{audioData?.count || 0} треков</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTotalDuration(totalDuration)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center md:justify-start gap-3 mt-6">
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
                <button
                  onClick={() => router.back()}
                  className="p-3 rounded-xl bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                  title="Назад"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                {/* Menu */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-3 rounded-xl bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  
                  {showMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-gray-200 dark:border-neutral-800 py-2 z-50">
                      {menuItems.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            item.action();
                            setShowMenu(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors ${
                            item.danger ? 'text-red-500' : ''
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
