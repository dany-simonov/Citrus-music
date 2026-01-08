/**
 * Zustand store для управления аутентификацией
 * @module store/auth
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/lib/config';
import { vkAuthService } from '@/services/vk';
import type { User, VKAuthTokens, YandexAuthTokens } from '@/types/auth';
import { MusicSource } from '@/types/audio';

interface AuthState {
  // Состояние
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  vkTokens: VKAuthTokens | null;
  yandexTokens: YandexAuthTokens | null;
  error: string | null;
  
  // VK Actions
  initiateVKAuth: () => Promise<void>;
  handleVKCallback: (code: string, state: string) => Promise<void>;
  setVKUser: (user: User) => void;
  logoutVK: () => void;
  
  // Yandex Actions (будут реализованы позже)
  initiateYandexAuth: () => Promise<void>;
  handleYandexCallback: (code: string) => Promise<void>;
  setYandexUser: (user: User) => void;
  logoutYandex: () => void;
  
  // Common Actions
  clearError: () => void;
  checkAuth: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      isLoading: false,
      user: null,
      vkTokens: null,
      yandexTokens: null,
      error: null,
      
      // VK Auth
      initiateVKAuth: async () => {
        try {
          set({ isLoading: true, error: null });
          const authUrl = await vkAuthService.initiateAuth();
          window.location.href = authUrl;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to initiate VK auth',
          });
        }
      },
      
      handleVKCallback: async (code: string, state: string) => {
        try {
          set({ isLoading: true, error: null });
          const tokens = await vkAuthService.handleCallback(code, state);
          set({
            vkTokens: tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'VK auth failed',
          });
          throw error;
        }
      },
      
      setVKUser: (user: User) => {
        set({ user: { ...user, source: MusicSource.VK } });
      },
      
      logoutVK: () => {
        vkAuthService.logout();
        set({
          vkTokens: null,
          isAuthenticated: get().yandexTokens !== null,
          user: get().yandexTokens ? get().user : null,
        });
      },
      
      // Yandex Auth (placeholder - будет реализовано позже)
      initiateYandexAuth: async () => {
        set({ error: 'Yandex auth not implemented yet' });
      },
      
      handleYandexCallback: async () => {
        set({ error: 'Yandex auth not implemented yet' });
      },
      
      setYandexUser: (user: User) => {
        set({ user: { ...user, source: MusicSource.YANDEX } });
      },
      
      logoutYandex: () => {
        set({
          yandexTokens: null,
          isAuthenticated: get().vkTokens !== null,
          user: get().vkTokens ? get().user : null,
        });
      },
      
      // Common
      clearError: () => set({ error: null }),
      
      checkAuth: async () => {
        const tokens = vkAuthService.getTokens();
        if (tokens) {
          const validTokens = await vkAuthService.ensureValidTokens();
          if (validTokens) {
            set({
              vkTokens: validTokens,
              isAuthenticated: true,
            });
            return;
          }
        }
        set({ isAuthenticated: false, vkTokens: null });
      },
      
      logout: () => {
        vkAuthService.logout();
        set({
          isAuthenticated: false,
          user: null,
          vkTokens: null,
          yandexTokens: null,
          error: null,
        });
      },
    }),
    {
      name: STORAGE_KEYS.USER,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
