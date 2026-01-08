/**
 * Компонент карточки плейлиста
 * @module components/playlist/playlist-card
 */

'use client';

import { Playlist } from '@/types/audio';
import { cn } from '@/lib/utils';
import { Play, MoreHorizontal, ListMusic } from 'lucide-react';
import Image from 'next/image';
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
        'group block p-4 rounded-xl bg-citrus-secondary-light dark:bg-citrus-secondary-dark',
        'hover:bg-gray-200 dark:hover:bg-neutral-800 transition-all duration-200',
        className
      )}
    >
      {/* Обложка */}
      <div className="relative aspect-square rounded-lg overflow-hidden mb-4 bg-gray-200 dark:bg-neutral-700">
        {playlist.coverUrl ? (
          <Image
            src={playlist.coverUrl}
            alt={playlist.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ListMusic className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* Play кнопка при наведении */}
        <button
          onClick={handlePlayClick}
          className={cn(
            'absolute bottom-2 right-2 w-12 h-12 rounded-full',
            'bg-citrus-accent text-white shadow-lg',
            'flex items-center justify-center',
            'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0',
            'transition-all duration-200',
            'hover:scale-105 hover:bg-orange-600'
          )}
        >
          <Play className="w-6 h-6 ml-0.5" />
        </button>
      </div>

      {/* Информация */}
      <h3 className="font-semibold truncate mb-1">{playlist.title}</h3>
      <p className="text-sm text-gray-500 truncate">
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
