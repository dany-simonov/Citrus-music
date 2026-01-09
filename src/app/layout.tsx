/**
 * Корневой layout приложения
 * @module app/layout
 */

import type { Metadata, Viewport } from 'next';
import { Providers } from '@/components/providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Цитрус - Музыкальное приложение',
  description: 'Слушайте музыку из ВКонтакте и Яндекс Музыки в одном месте',
  keywords: ['музыка', 'плеер', 'vk', 'яндекс музыка', 'стриминг'],
  authors: [{ name: 'Цитрус Team' }],
  creator: 'Цитрус',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="bg-white dark:bg-[#0A0A0A] text-black dark:text-white antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
