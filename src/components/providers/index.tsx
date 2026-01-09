/**
 * Провайдеры приложения
 * @module components/providers
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, ReactNode } from 'react';
import { ThemeProvider } from './theme-provider';
import { GlobalAudioController } from '@/components/player/global-audio-controller';

interface ProvidersProps {
  children: ReactNode;
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
        <GlobalAudioController />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
