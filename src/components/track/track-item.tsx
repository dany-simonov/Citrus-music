/**
 * Компонент элемента списка треков - Apple/Microsoft Style
 * @module components/track/track-item
 */

'use client';

import { Track, PlayerState } from '@/types/audio';
import { usePlayerStore } from '@/store/player';
import { useHistoryStore } from '@/store/history';
import { cn, formatDuration } from '@/lib/utils';
import { Play, Pause, Heart, ListMusic } from 'lucide-react';
import { TrackMenu } from './track-menu';
import { SafeImage } from '@/components/ui/safe-image';

interface TrackItemProps {
  track: Track;
  index?: number;
  showIndex?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
  compact?: boolean;
}

export function TrackItem({ 
  track, 
  index, 
  showIndex = false, 
  onClick,
  onRemove,
  className,
  compact = false,
}: TrackItemProps) {
  const { currentTrack, playerState, togglePlay, addToQueue, playPlaylist } = usePlayerStore();
  const { addToHistory } = useHistoryStore();
  
  const isCurrentTrack = currentTrack?.id === track.id;
  const isPlaying = isCurrentTrack && playerState === PlayerState.PLAYING;
  
  const handleClick = () => {
    if (isCurrentTrack) {
      togglePlay();
    } else if (onClick) {
      onClick();
    } else {
      // Воспроизводим трек и добавляем в историю
      playPlaylist([track], 0);
      addToHistory(track);
    }
  };

  const handlePlay = () => {
    playPlaylist([track], 0);
    addToHistory(track);
  };

  const handleAddToQueue = () => {
    addToQueue(track, 'user');
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group flex items-center gap-3 md:gap-4 p-2 md:p-3 rounded-xl md:rounded-2xl cursor-pointer',
        'hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200',
        isCurrentTrack && 'bg-orange-50 dark:bg-orange-900/20',
        !track.isAvailable && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {/* Номер/иконка воспроизведения */}
      <div className="w-6 md:w-8 h-6 md:h-8 flex items-center justify-center flex-shrink-0 relative">
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
          <Pause className="w-4 md:w-5 h-4 md:h-5 text-orange-500" />
        ) : showIndex && index !== undefined ? (
          <span className="text-xs md:text-sm text-gray-400 font-medium group-hover:opacity-0 transition-opacity">{index + 1}</span>
        ) : null}
        
        {/* Play при наведении */}
        {!isCurrentTrack && track.isAvailable !== false && (
          <Play className={cn(
            'w-4 md:w-5 h-4 md:h-5 text-black dark:text-white absolute',
            showIndex && index !== undefined 
              ? 'opacity-0 group-hover:opacity-100 transition-opacity' 
              : 'opacity-0 group-hover:opacity-100'
          )} />
        )}
      </div>

      {/* Обложка */}
      <div className={cn(
        'relative rounded-lg md:rounded-xl overflow-hidden bg-gray-100 dark:bg-neutral-800 flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow',
        compact ? 'w-10 h-10' : 'w-10 h-10 md:w-12 md:h-12'
      )}>
        <SafeImage
          src={track.coverUrl || ''}
          alt={track.title}
          fill
          className="object-cover"
          sizes="48px"
          fallbackType="track"
        />
      </div>

      {/* Информация о треке */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'font-semibold truncate text-sm md:text-base',
          isCurrentTrack ? 'text-orange-500' : 'text-black dark:text-white'
        )}>
          {track.title}
        </p>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">{track.artist}</p>
      </div>

      {/* Длительность */}
      <div className="text-xs md:text-sm text-gray-400 flex-shrink-0 font-medium hidden sm:block">
        {formatDuration(track.duration)}
      </div>

      {/* Лайк */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          // TODO: Добавить в избранное
        }}
        className={cn(
          'p-1.5 md:p-2 rounded-lg md:rounded-xl opacity-0 group-hover:opacity-100',
          'hover:bg-black/5 dark:hover:bg-white/10',
          'transition-all duration-200 text-gray-400 hover:text-red-500',
          'hidden sm:block'
        )}
      >
        <Heart className="w-4 h-4" />
      </button>

      {/* Меню */}
      <TrackMenu 
        track={track}
        onPlay={handlePlay}
        onAddToQueue={handleAddToQueue}
        onRemove={onRemove}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </div>
  );
}
