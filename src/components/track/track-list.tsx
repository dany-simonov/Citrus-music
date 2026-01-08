/**
 * Компонент списка треков
 * @module components/track/track-list
 */

'use client';

import { Track } from '@/types/audio';
import { usePlayerStore } from '@/store/player';
import { TrackItem } from './track-item';
import { cn } from '@/lib/utils';

interface TrackListProps {
  tracks: Track[];
  showIndex?: boolean;
  className?: string;
}

export function TrackList({ tracks, showIndex = true, className }: TrackListProps) {
  const { playPlaylist } = usePlayerStore();

  const handleTrackClick = (index: number) => {
    // Фильтруем только доступные треки для очереди
    const availableTracks = tracks.filter(t => t.isAvailable);
    
    // Находим индекс выбранного трека среди доступных
    const track = tracks[index];
    const availableIndex = availableTracks.findIndex(t => t.id === track.id);
    
    if (availableIndex !== -1) {
      playPlaylist(availableTracks, availableIndex);
    }
  };

  if (tracks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Нет треков
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      {tracks.map((track, index) => (
        <TrackItem
          key={track.id}
          track={track}
          index={index}
          showIndex={showIndex}
          onClick={() => handleTrackClick(index)}
        />
      ))}
    </div>
  );
}
