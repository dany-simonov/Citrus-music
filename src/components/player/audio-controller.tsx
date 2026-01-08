/**
 * Контроллер аудио - управляет воспроизведением
 * @module components/player/audio-controller
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePlayerStore } from '@/store/player';
import { PlayerState } from '@/types/audio';

export function AudioController() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const {
    currentTrack,
    playerState,
    volume,
    isMuted,
    repeatMode,
    setPlayerState,
    setProgress,
    setDuration,
    next,
  } = usePlayerStore();

  // Создаём audio элемент при монтировании
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = 'auto';
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  // Обработчики событий audio
  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, [setDuration]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  }, [setProgress]);

  const handleEnded = useCallback(() => {
    if (repeatMode === 'one') {
      // Повторяем текущий трек
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      // Переходим к следующему треку
      next();
    }
  }, [repeatMode, next]);

  const handleCanPlay = useCallback(() => {
    setPlayerState(PlayerState.PLAYING);
    audioRef.current?.play().catch((error) => {
      console.error('Failed to play:', error);
      setPlayerState(PlayerState.ERROR);
    });
  }, [setPlayerState]);

  const handleError = useCallback(() => {
    console.error('Audio error:', audioRef.current?.error);
    setPlayerState(PlayerState.ERROR);
  }, [setPlayerState]);

  // Подписываемся на события audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [handleLoadedMetadata, handleTimeUpdate, handleEnded, handleCanPlay, handleError]);

  // Загружаем новый трек
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack?.audioUrl) {
      audio.src = currentTrack.audioUrl;
      audio.load();
    } else {
      audio.pause();
      audio.src = '';
      setProgress(0);
      setDuration(0);
    }
  }, [currentTrack, setProgress, setDuration]);

  // Управляем воспроизведением
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.audioUrl) return;

    if (playerState === PlayerState.PLAYING) {
      audio.play().catch((error) => {
        console.error('Failed to play:', error);
        setPlayerState(PlayerState.ERROR);
      });
    } else if (playerState === PlayerState.PAUSED) {
      audio.pause();
    }
  }, [playerState, currentTrack, setPlayerState]);

  // Управляем громкостью
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Seek
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Подписываемся на изменения progress из store для seek
    const unsubscribe = usePlayerStore.subscribe(
      (state, prevState) => {
        // Если progress изменился значительно (seek), синхронизируем audio
        if (Math.abs(state.progress - prevState.progress) > 1) {
          audio.currentTime = state.progress;
        }
      }
    );

    return unsubscribe;
  }, []);

  return null; // Этот компонент не рендерит UI
}
