/**
 * Корневой layout приложения
 * @module app/layout
 */

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'Citrus - Музыкальное приложение',
  description: 'Слушайте музыку из ВКонтакте и Яндекс Музыки в одном месте',
  keywords: ['музыка', 'плеер', 'vk', 'яндекс музыка', 'стриминг'],
  authors: [{ name: 'Citrus Team' }],
  creator: 'Citrus',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
