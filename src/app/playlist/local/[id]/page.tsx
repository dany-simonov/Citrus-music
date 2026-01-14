/**
 * Страница локального плейлиста
 * @module app/playlist/local/[id]/page
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { usePlaylistsStore } from '@/store/playlists';
import { usePlayerStore } from '@/store/player';
import { TrackList } from '@/components/track';
import { 
  Loader2, 
  Play, 
  Shuffle, 
  ArrowLeft, 
  ListMusic,
  Clock,
  MoreHorizontal,
  Trash2,
  Edit3,
  Music2
} from 'lucide-react';
import Link from 'next/link';
import { formatDuration, cn } from '@/lib/utils';

export default function LocalPlaylistPage() {
  const params = useParams();
  const router = useRouter();
  const { playlists, loadPlaylists, deletePlaylist, updatePlaylist } = usePlaylistsStore();
  const { playPlaylist } = usePlayerStore();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  const playlistId = params.id as string;

  useEffect(() => {
    const init = async () => {
      await loadPlaylists(false); // Используем кэш
      setIsLoading(false);
    };
    init();
  }, [loadPlaylists]);

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

  const playlist = playlists.find(p => p.id === playlistId);

  useEffect(() => {
    if (playlist) {
      setNewName(playlist.title);
    }
  }, [playlist]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!playlist) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-red-500">Плейлист не найден</p>
          <Link href="/playlists" className="text-orange-500 hover:underline mt-2 inline-block">
            Вернуться к плейлистам
          </Link>
        </div>
      </MainLayout>
    );
  }

  const tracks = playlist.tracks || [];
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

  const handleDelete = async () => {
    if (confirm('Удалить этот плейлист?')) {
      await deletePlaylist(playlistId);
      router.push('/playlists');
    }
  };

  const handleRename = async () => {
    if (newName.trim() && newName !== playlist.title) {
      await updatePlaylist(playlistId, { name: newName.trim() });
    }
    setIsEditing(false);
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto pt-6">
        {/* Шапка плейлиста */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-8">
          {/* Обложка */}
          <div className="shrink-0">
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 shadow-2xl overflow-hidden mx-auto md:mx-0">
              {firstTrackCover ? (
                <img 
                  src={firstTrackCover} 
                  alt={playlist.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music2 className="w-20 h-20 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Информация */}
          <div className="flex flex-col justify-end text-center md:text-left">
            <span className="text-sm text-orange-500 font-medium mb-2 flex items-center justify-center md:justify-start gap-2">
              <span className="px-2 py-1 rounded-lg bg-orange-500/20">Локальный</span>
            </span>
            
            {isEditing ? (
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                  onBlur={handleRename}
                  autoFocus
                  className={cn(
                    'text-2xl md:text-4xl font-bold bg-transparent border-b-2 border-orange-500',
                    'outline-none px-1'
                  )}
                />
              </div>
            ) : (
              <h1 
                className="text-2xl md:text-4xl font-bold mb-4 cursor-pointer hover:text-orange-500 transition-colors"
                onClick={() => setIsEditing(true)}
                title="Нажмите для переименования"
              >
                {playlist.title}
              </h1>
            )}
            
            <div className="flex items-center gap-4 text-gray-500 text-sm mb-6 justify-center md:justify-start">
              <span className="flex items-center gap-1.5">
                <ListMusic className="w-4 h-4" />
                {tracks.length} треков
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {formatDuration(totalDuration)}
              </span>
            </div>

            {/* Кнопки */}
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <button 
                onClick={handlePlayAll}
                disabled={tracks.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-5 h-5 fill-current" />
                Слушать
              </button>
              <button 
                onClick={handleShuffle}
                disabled={tracks.length === 0}
                className="flex items-center gap-2 px-5 py-3 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-full font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Shuffle className="w-5 h-5" />
              </button>
              
              {/* Кнопка назад */}
              <Link
                href="/playlists"
                className="p-3 rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all"
                title="Все плейлисты"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              
              {/* Меню */}
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-3 rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-gray-200 dark:border-neutral-700 py-2 z-50">
                    <button 
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Переименовать
                    </button>
                    <button 
                      onClick={handleDelete}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-neutral-700 flex items-center gap-2 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                      Удалить плейлист
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Треки */}
        {tracks.length > 0 ? (
          <TrackList tracks={tracks} />
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-6">
              <Music2 className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Плейлист пуст</h2>
            <p className="text-gray-500 mb-6">
              Добавьте треки через меню "..." на любом треке
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
