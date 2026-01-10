/**
 * Store для кэширования обложек
 * Оптимизированная версия с кэшированием "не найдено"
 * @module store/covers
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Специальная константа для "не найдено" - кэшируем чтобы не запрашивать повторно
const NOT_FOUND = '__NOT_FOUND__';

interface CoversState {
  // Кэш: trackId -> coverUrl или NOT_FOUND
  covers: Record<string, string>;
  // В процессе загрузки
  loading: Set<string>;
  // Очередь на загрузку (для throttling)
  queue: Set<string>;
  
  // Действия
  setCover: (trackId: string, coverUrl: string | null) => void;
  getCover: (trackId: string) => string | null | undefined;
  hasCover: (trackId: string) => boolean;
  setLoading: (trackId: string, isLoading: boolean) => void;
  isLoading: (trackId: string) => boolean;
  addToQueue: (trackId: string) => void;
  removeFromQueue: (trackId: string) => void;
  isInQueue: (trackId: string) => boolean;
}

export const useCoversStore = create<CoversState>()(
  persist(
    (set, get) => ({
      covers: {},
      loading: new Set(),
      queue: new Set(),
      
      setCover: (trackId, coverUrl) => {
        set((state) => ({
          covers: { 
            ...state.covers, 
            [trackId]: coverUrl || NOT_FOUND  // Кэшируем даже "не найдено"
          }
        }));
      },
      
      getCover: (trackId) => {
        const cover = get().covers[trackId];
        if (cover === NOT_FOUND) return null;  // Явно возвращаем null для "не найдено"
        return cover;
      },
      
      // Проверяет, есть ли в кэше (включая "не найдено")
      hasCover: (trackId) => {
        return trackId in get().covers;
      },
      
      setLoading: (trackId, isLoading) => {
        set((state) => {
          const newLoading = new Set(state.loading);
          if (isLoading) {
            newLoading.add(trackId);
          } else {
            newLoading.delete(trackId);
          }
          return { loading: newLoading };
        });
      },
      
      isLoading: (trackId) => {
        return get().loading.has(trackId);
      },
      
      addToQueue: (trackId) => {
        set((state) => {
          const newQueue = new Set(state.queue);
          newQueue.add(trackId);
          return { queue: newQueue };
        });
      },
      
      removeFromQueue: (trackId) => {
        set((state) => {
          const newQueue = new Set(state.queue);
          newQueue.delete(trackId);
          return { queue: newQueue };
        });
      },
      
      isInQueue: (trackId) => {
        return get().queue.has(trackId);
      },
    }),
    {
      name: 'citrus-covers-cache',
      partialize: (state) => ({ covers: state.covers }),
    }
  )
);

// Throttle для Deezer запросов - не более N одновременных
const MAX_CONCURRENT_REQUESTS = 3;
let activeRequests = 0;
const pendingCallbacks: (() => void)[] = [];

async function throttledFetch<T>(fn: () => Promise<T>): Promise<T> {
  if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
    // Ждём освобождения слота
    await new Promise<void>(resolve => {
      pendingCallbacks.push(resolve);
    });
  }
  
  activeRequests++;
  try {
    return await fn();
  } finally {
    activeRequests--;
    // Разрешаем следующий в очереди
    const next = pendingCallbacks.shift();
    if (next) next();
  }
}

/**
 * Поиск обложки через Deezer API (через наш прокси)
 * С throttling чтобы не перегружать API
 */
export async function fetchDeezerCover(artist: string, title: string): Promise<string | null> {
  return throttledFetch(async () => {
    try {
      // Очищаем название от feat. и прочего
      const cleanTitle = title.replace(/\s*\(.*?\)\s*/g, '').replace(/\s*feat\..*$/i, '').trim();
      const cleanArtist = artist.split(',')[0].trim();
      
      const query = `${cleanArtist} ${cleanTitle}`;
      const response = await fetch(`/api/deezer?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) return null;
      
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        const track = data.data[0];
        // Предпочитаем большие обложки
        return track.album?.cover_xl || track.album?.cover_big || track.album?.cover_medium || null;
      }
    } catch (error) {
      console.error('Deezer cover search failed:', error);
    }
    
    return null;
  });
}
