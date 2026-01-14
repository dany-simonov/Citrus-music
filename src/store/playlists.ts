/**
 * Store для управления пользовательскими плейлистами
 * @module store/playlists
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Track } from '@/types/audio';

export interface UserPlaylist {
  id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  trackCount: number;
  tracks: Track[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VKPlaylistCache {
  id: string;
  title: string;
  cover?: string;
  trackCount: number;
  ownerId: number;
  accessKey?: string;
}

// Время жизни кэша - 30 минут
const CACHE_TTL = 30 * 60 * 1000;

interface PlaylistsState {
  // Данные
  playlists: UserPlaylist[];
  vkPlaylists: VKPlaylistCache[];
  userId: string | null;
  isLoading: boolean;
  lastFetchedAt: number | null;
  vkPlaylistsLastFetchedAt: number | null;
  
  // Actions
  setUserId: (userId: string | null) => void;
  loadPlaylists: (forceRefresh?: boolean) => Promise<void>;
  createPlaylist: (title: string, description?: string) => Promise<UserPlaylist | null>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  updatePlaylist: (playlistId: string, data: { name?: string; description?: string }) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, track: Track) => Promise<boolean>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  getPlaylist: (playlistId: string) => UserPlaylist | undefined;
  
  // VK плейлисты
  setVKPlaylists: (playlists: VKPlaylistCache[]) => void;
  getVKPlaylists: () => VKPlaylistCache[];
  isVKPlaylistsCacheValid: () => boolean;
  isCacheValid: () => boolean;
}

export const usePlaylistsStore = create<PlaylistsState>()(
  persist(
    (set, get) => ({
      playlists: [],
      vkPlaylists: [],
      userId: null,
      isLoading: false,
      lastFetchedAt: null,
      vkPlaylistsLastFetchedAt: null,
      
      setUserId: (userId) => {
        const { userId: currentUserId } = get();
        // Только если пользователь изменился
        if (currentUserId !== userId) {
          set({ userId });
          if (userId) {
            get().loadPlaylists(true); // Принудительное обновление при смене пользователя
          }
        }
      },
      
      isCacheValid: () => {
        const { lastFetchedAt } = get();
        if (!lastFetchedAt) return false;
        return Date.now() - lastFetchedAt < CACHE_TTL;
      },
      
      isVKPlaylistsCacheValid: () => {
        const { vkPlaylistsLastFetchedAt } = get();
        if (!vkPlaylistsLastFetchedAt) return false;
        return Date.now() - vkPlaylistsLastFetchedAt < CACHE_TTL;
      },
      
      loadPlaylists: async (forceRefresh = false) => {
        const { userId, isLoading, isCacheValid, playlists } = get();
        if (!userId) return;
        
        // Не загружаем повторно, если уже загружаем или кэш валиден
        if (isLoading) return;
        if (!forceRefresh && isCacheValid() && playlists.length > 0) {
          console.log('[Playlists] Using cached data');
          return;
        }
        
        set({ isLoading: true });
        console.log('[Playlists] Loading from server...');
        
        try {
          const response = await fetch(`/api/playlists?userId=${userId}`);
          const data = await response.json();
          
          if (data.playlists) {
            const playlists: UserPlaylist[] = data.playlists.map((p: any) => ({
              id: p.id,
              title: p.title,
              description: p.description,
              coverUrl: p.coverUrl || p.tracks?.[0]?.coverUrl,
              trackCount: p._count?.tracks || p.tracks?.length || 0,
              tracks: (p.tracks || []).map((t: any) => ({
                id: t.trackId,
                title: t.title,
                artist: t.artist,
                duration: t.duration,
                coverUrl: t.coverUrl,
                audioUrl: t.audioUrl,
                source: t.source,
                isAvailable: !!t.audioUrl,
              })),
              createdAt: new Date(p.createdAt),
              updatedAt: new Date(p.updatedAt),
            }));
            set({ playlists, lastFetchedAt: Date.now() });
          }
        } catch (error) {
          console.error('Error loading playlists:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      setVKPlaylists: (vkPlaylists) => {
        set({ vkPlaylists, vkPlaylistsLastFetchedAt: Date.now() });
        console.log('[Playlists] VK playlists cached:', vkPlaylists.length);
      },
      
      getVKPlaylists: () => get().vkPlaylists,
      
      createPlaylist: async (title, description) => {
        const { userId, playlists } = get();
        if (!userId) return null;
        
        try {
          const response = await fetch('/api/playlists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, title, description }),
          });
          
          const data = await response.json();
          
          if (data.playlist) {
            const newPlaylist: UserPlaylist = {
              id: data.playlist.id,
              title: data.playlist.title,
              description: data.playlist.description,
              coverUrl: undefined,
              trackCount: 0,
              tracks: [],
              createdAt: new Date(data.playlist.createdAt),
              updatedAt: new Date(data.playlist.updatedAt),
            };
            
            set({ playlists: [newPlaylist, ...playlists] });
            return newPlaylist;
          }
        } catch (error) {
          console.error('Error creating playlist:', error);
        }
        
        return null;
      },
      
      deletePlaylist: async (playlistId) => {
        const { playlists } = get();
        
        // Удаляем локально
        set({ playlists: playlists.filter(p => p.id !== playlistId) });
        
        try {
          await fetch(`/api/playlists?playlistId=${playlistId}`, {
            method: 'DELETE',
          });
        } catch (error) {
          console.error('Error deleting playlist:', error);
        }
      },
      
      updatePlaylist: async (playlistId, data) => {
        const { playlists } = get();
        
        // Обновляем локально
        const updatedPlaylists = playlists.map(p => {
          if (p.id === playlistId) {
            return {
              ...p,
              title: data.name || p.title,
              description: data.description ?? p.description,
              updatedAt: new Date(),
            };
          }
          return p;
        });
        
        set({ playlists: updatedPlaylists });
        
        try {
          await fetch(`/api/playlists`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playlistId, ...data }),
          });
        } catch (error) {
          console.error('Error updating playlist:', error);
        }
      },
      
      addTrackToPlaylist: async (playlistId, track) => {
        const { playlists } = get();
        
        const playlist = playlists.find(p => p.id === playlistId);
        if (!playlist) return false;
        
        // Проверяем, не добавлен ли уже
        if (playlist.tracks.some(t => t.id === track.id)) {
          return false;
        }
        
        try {
          const response = await fetch('/api/playlists/tracks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playlistId, track }),
          });
          
          if (response.ok) {
            // Обновляем локально
            const updatedPlaylists = playlists.map(p => {
              if (p.id === playlistId) {
                return {
                  ...p,
                  tracks: [...p.tracks, track],
                  trackCount: p.trackCount + 1,
                  coverUrl: p.coverUrl || track.coverUrl,
                  updatedAt: new Date(),
                };
              }
              return p;
            });
            
            set({ playlists: updatedPlaylists });
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('Error adding track to playlist:', error);
          return false;
        }
      },
      
      removeTrackFromPlaylist: async (playlistId, trackId) => {
        const { playlists } = get();
        
        // Удаляем локально
        const updatedPlaylists = playlists.map(p => {
          if (p.id === playlistId) {
            const newTracks = p.tracks.filter(t => t.id !== trackId);
            return {
              ...p,
              tracks: newTracks,
              trackCount: p.trackCount - 1,
              coverUrl: newTracks[0]?.coverUrl,
              updatedAt: new Date(),
            };
          }
          return p;
        });
        
        set({ playlists: updatedPlaylists });
        
        try {
          await fetch(`/api/playlists/tracks?playlistId=${playlistId}&trackId=${trackId}`, {
            method: 'DELETE',
          });
        } catch (error) {
          console.error('Error removing track from playlist:', error);
        }
      },
      
      getPlaylist: (playlistId) => {
        return get().playlists.find(p => p.id === playlistId);
      },
    }),
    {
      name: 'citrus-user-playlists',
      partialize: (state) => ({
        playlists: state.playlists,
        vkPlaylists: state.vkPlaylists,
        userId: state.userId,
        lastFetchedAt: state.lastFetchedAt,
        vkPlaylistsLastFetchedAt: state.vkPlaylistsLastFetchedAt,
      }),
    }
  )
);
