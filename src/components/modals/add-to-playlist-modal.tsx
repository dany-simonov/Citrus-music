/**
 * Модальное окно добавления трека в плейлист
 * @module components/modals/add-to-playlist-modal
 */

'use client';

import { useState, useEffect } from 'react';
import { Track } from '@/types/audio';
import { usePlaylistsStore } from '@/store/playlists';
import { cn } from '@/lib/utils';
import { X, Plus, Music, Check, AlertCircle } from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';

interface AddToPlaylistModalProps {
  track: Track;
  isOpen: boolean;
  onClose: () => void;
}

export function AddToPlaylistModal({ track, isOpen, onClose }: AddToPlaylistModalProps) {
  const { playlists, loadPlaylists, createPlaylist, addTrackToPlaylist, isLoading } = usePlaylistsStore();
  const [showNewPlaylist, setShowNewPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [addedTo, setAddedTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Загружаем плейлисты при открытии
  useEffect(() => {
    if (isOpen) {
      loadPlaylists();
      setShowNewPlaylist(false);
      setNewPlaylistName('');
      setAddedTo(null);
      setError(null);
    }
  }, [isOpen, loadPlaylists]);

  // Закрытие при клике на Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleAddToPlaylist = async (playlistId: string) => {
    setError(null);
    const success = await addTrackToPlaylist(playlistId, track);
    if (success) {
      setAddedTo(playlistId);
      setTimeout(() => {
        onClose();
      }, 500);
    } else {
      setError('Не удалось добавить трек');
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    
    setError(null);
    const playlist = await createPlaylist(newPlaylistName.trim());
    if (playlist) {
      // Добавляем трек в новый плейлист
      await addTrackToPlaylist(playlist.id, track);
      setAddedTo(playlist.id);
      setTimeout(() => {
        onClose();
      }, 500);
    } else {
      setError('Не удалось создать плейлист');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className={cn(
          'w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl',
          'shadow-2xl shadow-black/20 overflow-hidden',
          'animate-scale-in'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-neutral-800">
          <h2 className="text-xl font-bold">Добавить в плейлист</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Информация о треке */}
        <div className="flex items-center gap-3 p-4 mx-4 mt-4 bg-gray-50 dark:bg-neutral-800/50 rounded-2xl">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200 dark:bg-neutral-700 flex-shrink-0">
            <SafeImage 
              src={track.coverUrl} 
              alt={track.title}
              fallbackType="track"
            />
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate">{track.title}</p>
            <p className="text-sm text-gray-500 truncate">{track.artist}</p>
          </div>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="flex items-center gap-2 mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Создание нового плейлиста */}
        <div className="p-4">
          {showNewPlaylist ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Название плейлиста"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                autoFocus
                className={cn(
                  'flex-1 px-4 py-3 rounded-xl',
                  'bg-gray-100 dark:bg-neutral-800',
                  'border-2 border-transparent focus:border-orange-500',
                  'outline-none transition-colors'
                )}
              />
              <button
                onClick={handleCreatePlaylist}
                disabled={!newPlaylistName.trim() || isLoading}
                className={cn(
                  'px-4 py-3 rounded-xl font-medium',
                  'bg-orange-500 text-white',
                  'hover:bg-orange-600 transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                Создать
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewPlaylist(true)}
              className={cn(
                'w-full flex items-center gap-3 p-4 rounded-xl',
                'bg-gradient-to-r from-orange-500 to-orange-600',
                'text-white font-medium',
                'hover:from-orange-600 hover:to-orange-700 transition-all'
              )}
            >
              <Plus className="w-5 h-5" />
              <span>Создать новый плейлист</span>
            </button>
          )}
        </div>

        {/* Список плейлистов */}
        <div className="max-h-[300px] overflow-y-auto px-4 pb-4">
          {playlists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Music className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-center">У вас пока нет плейлистов</p>
              <p className="text-sm text-center mt-1">Создайте первый плейлист!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {playlists.map((playlist) => {
                const isAdded = addedTo === playlist.id;
                const trackCount = playlist.tracks?.length || 0;
                
                return (
                  <button
                    key={playlist.id}
                    onClick={() => !isAdded && handleAddToPlaylist(playlist.id)}
                    disabled={isLoading || isAdded}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl',
                      'hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors',
                      'disabled:cursor-not-allowed',
                      isAdded && 'bg-green-50 dark:bg-green-900/20'
                    )}
                  >
                    {/* Обложка плейлиста */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                      {isAdded ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : (
                        <Music className="w-6 h-6 text-white" />
                      )}
                    </div>
                    
                    <div className="flex-1 text-left min-w-0">
                      <p className={cn(
                        'font-semibold truncate',
                        isAdded && 'text-green-600 dark:text-green-400'
                      )}>
                        {playlist.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {trackCount} {trackCount === 1 ? 'трек' : trackCount >= 2 && trackCount <= 4 ? 'трека' : 'треков'}
                      </p>
                    </div>
                    
                    {!isAdded && (
                      <Plus className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Примечание */}
        <div className="p-4 border-t border-gray-100 dark:border-neutral-800">
          <p className="text-xs text-gray-500 text-center">
            ⚠️ Добавлять треки можно только в созданные вами плейлисты
          </p>
        </div>
      </div>
    </div>
  );
}
