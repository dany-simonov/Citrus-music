/**
 * Zustand store для управления аутентификацией
 * @module store/auth
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/lib/config';
import { vkAuthService } from '@/services/vk';
import { yandexAuthService } from '@/services/yandex';
import type { User, VKAuthTokens, YandexAuthTokens } from '@/types/auth';
import { MusicSource } from '@/types/audio';

interface AuthState {
  // Состояние
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  vkTokens: VKAuthTokens | null;
  yandexTokens: YandexAuthTokens | null;
  yandexUser: User | null;
  vkUser: User | null;
  error: string | null;
  
  // VK Actions
  initiateVKAuth: () => Promise<void>;
  handleVKCallback: (code: string, state: string) => Promise<void>;
  setVKUser: (user: User) => void;
  logoutVK: () => void;
  
  // Yandex Actions
  initiateYandexAuth: () => void;
  handleYandexCallback: (hash: string) => void;
  setYandexUser: (user: User) => void;
  setYandexTokens: (tokens: YandexAuthTokens) => void;
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
      yandexUser: null,
      vkUser: null,
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
        set({ 
          vkUser: { ...user, source: MusicSource.VK },
          user: { ...user, source: MusicSource.VK },
        });
      },
      
      logoutVK: () => {
        vkAuthService.logout();
        const { yandexTokens, yandexUser } = get();
        set({
          vkTokens: null,
          vkUser: null,
          isAuthenticated: yandexTokens !== null,
          user: yandexUser,
        });
      },
      
      // Yandex Auth
      initiateYandexAuth: () => {
        try {
          set({ isLoading: true, error: null });
          const authUrl = yandexAuthService.initiateAuth();
          window.location.href = authUrl;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to initiate Yandex auth',
          });
        }
      },
      
      handleYandexCallback: (hash: string) => {
        try {
          set({ isLoading: true, error: null });
          const tokens = yandexAuthService.handleCallback(hash);
          set({
            yandexTokens: tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Yandex auth failed',
          });
          throw error;
        }
      },
      
      setYandexUser: (user: User) => {
        set({ 
          yandexUser: { ...user, source: MusicSource.YANDEX },
          user: get().vkUser || { ...user, source: MusicSource.YANDEX },
        });
      },
      
      setYandexTokens: (tokens: YandexAuthTokens) => {
        yandexAuthService.saveTokens(tokens);
        set({
          yandexTokens: tokens,
          isAuthenticated: true,
        });
      },
      
      logoutYandex: () => {
        yandexAuthService.logout();
        const { vkTokens, vkUser } = get();
        set({
          yandexTokens: null,
          yandexUser: null,
          isAuthenticated: vkTokens !== null,
          user: vkUser,
        });
      },
      
      // Common
      clearError: () => set({ error: null }),
      
      checkAuth: async () => {
        let hasAuth = false;
        
        // Check VK tokens
        const vkTokens = vkAuthService.getTokens();
        if (vkTokens) {
          const validTokens = await vkAuthService.ensureValidTokens();
          if (validTokens) {
            set({ vkTokens: validTokens });
            hasAuth = true;
          }
        }
        
        // Check Yandex tokens
        const yandexTokens = yandexAuthService.getTokens();
        if (yandexTokens) {
          set({ yandexTokens });
          hasAuth = true;
        }
        
        set({ isAuthenticated: hasAuth });
        if (!hasAuth) {
          set({ vkTokens: null, yandexTokens: null });
        }
      },
      
      logout: () => {
        vkAuthService.logout();
        yandexAuthService.logout();
        set({
          isAuthenticated: false,
          user: null,
          vkUser: null,
          yandexUser: null,
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
        vkUser: state.vkUser,
        yandexUser: state.yandexUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
