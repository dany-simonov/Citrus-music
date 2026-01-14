/**
 * Zustand store для управления уведомлениями
 * @module store/notifications
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/lib/config';

interface NotificationSettings {
  pushEnabled: boolean;
  newReleases: boolean;
  recommendations: boolean;
}

interface NotificationsStore {
  settings: NotificationSettings;
  permissionStatus: NotificationPermission | 'not-supported';
  
  // Actions
  setPushEnabled: (enabled: boolean) => Promise<boolean>;
  setNewReleases: (enabled: boolean) => void;
  setRecommendations: (enabled: boolean) => void;
  checkPermission: () => void;
  requestPermission: () => Promise<boolean>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
}

export const useNotificationsStore = create<NotificationsStore>()(
  persist(
    (set, get) => ({
      settings: {
        pushEnabled: false,
        newReleases: true,
        recommendations: true,
      },
      permissionStatus: 'default',
      
      checkPermission: () => {
        if (typeof window === 'undefined' || !('Notification' in window)) {
          set({ permissionStatus: 'not-supported' });
          return;
        }
        set({ permissionStatus: Notification.permission });
      },
      
      requestPermission: async () => {
        if (typeof window === 'undefined' || !('Notification' in window)) {
          set({ permissionStatus: 'not-supported' });
          return false;
        }
        
        try {
          const permission = await Notification.requestPermission();
          set({ permissionStatus: permission });
          return permission === 'granted';
        } catch (error) {
          console.error('Error requesting notification permission:', error);
          return false;
        }
      },
      
      setPushEnabled: async (enabled: boolean) => {
        if (enabled) {
          // Запрашиваем разрешение если включаем уведомления
          const granted = await get().requestPermission();
          if (granted) {
            set((state) => ({
              settings: { ...state.settings, pushEnabled: true }
            }));
            
            // Показываем тестовое уведомление
            get().sendNotification('Citrus Music 🍊', {
              body: 'Push-уведомления успешно включены!',
              icon: '/logo1.png',
              badge: '/favicon.png',
              tag: 'welcome',
            });
            
            return true;
          } else {
            set((state) => ({
              settings: { ...state.settings, pushEnabled: false }
            }));
            return false;
          }
        } else {
          set((state) => ({
            settings: { ...state.settings, pushEnabled: false }
          }));
          return true;
        }
      },
      
      setNewReleases: (enabled: boolean) => {
        set((state) => ({
          settings: { ...state.settings, newReleases: enabled }
        }));
      },
      
      setRecommendations: (enabled: boolean) => {
        set((state) => ({
          settings: { ...state.settings, recommendations: enabled }
        }));
      },
      
      sendNotification: (title: string, options?: NotificationOptions) => {
        const { settings, permissionStatus } = get();
        
        if (!settings.pushEnabled || permissionStatus !== 'granted') {
          return;
        }
        
        if (typeof window === 'undefined' || !('Notification' in window)) {
          return;
        }
        
        try {
          new Notification(title, {
            icon: '/logo1.png',
            badge: '/favicon.png',
            ...options,
          });
        } catch (error) {
          console.error('Error sending notification:', error);
        }
      },
    }),
    {
      name: STORAGE_KEYS.NOTIFICATIONS,
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);

// Хук для отправки уведомлений о новых треках
export function useTrackNotification() {
  const { sendNotification, settings } = useNotificationsStore();
  
  const notifyNewTrack = (title: string, artist: string) => {
    if (settings.newReleases) {
      sendNotification('Новый трек 🎵', {
        body: `${artist} — ${title}`,
        tag: 'new-track',
      });
    }
  };
  
  const notifyRecommendation = (title: string, artist: string) => {
    if (settings.recommendations) {
      sendNotification('Рекомендация 🎧', {
        body: `Попробуйте: ${artist} — ${title}`,
        tag: 'recommendation',
      });
    }
  };
  
  return { notifyNewTrack, notifyRecommendation };
}
