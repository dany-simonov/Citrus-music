/**
 * Store для кэширования обложек
 * @module store/covers
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CoversState {
  // Кэш: trackId -> coverUrl
  covers: Record<string, string>;
  // В процессе загрузки
  loading: Set<string>;
  
  // Действия
  setCover: (trackId: string, coverUrl: string) => void;
  getCover: (trackId: string) => string | undefined;
  setLoading: (trackId: string, isLoading: boolean) => void;
  isLoading: (trackId: string) => boolean;
}

export const useCoversStore = create<CoversState>()(
  persist(
    (set, get) => ({
      covers: {},
      loading: new Set(),
      
      setCover: (trackId, coverUrl) => {
        set((state) => ({
          covers: { ...state.covers, [trackId]: coverUrl }
        }));
      },
      
      getCover: (trackId) => {
        return get().covers[trackId];
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
    }),
    {
      name: 'citrus-covers-cache',
      partialize: (state) => ({ covers: state.covers }),
    }
  )
);

/**
 * Поиск обложки через Deezer API (через наш прокси)
 */
export async function fetchDeezerCover(artist: string, title: string): Promise<string | null> {
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
}
