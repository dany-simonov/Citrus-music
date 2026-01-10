/**
 * Компонент плеера - Apple/Microsoft Style
 * @module components/player
 */

'use client';

import { useState, useEffect } from 'react';
import { usePlayerStore } from '@/store/player';
import { useCoversStore, fetchDeezerCover } from '@/store/covers';
import { PlayerState, RepeatMode } from '@/types/audio';
import { formatDuration, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  Shuffle,
  ListMusic,
  Heart,
} from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';

export function Player() {
  const {
    currentTrack,
    playerState,
    progress,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffled,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
  } = usePlayerStore();
  
  const { getCover, setCover, isLoading, setLoading } = useCoversStore();
  const [coverUrl, setCoverUrl] = useState<string | undefined>();
  
  // Ищем обложку для текущего трека
  useEffect(() => {
    if (!currentTrack) {
      setCoverUrl(undefined);
      return;
    }
    
    const fetchCover = async () => {
      // Если есть обложка у трека
      if (currentTrack.coverUrl) {
        setCoverUrl(currentTrack.coverUrl);
        return;
      }
      
      // Проверяем кэш
      const cachedCover = getCover(currentTrack.id);
      if (cachedCover) {
        setCoverUrl(cachedCover);
        return;
      }
      
      // Если уже загружаем, пропускаем
      if (isLoading(currentTrack.id)) return;
      
      // Ищем через Deezer
      setLoading(currentTrack.id, true);
      try {
        const deezerCover = await fetchDeezerCover(currentTrack.artist, currentTrack.title);
        if (deezerCover) {
          setCover(currentTrack.id, deezerCover);
          setCoverUrl(deezerCover);
        }
      } finally {
        setLoading(currentTrack.id, false);
      }
    };
    
    fetchCover();
  }, [currentTrack?.id, currentTrack?.coverUrl, currentTrack?.artist, currentTrack?.title]);

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  // Если нет трека, не показываем плеер
  if (!currentTrack) {
    return null;
  }

  const isPlaying = playerState === PlayerState.PLAYING;
  const isLoading_ = playerState === PlayerState.LOADING;

  return (
    <div className="player-container">
      {/* Прогресс-бар вверху */}
      <div className="w-full h-1 bg-gray-200/50 dark:bg-neutral-800 relative group">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={progress}
          onChange={handleProgressChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-100"
          style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
        />
        {/* Hover indicator */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 h-3 w-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${duration ? (progress / duration) * 100 : 0}% - 6px)` }} 
        />
      </div>

      <div className="h-20 md:h-24 px-3 md:px-6 flex items-center justify-between gap-2 md:gap-4">
        {/* Информация о треке */}
        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1 md:w-1/4 md:flex-none">
          <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl overflow-hidden bg-gray-100 dark:bg-neutral-800 flex-shrink-0 shadow-lg">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ListMusic className="w-5 h-5 md:w-7 md:h-7 text-gray-400" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold truncate text-sm md:text-base">{currentTrack.title}</p>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">{currentTrack.artist}</p>
          </div>
          <Tooltip content="Добавить в избранное">
            <Button variant="icon" className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 text-gray-400 hover:text-red-500 hidden sm:flex">
              <Heart className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </Tooltip>
        </div>

        {/* Контролы воспроизведения */}
        <div className="flex flex-col items-center gap-1 md:gap-3 md:w-2/4">
          <div className="flex items-center gap-1 md:gap-3">
            <Tooltip content={isShuffled ? 'Отключить перемешивание' : 'Включить перемешивание'}>
              <Button
                variant="icon"
                onClick={toggleShuffle}
                className={cn(
                  'w-8 h-8 md:w-10 md:h-10 hidden sm:flex',
                  isShuffled && 'text-orange-500'
                )}
              >
                <Shuffle className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </Tooltip>

            <Tooltip content="Предыдущий трек">
              <Button variant="icon" onClick={previous} className="w-10 h-10 md:w-12 md:h-12 hover:scale-105 transition-transform">
                <SkipBack className="w-5 h-5 md:w-6 md:h-6" />
              </Button>
            </Tooltip>

            <Tooltip content={isPlaying ? 'Пауза' : 'Воспроизвести'}>
              <Button
                variant="icon"
                onClick={togglePlay}
                disabled={isLoading_}
                className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-500/30 hover:shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all"
              >
                {isLoading_ ? (
                  <svg
                    className="animate-spin h-7 w-7"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : isPlaying ? (
                  <Pause className="w-6 h-6 md:w-7 md:h-7" />
                ) : (
                  <Play className="w-6 h-6 md:w-7 md:h-7 ml-0.5 md:ml-1" />
                )}
              </Button>
            </Tooltip>

            <Tooltip content="Следующий трек">
              <Button variant="icon" onClick={next} className="w-10 h-10 md:w-12 md:h-12 hover:scale-105 transition-transform">
                <SkipForward className="w-5 h-5 md:w-6 md:h-6" />
              </Button>
            </Tooltip>

            <Tooltip content={
              repeatMode === RepeatMode.OFF 
                ? 'Повторять всё' 
                : repeatMode === RepeatMode.ALL 
                  ? 'Повторять один' 
                  : 'Отключить повтор'
            }>
              <Button
                variant="icon"
                onClick={toggleRepeat}
                className={cn(
                  'w-8 h-8 md:w-10 md:h-10 hidden sm:flex',
                  repeatMode !== RepeatMode.OFF && 'text-orange-500'
                )}
              >
                {repeatMode === RepeatMode.ONE ? (
                  <Repeat1 className="w-4 h-4 md:w-5 md:h-5" />
                ) : (
                  <Repeat className="w-4 h-4 md:w-5 md:h-5" />
                )}
              </Button>
            </Tooltip>
          </div>

          {/* Время */}
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 font-medium">
            <span className="min-w-[36px] text-right">{formatDuration(progress)}</span>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <span className="min-w-[36px]">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Громкость */}
        <div className="hidden md:flex items-center gap-3 justify-end w-1/4">
          <Tooltip content={isMuted || volume === 0 ? 'Включить звук' : 'Выключить звук'}>
            <Button variant="icon" onClick={toggleMute} className="w-10 h-10">
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>
          </Tooltip>
          <div className="w-28 relative group">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
