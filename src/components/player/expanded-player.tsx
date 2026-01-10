/**
 * Полноэкранный плеер с текстом песни
 * @module components/player/expanded-player
 */

'use client';

import { useState, useEffect } from 'react';
import { usePlayerStore } from '@/store/player';
import { useCoversStore, fetchDeezerCover } from '@/store/covers';
import { PlayerState, RepeatMode, MusicSource } from '@/types/audio';
import { formatDuration, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { vkApiService } from '@/services/vk';
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
  Heart,
  ChevronDown,
  Music2,
  Loader2,
} from 'lucide-react';

export function ExpandedPlayer() {
  const {
    currentTrack,
    playerState,
    progress,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffled,
    isExpanded,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    toggleExpanded,
  } = usePlayerStore();

  const { getCover, setCover, isLoading, setLoading } = useCoversStore();
  const [coverUrl, setCoverUrl] = useState<string | undefined>();
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [lyricsError, setLyricsError] = useState<string | null>(null);

  // Загружаем обложку
  useEffect(() => {
    if (!currentTrack) {
      setCoverUrl(undefined);
      return;
    }

    const fetchCover = async () => {
      if (currentTrack.coverUrl) {
        setCoverUrl(currentTrack.coverUrl);
        return;
      }

      const cachedCover = getCover(currentTrack.id);
      if (cachedCover) {
        setCoverUrl(cachedCover);
        return;
      }

      if (isLoading(currentTrack.id)) return;

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

  // Загружаем текст песни
  useEffect(() => {
    if (!currentTrack || !isExpanded) {
      setLyrics(null);
      setLyricsError(null);
      return;
    }

    const fetchLyrics = async () => {
      setLyricsLoading(true);
      setLyricsError(null);
      setLyrics(null);

      try {
        // Для VK треков с lyrics_id
        if (currentTrack.source === MusicSource.VK && currentTrack.lyricsId) {
          const result = await vkApiService.getLyrics(currentTrack.lyricsId);
          if (result?.text) {
            setLyrics(result.text);
          } else {
            setLyricsError('Текст песни не найден');
          }
        } else {
          setLyricsError('Текст недоступен для этого трека');
        }
      } catch (err) {
        console.error('Error fetching lyrics:', err);
        setLyricsError('Ошибка загрузки текста');
      } finally {
        setLyricsLoading(false);
      }
    };

    fetchLyrics();
  }, [currentTrack?.id, currentTrack?.lyricsId, isExpanded]);

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  if (!currentTrack || !isExpanded) {
    return null;
  }

  const isPlaying = playerState === PlayerState.PLAYING;
  const isLoading_ = playerState === PlayerState.LOADING;

  return (
    <div className="fixed inset-0 lg:left-64 xl:left-72 z-[60] bg-gradient-to-b from-neutral-900 via-neutral-900 to-black animate-fade-in">
      {/* Фоновое размытие обложки */}
      {coverUrl && (
        <div 
          className="absolute inset-0 opacity-20 blur-3xl scale-110"
          style={{
            backgroundImage: `url(${coverUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* Контент */}
      <div className="relative h-full flex flex-col">
        {/* Хедер с кнопкой свернуть */}
        <div className="flex items-center justify-between p-4 md:p-6">
          <div className="w-12" />
          <Tooltip content="Свернуть плеер">
            <Button
              variant="icon"
              onClick={toggleExpanded}
              className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full"
            >
              <ChevronDown className="w-6 h-6" />
            </Button>
          </Tooltip>
          <div className="w-12" />
        </div>

        {/* Основной контент */}
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 md:gap-12 px-4 md:px-12 pb-8 overflow-hidden">
          {/* Левая часть - обложка и управление */}
          <div className="flex flex-col items-center gap-6 lg:gap-8 w-full lg:w-1/2 max-w-lg">
            {/* Обложка */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-3xl overflow-hidden shadow-2xl bg-neutral-800 flex-shrink-0">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600">
                  <Music2 className="w-24 h-24 md:w-32 md:h-32 text-white/50" />
                </div>
              )}
            </div>

            {/* Информация о треке */}
            <div className="text-center w-full max-w-md">
              <h2 className="text-2xl md:text-3xl font-bold text-white truncate px-4">
                {currentTrack.title}
              </h2>
              <p className="text-lg md:text-xl text-white/60 truncate px-4 mt-2">
                {currentTrack.artist}
              </p>
            </div>

            {/* Прогресс бар */}
            <div className="w-full max-w-md px-4">
              <div className="relative h-2 bg-white/20 rounded-full group cursor-pointer">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={progress}
                  onChange={handleProgressChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-100"
                  style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `calc(${duration ? (progress / duration) * 100 : 0}% - 8px)` }}
                />
              </div>
              <div className="flex justify-between text-sm text-white/50 mt-2">
                <span>{formatDuration(progress)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>

            {/* Контролы воспроизведения */}
            <div className="flex items-center gap-4 md:gap-6">
              <Tooltip content={isShuffled ? 'Отключить перемешивание' : 'Включить перемешивание'}>
                <Button
                  variant="icon"
                  onClick={toggleShuffle}
                  className={cn(
                    'w-10 h-10 md:w-12 md:h-12 text-white/70 hover:text-white',
                    isShuffled && 'text-orange-400 hover:text-orange-300'
                  )}
                >
                  <Shuffle className="w-5 h-5 md:w-6 md:h-6" />
                </Button>
              </Tooltip>

              <Tooltip content="Предыдущий трек">
                <Button
                  variant="icon"
                  onClick={previous}
                  className="w-12 h-12 md:w-14 md:h-14 text-white hover:scale-105 transition-transform"
                >
                  <SkipBack className="w-6 h-6 md:w-7 md:h-7" />
                </Button>
              </Tooltip>

              <Tooltip content={isPlaying ? 'Пауза' : 'Воспроизвести'}>
                <Button
                  variant="icon"
                  onClick={togglePlay}
                  disabled={isLoading_}
                  className="w-16 h-16 md:w-20 md:h-20 bg-white text-black shadow-xl hover:scale-105 active:scale-95 transition-all rounded-full"
                >
                  {isLoading_ ? (
                    <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-8 h-8 md:w-10 md:h-10" />
                  ) : (
                    <Play className="w-8 h-8 md:w-10 md:h-10 ml-1" />
                  )}
                </Button>
              </Tooltip>

              <Tooltip content="Следующий трек">
                <Button
                  variant="icon"
                  onClick={next}
                  className="w-12 h-12 md:w-14 md:h-14 text-white hover:scale-105 transition-transform"
                >
                  <SkipForward className="w-6 h-6 md:w-7 md:h-7" />
                </Button>
              </Tooltip>

              <Tooltip
                content={
                  repeatMode === RepeatMode.OFF
                    ? 'Повторять всё'
                    : repeatMode === RepeatMode.ALL
                    ? 'Повторять один'
                    : 'Отключить повтор'
                }
              >
                <Button
                  variant="icon"
                  onClick={toggleRepeat}
                  className={cn(
                    'w-10 h-10 md:w-12 md:h-12 text-white/70 hover:text-white',
                    repeatMode !== RepeatMode.OFF && 'text-orange-400 hover:text-orange-300'
                  )}
                >
                  {repeatMode === RepeatMode.ONE ? (
                    <Repeat1 className="w-5 h-5 md:w-6 md:h-6" />
                  ) : (
                    <Repeat className="w-5 h-5 md:w-6 md:h-6" />
                  )}
                </Button>
              </Tooltip>
            </div>

            {/* Дополнительные контролы */}
            <div className="flex items-center gap-4">
              <Tooltip content="Добавить в избранное">
                <Button
                  variant="icon"
                  className="w-10 h-10 text-white/70 hover:text-red-400"
                >
                  <Heart className="w-5 h-5" />
                </Button>
              </Tooltip>

              <div className="flex items-center gap-2">
                <Tooltip content={isMuted || volume === 0 ? 'Включить звук' : 'Выключить звук'}>
                  <Button
                    variant="icon"
                    onClick={toggleMute}
                    className="w-10 h-10 text-white/70 hover:text-white"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </Button>
                </Tooltip>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-24 md:w-32"
                />
              </div>
            </div>
          </div>

          {/* Правая часть - текст песни */}
          <div className="w-full lg:w-1/2 h-64 lg:h-full max-w-lg flex flex-col">
            <h3 className="text-lg font-semibold text-white/80 mb-4 px-4">
              Текст песни
            </h3>
            <div className="flex-1 overflow-y-auto px-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              {lyricsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
                </div>
              ) : lyricsError ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Music2 className="w-16 h-16 text-white/20 mb-4" />
                  <p className="text-white/50">{lyricsError}</p>
                </div>
              ) : lyrics ? (
                <div className="text-white/80 text-lg leading-relaxed whitespace-pre-wrap pb-8">
                  {lyrics}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Music2 className="w-16 h-16 text-white/20 mb-4" />
                  <p className="text-white/50">Текст недоступен</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
