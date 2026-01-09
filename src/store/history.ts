/**
 * Zustand store для истории прослушивания
 * @module store/history
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Track } from '@/types/audio';

export interface HistoryItem {
  track: Track;
  playedAt: Date;
  playCount: number;
}

interface HistoryState {
  items: HistoryItem[];
  maxItems: number;
  
  // Actions
  addToHistory: (track: Track) => void;
  removeFromHistory: (trackId: string) => void;
  clearHistory: () => void;
  getRecentTracks: (count?: number) => HistoryItem[];
  getMostPlayed: (count?: number) => HistoryItem[];
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      items: [],
      maxItems: 500, // Максимум треков в истории
      
      addToHistory: (track: Track) => {
        set((state) => {
          // Проверяем, есть ли трек уже в истории
          const existingIndex = state.items.findIndex(
            (item) => item.track.id === track.id
          );
          
          let newItems: HistoryItem[];
          
          if (existingIndex !== -1) {
            // Трек уже есть - обновляем время и счётчик
            const existing = state.items[existingIndex];
            const updated: HistoryItem = {
              ...existing,
              playedAt: new Date(),
              playCount: existing.playCount + 1,
            };
            
            // Удаляем старую запись и добавляем обновлённую в начало
            newItems = [
              updated,
              ...state.items.filter((_, i) => i !== existingIndex),
            ];
          } else {
            // Новый трек
            const newItem: HistoryItem = {
              track,
              playedAt: new Date(),
              playCount: 1,
            };
            
            newItems = [newItem, ...state.items];
          }
          
          // Ограничиваем размер истории
          if (newItems.length > state.maxItems) {
            newItems = newItems.slice(0, state.maxItems);
          }
          
          return { items: newItems };
        });
      },
      
      removeFromHistory: (trackId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.track.id !== trackId),
        }));
      },
      
      clearHistory: () => {
        set({ items: [] });
      },
      
      getRecentTracks: (count = 50) => {
        return get().items.slice(0, count);
      },
      
      getMostPlayed: (count = 20) => {
        return [...get().items]
          .sort((a, b) => b.playCount - a.playCount)
          .slice(0, count);
      },
    }),
    {
      name: 'citrus-history',
      // Сериализуем даты правильно
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state?.items) {
          // Преобразуем строки обратно в Date
          state.items = state.items.map((item) => ({
            ...item,
            playedAt: new Date(item.playedAt),
          }));
        }
      },
    }
  )
);
