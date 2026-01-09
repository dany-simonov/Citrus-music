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

      {/* Main content - adaptive margin */}
      <main className="lg:ml-64 xl:ml-72 pb-28 pt-16 lg:pt-0 min-h-screen overflow-auto">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>

      {/* Player */}
      <Player />
    </div>
  );
}

export { Sidebar } from './sidebar';
