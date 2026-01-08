/**
 * Основной layout приложения
 * @module components/layout
 */

'use client';

import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { Player } from '@/components/player';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="ml-64 pb-24">
        <div className="max-w-7xl mx-auto p-6">
          {children}
        </div>
      </main>

      {/* Player */}
      <Player />
    </div>
  );
}

export { Sidebar } from './sidebar';
