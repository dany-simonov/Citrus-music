/**
 * Store для кэширования треков
 * Предотвращает повторные запросы к API при навигации
 * @module store/tracks-cache
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Track } from '@/types/audio';

interface TracksCache {
  // Кэш поиска: query -> tracks
  searchCache: Record<string, {
    tracks: Track[];
    timestamp: number;
  }>;
  
  // Кэш плейлистов: playlistId -> tracks
  playlistCache: Record<string, {
    tracks: Track[];
    timestamp: number;
  }>;
  
  // Время жизни кэша (5 минут)
  cacheTTL: number;
}

interface TracksCacheState extends TracksCache {
  // Поиск
  getSearchCache: (query: string) => Track[] | null;
  setSearchCache: (query: string, tracks: Track[]) => void;
  clearSearchCache: () => void;
  
  // Плейлисты
  getPlaylistCache: (playlistId: string) => Track[] | null;
  setPlaylistCache: (playlistId: string, tracks: Track[]) => void;
  clearPlaylistCache: (playlistId?: string) => void;
  
  // Очистка устаревших данных
  cleanupOldCache: () => void;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 минут

export const useTracksCacheStore = create<TracksCacheState>()(
  persist(
    (set, get) => ({
      searchCache: {},
      playlistCache: {},
      cacheTTL: CACHE_TTL,
      
      getSearchCache: (query) => {
        const cache = get().searchCache[query];
        if (!cache) return null;
        
        // Проверяем время жизни
        if (Date.now() - cache.timestamp > get().cacheTTL) {
          // Кэш устарел
          set((state) => {
            const newCache = { ...state.searchCache };
            delete newCache[query];
            return { searchCache: newCache };
          });
          return null;
        }
        
        return cache.tracks;
      },
      
      setSearchCache: (query, tracks) => {
        set((state) => ({
          searchCache: {
            ...state.searchCache,
            [query]: {
              tracks,
              timestamp: Date.now(),
            }
          }
        }));
      },
      
      clearSearchCache: () => {
        set({ searchCache: {} });
      },
      
      getPlaylistCache: (playlistId) => {
        const cache = get().playlistCache[playlistId];
        if (!cache) return null;
        
        // Проверяем время жизни
        if (Date.now() - cache.timestamp > get().cacheTTL) {
          // Кэш устарел
          set((state) => {
            const newCache = { ...state.playlistCache };
            delete newCache[playlistId];
            return { playlistCache: newCache };
          });
          return null;
        }
        
        return cache.tracks;
      },
      
      setPlaylistCache: (playlistId, tracks) => {
        set((state) => ({
          playlistCache: {
            ...state.playlistCache,
            [playlistId]: {
              tracks,
              timestamp: Date.now(),
            }
          }
        }));
      },
      
      clearPlaylistCache: (playlistId) => {
        if (playlistId) {
          set((state) => {
            const newCache = { ...state.playlistCache };
            delete newCache[playlistId];
            return { playlistCache: newCache };
          });
        } else {
          set({ playlistCache: {} });
        }
      },
      
      cleanupOldCache: () => {
        const now = Date.now();
        const ttl = get().cacheTTL;
        
        set((state) => {
          const newSearchCache: typeof state.searchCache = {};
          const newPlaylistCache: typeof state.playlistCache = {};
          
          // Очищаем устаревший кэш поиска
          for (const [key, value] of Object.entries(state.searchCache)) {
            if (now - value.timestamp < ttl) {
              newSearchCache[key] = value;
            }
          }
          
          // Очищаем устаревший кэш плейлистов
          for (const [key, value] of Object.entries(state.playlistCache)) {
            if (now - value.timestamp < ttl) {
              newPlaylistCache[key] = value;
            }
          }
          
          return {
            searchCache: newSearchCache,
            playlistCache: newPlaylistCache,
          };
        });
      },
    }),
    {
      name: 'citrus-tracks-cache',
      partialize: (state) => ({
        searchCache: state.searchCache,
        playlistCache: state.playlistCache,
      }),
    }
  )
);
