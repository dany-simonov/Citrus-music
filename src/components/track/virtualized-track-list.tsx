/**
 * Виртуализированный список треков
 * Простая реализация виртуализации без внешних библиотек
 * @module components/track/virtualized-track-list
 */

'use client';

import { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { Track } from '@/types/audio';
import { TrackItem } from './track-item';

interface VirtualizedTrackListProps {
  tracks: Track[];
  showIndex?: boolean;
  onTrackClick?: (track: Track, index: number) => void;
  onRemove?: (trackId: string) => void;
  className?: string;
  /** Высота элемента в пикселях */
  itemHeight?: number;
}

// Размер элемента по умолчанию (включая padding)
const DEFAULT_ITEM_HEIGHT = 64;
// Количество дополнительных элементов сверху и снизу
const OVERSCAN = 5;

export function VirtualizedTrackList({
  tracks,
  showIndex = false,
  onTrackClick,
  onRemove,
  className,
  itemHeight = DEFAULT_ITEM_HEIGHT,
}: VirtualizedTrackListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  // Обновление высоты контейнера
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const availableHeight = window.innerHeight - rect.top - 120; // Место для плеера
        setContainerHeight(Math.max(400, availableHeight));
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Обработка скролла
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Вычисление видимых элементов
  const { startIndex, endIndex, visibleTracks, offsetY } = useMemo(() => {
    const totalHeight = tracks.length * itemHeight;
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - OVERSCAN);
    const visibleCount = Math.ceil(containerHeight / itemHeight) + OVERSCAN * 2;
    const end = Math.min(tracks.length, start + visibleCount);
    
    return {
      startIndex: start,
      endIndex: end,
      visibleTracks: tracks.slice(start, end),
      offsetY: start * itemHeight,
    };
  }, [tracks, scrollTop, containerHeight, itemHeight]);

  const totalHeight = tracks.length * itemHeight;

  // Если треков мало - обычный рендер без виртуализации
  if (tracks.length < 50) {
    return (
      <div className={className}>
        <div className="space-y-0.5 md:space-y-1">
          {tracks.map((track, index) => (
            <TrackItem
              key={track.id}
              track={track}
              index={index}
              showIndex={showIndex}
              onClick={onTrackClick ? () => onTrackClick(track, index) : undefined}
              onRemove={onRemove ? () => onRemove(track.id) : undefined}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={className}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      {/* Внутренний контейнер с полной высотой для правильного скроллбара */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Видимые элементы */}
        <div style={{ position: 'absolute', top: offsetY, left: 0, right: 0 }}>
          {visibleTracks.map((track, i) => {
            const actualIndex = startIndex + i;
            return (
              <div key={track.id} style={{ height: itemHeight }}>
                <TrackItem
                  track={track}
                  index={actualIndex}
                  showIndex={showIndex}
                  onClick={onTrackClick ? () => onTrackClick(track, actualIndex) : undefined}
                  onRemove={onRemove ? () => onRemove(track.id) : undefined}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
