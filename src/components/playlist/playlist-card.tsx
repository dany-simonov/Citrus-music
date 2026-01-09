/**
 * Компонент карточки плейлиста - Apple/Microsoft Style
 * @module components/playlist/playlist-card
 */

'use client';

import { Playlist } from '@/types/audio';
import { cn } from '@/lib/utils';
import { Play, MoreHorizontal, ListMusic } from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';
import Link from 'next/link';

interface PlaylistCardProps {
  playlist: Playlist;
  onPlay?: () => void;
  className?: string;
}

export function PlaylistCard({ playlist, onPlay, className }: PlaylistCardProps) {
  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPlay?.();
  };

  return (
    <Link 
      href={`/playlist/${playlist.id}`}
      className={cn(
        'group block p-4 rounded-3xl',
        'bg-gray-50/80 dark:bg-neutral-900/80 backdrop-blur-xl',
        'hover:bg-white dark:hover:bg-neutral-800',
        'hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/30',
        'border border-gray-200/30 dark:border-neutral-800/50',
        'transition-all duration-300 hover:-translate-y-1',
        className
      )}
    >
      {/* Обложка */}
      <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-gray-100 dark:bg-neutral-800 shadow-lg group-hover:shadow-xl transition-shadow">
        <SafeImage
          src={playlist.coverUrl}
          alt={playlist.title}
          className="group-hover:scale-105 transition-transform duration-500"
          fallbackType="playlist"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Play кнопка при наведении */}
        <button
          onClick={handlePlayClick}
          className={cn(
            'absolute bottom-3 right-3 w-12 h-12 rounded-full',
            'bg-gradient-to-br from-orange-500 to-orange-600 text-white',
            'shadow-xl shadow-orange-500/30',
            'flex items-center justify-center',
            'opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0',
            'transition-all duration-300',
            'hover:scale-110 hover:shadow-orange-500/40 active:scale-95'
          )}
        >
          <Play className="w-6 h-6 ml-0.5" />
        </button>
      </div>

      {/* Информация */}
      <h3 className="font-bold truncate mb-1 text-black dark:text-white">{playlist.title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
        {playlist.trackCount} {getTracksWord(playlist.trackCount)}
      </p>
    </Link>
  );
}

/**
 * Склонение слова "трек"
 */
function getTracksWord(count: number): string {
  const lastTwo = count % 100;
  const lastOne = count % 10;
  
  if (lastTwo >= 11 && lastTwo <= 19) {
    return 'треков';
  }
  
  if (lastOne === 1) {
    return 'трек';
  }
  
  if (lastOne >= 2 && lastOne <= 4) {
    return 'трека';
  }
  
  return 'треков';
}
