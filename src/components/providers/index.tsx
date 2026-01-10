/**
 * Провайдеры приложения
 * @module components/providers
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, ReactNode } from 'react';
import { ThemeProvider } from './theme-provider';
import { GlobalAudioController } from '@/components/player/global-audio-controller';
import { useFavoritesStore } from '@/store/favorites';
import { usePlaylistsStore } from '@/store/playlists';

interface ProvidersProps {
  children: ReactNode;
}

// Генерация уникального ID пользователя
function generateUserId(): string {
  return 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// Компонент для инициализации пользовательских данных
function UserDataInitializer() {
  const setFavoritesUserId = useFavoritesStore((state) => state.setUserId);
  const setPlaylistsUserId = usePlaylistsStore((state) => state.setUserId);
  
  useEffect(() => {
    // Получаем или создаём userId
    let userId = localStorage.getItem('citrus_user_id');
    if (!userId) {
      userId = generateUserId();
      localStorage.setItem('citrus_user_id', userId);
    }
    
    // Устанавливаем userId в stores
    setFavoritesUserId(userId);
    setPlaylistsUserId(userId);
  }, [setFavoritesUserId, setPlaylistsUserId]);
  
  return null;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 минута
            gcTime: 5 * 60 * 1000, // 5 минут (ранее cacheTime)
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <UserDataInitializer />
        <GlobalAudioController />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
