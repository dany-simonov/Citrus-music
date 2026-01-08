/**
 * Компонент плеера
 * @module components/player
 */

'use client';

import { usePlayerStore } from '@/store/player';
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
} from 'lucide-react';
import Image from 'next/image';
import { AudioController } from './audio-controller';

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

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  // Если нет трека, показываем минимальный плеер
  if (!currentTrack) {
    return (
      <>
        <AudioController />
        <div className="player-container h-20 flex items-center justify-center opacity-50">
          <p className="text-sm text-gray-500">Выберите трек для воспроизведения</p>
        </div>
      </>
    );
  }

  const isPlaying = playerState === PlayerState.PLAYING;
  const isLoading = playerState === PlayerState.LOADING;

  return (
    <>
      <AudioController />
      <div className="player-container">
        {/* Прогресс-бар вверху */}
        <div className="w-full h-1 bg-gray-200 dark:bg-neutral-800 relative group cursor-pointer">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={progress}
            onChange={handleProgressChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div
            className="h-full bg-citrus-accent transition-all"
            style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
          />
        </div>

        <div className="h-20 px-4 flex items-center justify-between">
          {/* Информация о треке */}
          <div className="flex items-center gap-3 min-w-0 w-1/4">
            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-200 dark:bg-neutral-800 flex-shrink-0">
              {currentTrack.coverUrl ? (
                <Image
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ListMusic className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{currentTrack.title}</p>
              <p className="text-sm text-gray-500 truncate">{currentTrack.artist}</p>
            </div>
          </div>

          {/* Контролы воспроизведения */}
          <div className="flex flex-col items-center gap-2 w-2/4">
            <div className="flex items-center gap-4">
              <Button
                variant="icon"
                onClick={toggleShuffle}
                className={cn(
                  'w-8 h-8',
                  isShuffled && 'text-citrus-accent'
                )}
              >
                <Shuffle className="w-4 h-4" />
              </Button>

              <Button variant="icon" onClick={previous} className="w-10 h-10">
                <SkipBack className="w-5 h-5" />
              </Button>

              <Button
                variant="icon"
                onClick={togglePlay}
                disabled={isLoading}
                className="w-12 h-12 bg-citrus-accent text-white hover:bg-orange-600"
              >
                {isLoading ? (
                  <svg
                    className="animate-spin h-6 w-6"
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
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </Button>

              <Button variant="icon" onClick={next} className="w-10 h-10">
                <SkipForward className="w-5 h-5" />
              </Button>

              <Button
                variant="icon"
                onClick={toggleRepeat}
                className={cn(
                  'w-8 h-8',
                  repeatMode !== RepeatMode.OFF && 'text-citrus-accent'
                )}
              >
                {repeatMode === RepeatMode.ONE ? (
                  <Repeat1 className="w-4 h-4" />
                ) : (
                  <Repeat className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Время */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{formatDuration(progress)}</span>
              <span>/</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Громкость */}
          <div className="flex items-center gap-2 justify-end w-1/4">
            <Button variant="icon" onClick={toggleMute} className="w-8 h-8">
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </>
  );
}
