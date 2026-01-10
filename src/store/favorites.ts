/**
 * Store для управления избранными треками
 * @module store/favorites
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Track } from '@/types/audio';

interface FavoriteTrack extends Track {
  addedAt: Date;
}

// История действий с избранным
interface FavoriteAction {
  type: 'add' | 'remove';
  track: Track;
  timestamp: Date;
}

interface FavoritesState {
  // Данные
  favorites: FavoriteTrack[];
  actionsHistory: FavoriteAction[];
  userId: string | null;
  isLoading: boolean;
  isInitialized: boolean; // Флаг синхронизации с VK
  
  // Actions
  setUserId: (userId: string | null) => void;
  addToFavorites: (track: Track) => Promise<void>;
  removeFromFavorites: (trackId: string) => Promise<void>;
  isFavorite: (trackId: string) => boolean;
  loadFavorites: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  
  // Массовое добавление (для VK)
  bulkAddToFavorites: (tracks: Track[]) => void;
  setInitialized: (value: boolean) => void;
  clearActionsHistory: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      actionsHistory: [],
      userId: null,
      isLoading: false,
      isInitialized: false,
      
      setUserId: (userId) => {
        set({ userId });
        if (userId) {
          get().loadFavorites();
        }
      },
      
      addToFavorites: async (track) => {
        const { userId, favorites, actionsHistory } = get();
        
        // Проверяем, не добавлен ли уже
        if (favorites.some(f => f.id === track.id)) {
          return;
        }
        
        const favoriteTrack: FavoriteTrack = {
          ...track,
          addedAt: new Date(),
        };
        
        // Добавляем в историю действий
        const action: FavoriteAction = {
          type: 'add',
          track,
          timestamp: new Date(),
        };
        
        // Добавляем локально (в начало списка)
        set({ 
          favorites: [favoriteTrack, ...favorites],
          actionsHistory: [action, ...actionsHistory].slice(0, 100), // Храним последние 100 действий
        });
        
        // Синхронизируем с сервером если есть userId
        if (userId) {
          try {
            await fetch('/api/favorites', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, track }),
            });
          } catch (error) {
            console.error('Error syncing favorite to server:', error);
          }
        }
      },
      
      removeFromFavorites: async (trackId) => {
        const { userId, favorites, actionsHistory } = get();
        
        // Находим трек для истории
        const track = favorites.find(f => f.id === trackId);
        
        // Добавляем в историю действий
        if (track) {
          const action: FavoriteAction = {
            type: 'remove',
            track,
            timestamp: new Date(),
          };
          set({ actionsHistory: [action, ...actionsHistory].slice(0, 100) });
        }
        
        // Удаляем локально
        set({ favorites: favorites.filter(f => f.id !== trackId) });
        
        // Синхронизируем с сервером если есть userId
        if (userId) {
          try {
            await fetch(`/api/favorites?userId=${userId}&trackId=${trackId}`, {
              method: 'DELETE',
            });
          } catch (error) {
            console.error('Error removing favorite from server:', error);
          }
        }
      },
      
      isFavorite: (trackId) => {
        return get().favorites.some(f => f.id === trackId);
      },
      
      loadFavorites: async () => {
        const { userId, isLoading } = get();
        if (!userId || isLoading) return;
        
        set({ isLoading: true });
        
        try {
          const response = await fetch(`/api/favorites?userId=${userId}`);
          const data = await response.json();
          
          if (data.favorites && data.favorites.length > 0) {
            const favorites: FavoriteTrack[] = data.favorites.map((f: any) => ({
              id: f.trackId,
              title: f.title,
              artist: f.artist,
              duration: f.duration,
              coverUrl: f.coverUrl,
              audioUrl: f.audioUrl,
              source: f.source,
              addedAt: new Date(f.addedAt),
              isAvailable: !!f.audioUrl,
            }));
            set({ favorites, isInitialized: true });
          }
        } catch (error) {
          console.error('Error loading favorites:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      syncWithServer: async () => {
        const { userId, favorites } = get();
        if (!userId) return;
        
        for (const track of favorites) {
          try {
            await fetch('/api/favorites', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, track }),
            });
          } catch (error) {
            console.error('Error syncing favorite:', error);
          }
        }
      },
      
      // Массовое добавление без дубликатов (для первоначальной загрузки VK)
      bulkAddToFavorites: (tracks) => {
        const { favorites } = get();
        const existingIds = new Set(favorites.map(f => f.id));
        
        const newTracks: FavoriteTrack[] = tracks
          .filter(t => !existingIds.has(t.id))
          .map(t => ({
            ...t,
            addedAt: new Date(),
          }));
        
        if (newTracks.length > 0) {
          // Добавляем новые треки в конец (VK треки как база)
          set({ 
            favorites: [...favorites, ...newTracks],
            isInitialized: true,
          });
        } else {
          set({ isInitialized: true });
        }
      },
      
      setInitialized: (value) => {
        set({ isInitialized: value });
      },
      
      clearActionsHistory: () => {
        set({ actionsHistory: [] });
      },
    }),
    {
      name: 'citrus-favorites',
      partialize: (state) => ({
        favorites: state.favorites,
        actionsHistory: state.actionsHistory,
        userId: state.userId,
        isInitialized: state.isInitialized,
      }),
    }
  )
);
