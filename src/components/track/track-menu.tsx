/**
 * Компонент контекстного меню для трека
 * @module components/track/track-menu
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Track } from '@/types/audio';
import { cn } from '@/lib/utils';
import { 
  MoreHorizontal, 
  Play, 
  ListPlus, 
  Heart, 
  Copy, 
  Link2, 
  FileText, 
  Music2, 
  Trash2,
  Edit3,
  Share2,
  Radio,
  Download
} from 'lucide-react';

interface TrackMenuProps {
  track: Track;
  onPlay?: () => void;
  onAddToQueue?: () => void;
  onAddToPlaylist?: () => void;
  onLike?: () => void;
  onShowLyrics?: () => void;
  onShowSimilar?: () => void;
  onRemove?: () => void;
  isLiked?: boolean;
  className?: string;
}

export function TrackMenu({
  track,
  onPlay,
  onAddToQueue,
  onAddToPlaylist,
  onLike,
  onShowLyrics,
  onShowSimilar,
  onRemove,
  isLiked = false,
  className,
}: TrackMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Закрытие меню при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Закрытие при нажатии Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyName = () => {
    copyToClipboard(`${track.artist} - ${track.title}`, 'name');
  };

  const handleCopyLink = () => {
    // Генерируем ссылку на трек (в будущем можно сделать реальную)
    const link = `${window.location.origin}/track/${track.id}`;
    copyToClipboard(link, 'link');
  };

  const menuItems = [
    {
      id: 'play',
      label: 'Воспроизвести',
      icon: Play,
      onClick: () => {
        onPlay?.();
        setIsOpen(false);
      },
    },
    {
      id: 'queue',
      label: 'Добавить в очередь',
      icon: ListPlus,
      onClick: () => {
        onAddToQueue?.();
        setIsOpen(false);
      },
    },
    { id: 'divider1', divider: true },
    {
      id: 'like',
      label: isLiked ? 'Убрать из избранного' : 'Добавить в избранное',
      icon: Heart,
      onClick: () => {
        onLike?.();
        setIsOpen(false);
      },
      active: isLiked,
    },
    {
      id: 'playlist',
      label: 'Добавить в плейлист',
      icon: ListPlus,
      onClick: () => {
        onAddToPlaylist?.();
        setIsOpen(false);
      },
    },
    { id: 'divider2', divider: true },
    {
      id: 'copy-name',
      label: copySuccess === 'name' ? 'Скопировано!' : 'Скопировать название',
      icon: Copy,
      onClick: handleCopyName,
      success: copySuccess === 'name',
    },
    {
      id: 'copy-link',
      label: copySuccess === 'link' ? 'Скопировано!' : 'Скопировать ссылку',
      icon: Link2,
      onClick: handleCopyLink,
      success: copySuccess === 'link',
    },
    { id: 'divider3', divider: true },
    {
      id: 'lyrics',
      label: 'Показать текст',
      icon: FileText,
      onClick: () => {
        onShowLyrics?.();
        setIsOpen(false);
      },
    },
    {
      id: 'similar',
      label: 'Похожие треки',
      icon: Radio,
      onClick: () => {
        onShowSimilar?.();
        setIsOpen(false);
      },
    },
    {
      id: 'artist',
      label: 'Перейти к исполнителю',
      icon: Music2,
      onClick: () => {
        // TODO: Navigate to artist page
        setIsOpen(false);
      },
    },
    ...(onRemove ? [
      { id: 'divider4', divider: true },
      {
        id: 'remove',
        label: 'Удалить',
        icon: Trash2,
        onClick: () => {
          onRemove?.();
          setIsOpen(false);
        },
        danger: true,
      },
    ] : []),
  ];

  return (
    <div className={cn('relative', className)} ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={cn(
          'p-2 rounded-xl',
          'hover:bg-black/5 dark:hover:bg-white/10',
          'transition-all duration-200',
          isOpen && 'bg-black/5 dark:bg-white/10'
        )}
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className={cn(
            'absolute right-0 top-full mt-2 z-50',
            'min-w-[220px] py-2',
            'bg-white dark:bg-neutral-800',
            'rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/30',
            'border border-gray-200/50 dark:border-neutral-700/50',
            'animate-scale-in origin-top-right'
          )}
        >
          {/* Track info header */}
          <div className="px-4 py-2 border-b border-gray-100 dark:border-neutral-700 mb-2">
            <p className="font-semibold text-sm truncate">{track.title}</p>
            <p className="text-xs text-gray-500 truncate">{track.artist}</p>
          </div>

          {menuItems.map((item) => {
            if ('divider' in item && item.divider) {
              return (
                <div 
                  key={item.id} 
                  className="h-px bg-gray-100 dark:bg-neutral-700 my-2 mx-3" 
                />
              );
            }

            if (!('icon' in item) || !item.icon) return null;
            
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-left',
                  'hover:bg-gray-50 dark:hover:bg-neutral-700/50',
                  'transition-colors duration-150',
                  'danger' in item && item.danger && 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20',
                  'success' in item && item.success && 'text-green-500',
                  'active' in item && item.active && 'text-orange-500'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
