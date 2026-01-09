/**
 * Глобальный контроллер аудио - работает на уровне приложения
 * Не перемонтируется при переходе между страницами
 * @module components/player/global-audio-controller
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePlayerStore } from '@/store/player';
import { PlayerState } from '@/types/audio';

// Глобальный audio элемент - создаётся один раз
let globalAudio: HTMLAudioElement | null = null;

function getGlobalAudio(): HTMLAudioElement {
  if (typeof window === 'undefined') {
    return null as unknown as HTMLAudioElement;
  }
  
  if (!globalAudio) {
    globalAudio = new Audio();
    globalAudio.preload = 'auto';
    // Разрешаем воспроизведение с разных источников
    globalAudio.crossOrigin = 'anonymous';
  }
  
  return globalAudio;
}

export function GlobalAudioController() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackIdRef = useRef<string | null>(null);
  
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

  // Получаем или создаём глобальный audio элемент
  useEffect(() => {
    audioRef.current = getGlobalAudio();
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
        audioRef.current.play().catch(console.error);
      }
    } else {
      // Переходим к следующему треку
      next();
    }
  }, [repeatMode, next]);

  const handleCanPlay = useCallback(() => {
    const store = usePlayerStore.getState();
    // Только если пользователь хочет играть
    if (store.playerState === PlayerState.LOADING) {
      setPlayerState(PlayerState.PLAYING);
      audioRef.current?.play().catch((error) => {
        console.error('Failed to play:', error);
        setPlayerState(PlayerState.ERROR);
      });
    }
  }, [setPlayerState]);

  const handleError = useCallback((e: Event) => {
    const audio = e.target as HTMLAudioElement;
    console.error('Audio error:', audio.error);
    
    // Не показываем ошибку если просто нет источника
    if (audio.src && audio.error) {
      setPlayerState(PlayerState.ERROR);
    }
  }, [setPlayerState]);

  const handlePlay = useCallback(() => {
    const store = usePlayerStore.getState();
    if (store.playerState !== PlayerState.PLAYING) {
      setPlayerState(PlayerState.PLAYING);
    }
  }, [setPlayerState]);

  const handlePause = useCallback(() => {
    const store = usePlayerStore.getState();
    if (store.playerState === PlayerState.PLAYING) {
      setPlayerState(PlayerState.PAUSED);
    }
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
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [handleLoadedMetadata, handleTimeUpdate, handleEnded, handleCanPlay, handleError, handlePlay, handlePause]);

  // Загружаем новый трек
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Проверяем, изменился ли трек
    const newTrackId = currentTrack?.id ?? null;
    if (newTrackId === currentTrackIdRef.current) {
      return; // Трек не изменился
    }
    
    currentTrackIdRef.current = newTrackId;

    if (currentTrack?.audioUrl) {
      setPlayerState(PlayerState.LOADING);
      audio.src = currentTrack.audioUrl;
      audio.load();
    } else if (!currentTrack) {
      audio.pause();
      audio.src = '';
      setProgress(0);
      setDuration(0);
      setPlayerState(PlayerState.IDLE);
    }
  }, [currentTrack, setProgress, setDuration, setPlayerState]);

  // Управляем воспроизведением
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.audioUrl) return;

    if (playerState === PlayerState.PLAYING) {
      if (audio.paused) {
        audio.play().catch((error) => {
          console.error('Failed to play:', error);
          setPlayerState(PlayerState.ERROR);
        });
      }
    } else if (playerState === PlayerState.PAUSED) {
      if (!audio.paused) {
        audio.pause();
      }
    }
  }, [playerState, currentTrack, setPlayerState]);

  // Управляем громкостью
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Seek - подписка на store для поиска по треку
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

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
