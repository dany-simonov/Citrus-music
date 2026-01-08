/**
 * Компонент элемента списка треков
 * @module components/track/track-item
 */

'use client';

import { Track, PlayerState } from '@/types/audio';
import { usePlayerStore } from '@/store/player';
import { cn, formatDuration } from '@/lib/utils';
import { Play, Pause, MoreHorizontal, ListMusic } from 'lucide-react';
import Image from 'next/image';

interface TrackItemProps {
  track: Track;
  index?: number;
  showIndex?: boolean;
  onClick?: () => void;
  className?: string;
}

export function TrackItem({ 
  track, 
  index, 
  showIndex = false, 
  onClick,
  className 
}: TrackItemProps) {
  const { currentTrack, playerState, togglePlay } = usePlayerStore();
  
  const isCurrentTrack = currentTrack?.id === track.id;
  const isPlaying = isCurrentTrack && playerState === PlayerState.PLAYING;
  
  const handleClick = () => {
    if (isCurrentTrack) {
      togglePlay();
    } else {
      onClick?.();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group flex items-center gap-3 p-2 rounded-lg cursor-pointer',
        'hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors',
        isCurrentTrack && 'bg-gray-100 dark:bg-neutral-800',
        !track.isAvailable && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {/* Номер/иконка воспроизведения */}
      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
        {isPlaying ? (
          <div className="w-4 h-4 flex items-center justify-center">
            {/* Анимация эквалайзера */}
            <div className="flex items-end gap-0.5 h-4">
              <span className="w-1 bg-citrus-accent animate-pulse" style={{ height: '60%' }} />
              <span className="w-1 bg-citrus-accent animate-pulse" style={{ height: '100%', animationDelay: '0.2s' }} />
              <span className="w-1 bg-citrus-accent animate-pulse" style={{ height: '40%', animationDelay: '0.4s' }} />
            </div>
          </div>
        ) : isCurrentTrack ? (
          <Pause className="w-4 h-4 text-citrus-accent" />
        ) : showIndex && index !== undefined ? (
          <span className="text-sm text-gray-500 group-hover:hidden">{index + 1}</span>
        ) : null}
        
        {/* Play при наведении */}
        {!isCurrentTrack && track.isAvailable && (
          <Play className={cn(
            'w-4 h-4 text-black dark:text-white',
            showIndex && index !== undefined ? 'hidden group-hover:block' : ''
          )} />
        )}
      </div>

      {/* Обложка */}
      <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-200 dark:bg-neutral-700 flex-shrink-0">
        {track.coverUrl ? (
          <Image
            src={track.coverUrl}
            alt={track.title}
            fill
            className="object-cover"
            sizes="40px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ListMusic className="w-4 h-4 text-gray-400" />
          </div>
        )}
      </div>

      {/* Информация о треке */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'font-medium truncate',
          isCurrentTrack && 'text-citrus-accent'
        )}>
          {track.title}
        </p>
        <p className="text-sm text-gray-500 truncate">{track.artist}</p>
      </div>

      {/* Длительность */}
      <div className="text-sm text-gray-500 flex-shrink-0">
        {formatDuration(track.duration)}
      </div>

      {/* Меню */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          // TODO: Открыть контекстное меню
        }}
        className={cn(
          'p-2 rounded-full opacity-0 group-hover:opacity-100',
          'hover:bg-gray-200 dark:hover:bg-neutral-700',
          'transition-all'
        )}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </div>
  );
}
