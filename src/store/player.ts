/**
 * Zustand store для управления плеером
 * @module store/player
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/lib/config';
import type { Track, QueueItem } from '@/types/audio';
import { PlayerState, RepeatMode } from '@/types/audio';

interface PlayerStore {
  // Состояние плеера
  currentTrack: Track | null;
  playerState: PlayerState;
  progress: number; // текущая позиция в секундах
  duration: number; // общая длительность в секундах
  volume: number; // 0-1
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  
  // Очередь воспроизведения
  queue: QueueItem[];
  queueIndex: number;
  originalQueue: QueueItem[]; // для восстановления после отключения shuffle
  
  // Actions
  setCurrentTrack: (track: Track | null) => void;
  setPlayerState: (state: PlayerState) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  
  // Queue Actions
  addToQueue: (track: Track, source?: 'user' | 'autoplay' | 'playlist') => void;
  addMultipleToQueue: (tracks: Track[], source?: 'user' | 'autoplay' | 'playlist') => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  playFromQueue: (index: number) => void;
  
  // Playback Actions
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  
  // Playlist Actions
  playPlaylist: (tracks: Track[], startIndex?: number) => void;
}

/**
 * Перемешивание массива (Fisher-Yates)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentTrack: null,
      playerState: PlayerState.IDLE,
      progress: 0,
      duration: 0,
      volume: 0.8,
      isMuted: false,
      repeatMode: RepeatMode.OFF,
      isShuffled: false,
      queue: [],
      queueIndex: -1,
      originalQueue: [],
      
      // Basic setters
      setCurrentTrack: (track) => set({ currentTrack: track }),
      setPlayerState: (state) => set({ playerState: state }),
      setProgress: (progress) => set({ progress }),
      setDuration: (duration) => set({ duration }),
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
      
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      
      toggleRepeat: () => set((state) => {
        const modes = [RepeatMode.OFF, RepeatMode.ALL, RepeatMode.ONE];
        const currentIndex = modes.indexOf(state.repeatMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        return { repeatMode: modes[nextIndex] };
      }),
      
      toggleShuffle: () => {
        const { isShuffled, queue, originalQueue, queueIndex, currentTrack } = get();
        
        if (!isShuffled) {
          // Включаем shuffle
          const newOriginalQueue = [...queue];
          const currentItem = queue[queueIndex];
          
          // Убираем текущий трек из перемешиваемого списка
          const toShuffle = queue.filter((_, i) => i !== queueIndex);
          const shuffled = shuffleArray(toShuffle);
          
          // Текущий трек остаётся первым
          const newQueue = currentItem ? [currentItem, ...shuffled] : shuffled;
          
          set({
            isShuffled: true,
            originalQueue: newOriginalQueue,
            queue: newQueue,
            queueIndex: 0,
          });
        } else {
          // Выключаем shuffle
          const currentTrackId = currentTrack?.id;
          const newIndex = originalQueue.findIndex((item) => item.track.id === currentTrackId);
          
          set({
            isShuffled: false,
            queue: originalQueue,
            queueIndex: newIndex >= 0 ? newIndex : 0,
            originalQueue: [],
          });
        }
      },
      
      // Queue management - добавляет СЛЕДУЮЩИМ треком, лимит 30 треков
      addToQueue: (track, source = 'user') => {
        const item: QueueItem = {
          track,
          addedAt: new Date(),
          source,
        };
        set((state) => {
          const MAX_QUEUE_SIZE = 30;
          const { queue, queueIndex } = state;
          
          // Вставляем трек сразу после текущего
          const newQueue = [
            ...queue.slice(0, queueIndex + 1),
            item,
            ...queue.slice(queueIndex + 1),
          ];
          
          // Ограничиваем размер очереди (удаляем старые треки в конце)
          const limitedQueue = newQueue.length > MAX_QUEUE_SIZE 
            ? newQueue.slice(0, MAX_QUEUE_SIZE) 
            : newQueue;
          
          return { queue: limitedQueue };
        });
      },
      
      addMultipleToQueue: (tracks, source = 'playlist') => {
        const items: QueueItem[] = tracks.map((track) => ({
          track,
          addedAt: new Date(),
          source,
        }));
        set((state) => {
          const MAX_QUEUE_SIZE = 30;
          const { queue, queueIndex } = state;
          
          // Вставляем треки сразу после текущего
          const newQueue = [
            ...queue.slice(0, queueIndex + 1),
            ...items,
            ...queue.slice(queueIndex + 1),
          ];
          
          // Ограничиваем размер очереди
          const limitedQueue = newQueue.length > MAX_QUEUE_SIZE 
            ? newQueue.slice(0, MAX_QUEUE_SIZE) 
            : newQueue;
          
          return { queue: limitedQueue };
        });
      },
      
      removeFromQueue: (index) => {
        set((state) => {
          const newQueue = state.queue.filter((_, i) => i !== index);
          let newIndex = state.queueIndex;
          
          // Корректируем индекс если удалили элемент до текущего
          if (index < state.queueIndex) {
            newIndex--;
          } else if (index === state.queueIndex && newQueue.length > 0) {
            // Если удалили текущий трек, оставляем индекс (следующий станет текущим)
            newIndex = Math.min(newIndex, newQueue.length - 1);
          }
          
          return {
            queue: newQueue,
            queueIndex: newIndex,
            currentTrack: newQueue[newIndex]?.track || null,
          };
        });
      },
      
      clearQueue: () => set({
        queue: [],
        queueIndex: -1,
        currentTrack: null,
        playerState: PlayerState.IDLE,
      }),
      
      playFromQueue: (index) => {
        const { queue } = get();
        if (index >= 0 && index < queue.length) {
          set({
            queueIndex: index,
            currentTrack: queue[index].track,
            playerState: PlayerState.LOADING,
            progress: 0,
          });
        }
      },
      
      // Playback control
      play: () => set({ playerState: PlayerState.PLAYING }),
      pause: () => set({ playerState: PlayerState.PAUSED }),
      
      togglePlay: () => {
        const { playerState } = get();
        if (playerState === PlayerState.PLAYING) {
          set({ playerState: PlayerState.PAUSED });
        } else if (playerState === PlayerState.PAUSED || playerState === PlayerState.IDLE) {
          set({ playerState: PlayerState.PLAYING });
        }
      },
      
      next: () => {
        const { queue, queueIndex, repeatMode, isShuffled } = get();
        
        if (queue.length === 0) return;
        
        let nextIndex = queueIndex + 1;
        
        if (nextIndex >= queue.length) {
          // Конец очереди
          if (repeatMode === RepeatMode.ALL) {
            nextIndex = 0;
          } else {
            // Останавливаем воспроизведение
            set({ playerState: PlayerState.IDLE, progress: 0 });
            return;
          }
        }
        
        set({
          queueIndex: nextIndex,
          currentTrack: queue[nextIndex].track,
          playerState: PlayerState.LOADING,
          progress: 0,
        });
      },
      
      previous: () => {
        const { queue, queueIndex, progress, repeatMode } = get();
        
        if (queue.length === 0) return;
        
        // Если прогресс > 3 сек, перематываем к началу
        if (progress > 3) {
          set({ progress: 0 });
          return;
        }
        
        let prevIndex = queueIndex - 1;
        
        if (prevIndex < 0) {
          if (repeatMode === RepeatMode.ALL) {
            prevIndex = queue.length - 1;
          } else {
            prevIndex = 0;
          }
        }
        
        set({
          queueIndex: prevIndex,
          currentTrack: queue[prevIndex].track,
          playerState: PlayerState.LOADING,
          progress: 0,
        });
      },
      
      seek: (time) => set({ progress: Math.max(0, time) }),
      
      // Playlist playback
      playPlaylist: (tracks, startIndex = 0) => {
        if (tracks.length === 0) return;
        
        const items: QueueItem[] = tracks.map((track) => ({
          track,
          addedAt: new Date(),
          source: 'playlist' as const,
        }));
        
        set({
          queue: items,
          originalQueue: items,
          queueIndex: startIndex,
          currentTrack: tracks[startIndex],
          playerState: PlayerState.LOADING,
          progress: 0,
          isShuffled: false,
        });
      },
    }),
    {
      name: STORAGE_KEYS.PLAYER_VOLUME,
      partialize: (state) => ({
        volume: state.volume,
        isMuted: state.isMuted,
        repeatMode: state.repeatMode,
      }),
    }
  )
);
