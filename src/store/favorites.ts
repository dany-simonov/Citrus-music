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

interface FavoritesState {
  // Данные
  favorites: FavoriteTrack[];
  userId: string | null;
  isLoading: boolean;
  
  // Actions
  setUserId: (userId: string | null) => void;
  addToFavorites: (track: Track) => Promise<void>;
  removeFromFavorites: (trackId: string) => Promise<void>;
  isFavorite: (trackId: string) => boolean;
  loadFavorites: () => Promise<void>;
  syncWithServer: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      userId: null,
      isLoading: false,
      
      setUserId: (userId) => {
        set({ userId });
        if (userId) {
          get().loadFavorites();
        }
      },
      
      addToFavorites: async (track) => {
        const { userId, favorites } = get();
        
        // Проверяем, не добавлен ли уже
        if (favorites.some(f => f.id === track.id)) {
          return;
        }
        
        const favoriteTrack: FavoriteTrack = {
          ...track,
          addedAt: new Date(),
        };
        
        // Добавляем локально (в начало списка)
        set({ favorites: [favoriteTrack, ...favorites] });
        
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
        const { userId, favorites } = get();
        
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
        // Предотвращаем множественные одновременные загрузки
        if (!userId || isLoading) return;
        
        set({ isLoading: true });
        
        try {
          const response = await fetch(`/api/favorites?userId=${userId}`);
          const data = await response.json();
          
          if (data.favorites) {
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
            set({ favorites });
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
        
        // Синхронизируем локальные избранные с сервером
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
    }),
    {
      name: 'citrus-favorites',
      partialize: (state) => ({
        favorites: state.favorites,
        userId: state.userId,
      }),
    }
  )
);
