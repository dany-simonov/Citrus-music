/**
 * Компонент элемента списка треков - Apple/Microsoft Style
 * @module components/track/track-item
 */

'use client';

import { Track, PlayerState } from '@/types/audio';
import { usePlayerStore } from '@/store/player';
import { cn, formatDuration } from '@/lib/utils';
import { Play, Pause, MoreHorizontal, ListMusic, Heart } from 'lucide-react';
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
        'group flex items-center gap-4 p-3 rounded-2xl cursor-pointer',
        'hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200',
        isCurrentTrack && 'bg-orange-50 dark:bg-orange-900/20',
        !track.isAvailable && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {/* Номер/иконка воспроизведения */}
      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 relative">
        {isPlaying ? (
          <div className="w-5 h-5 flex items-center justify-center">
            {/* Анимация эквалайзера */}
            <div className="flex items-end gap-0.5 h-4">
              <span className="w-1 bg-orange-500 rounded-full animate-pulse" style={{ height: '60%' }} />
              <span className="w-1 bg-orange-500 rounded-full animate-pulse" style={{ height: '100%', animationDelay: '0.2s' }} />
              <span className="w-1 bg-orange-500 rounded-full animate-pulse" style={{ height: '40%', animationDelay: '0.4s' }} />
            </div>
          </div>
        ) : isCurrentTrack ? (
          <Pause className="w-5 h-5 text-orange-500" />
        ) : showIndex && index !== undefined ? (
          <span className="text-sm text-gray-400 font-medium group-hover:opacity-0 transition-opacity">{index + 1}</span>
        ) : null}
        
        {/* Play при наведении */}
        {!isCurrentTrack && track.isAvailable && (
          <Play className={cn(
            'w-5 h-5 text-black dark:text-white absolute',
            showIndex && index !== undefined 
              ? 'opacity-0 group-hover:opacity-100 transition-opacity' 
              : 'opacity-0 group-hover:opacity-100'
          )} />
        )}
      </div>

      {/* Обложка */}
      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-neutral-800 flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
        {track.coverUrl ? (
          <Image
            src={track.coverUrl}
            alt={track.title}
            fill
            className="object-cover"
            sizes="48px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ListMusic className="w-5 h-5 text-gray-400" />
          </div>
        )}
      </div>

      {/* Информация о треке */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'font-semibold truncate',
          isCurrentTrack ? 'text-orange-500' : 'text-black dark:text-white'
        )}>
          {track.title}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{track.artist}</p>
      </div>

      {/* Длительность */}
      <div className="text-sm text-gray-400 flex-shrink-0 font-medium">
        {formatDuration(track.duration)}
      </div>

      {/* Лайк */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          // TODO: Добавить в избранное
        }}
        className={cn(
          'p-2 rounded-xl opacity-0 group-hover:opacity-100',
          'hover:bg-black/5 dark:hover:bg-white/10',
          'transition-all duration-200 text-gray-400 hover:text-red-500'
        )}
      >
        <Heart className="w-4 h-4" />
      </button>

      {/* Меню */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          // TODO: Открыть контекстное меню
        }}
        className={cn(
          'p-2 rounded-xl opacity-0 group-hover:opacity-100',
          'hover:bg-black/5 dark:hover:bg-white/10',
          'transition-all duration-200'
        )}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </div>
  );
}
