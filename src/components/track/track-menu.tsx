/**
 * Компонент контекстного меню для трека
 * @module components/track/track-menu
 */

'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Track } from '@/types/audio';
import { usePlayerStore } from '@/store/player';
import { useHistoryStore } from '@/store/history';
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
  Download,
  ChevronRight,
  User
} from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';

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

/**
 * Парсит строку исполнителей и возвращает массив имён
 */
function parseArtists(artistString: string): string[] {
  // Разделители: запятая, &, feat., ft., featuring, x (но не внутри слов)
  const separators = /\s*[,&]\s*|\s+feat\.?\s+|\s+ft\.?\s+|\s+featuring\s+|\s+x\s+/i;
  const artists = artistString.split(separators).map(a => a.trim()).filter(a => a.length > 0);
  
  // Убираем дубликаты
  return Array.from(new Set(artists));
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
  const router = useRouter();
  const { playPlaylist, toggleExpanded, currentTrack, setCurrentTrack, isExpanded } = usePlayerStore();
  const { addToHistory } = useHistoryStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showArtistSubmenu, setShowArtistSubmenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Парсим исполнителей
  const artists = useMemo(() => parseArtists(track.artist), [track.artist]);

  // Функция открытия полноэкранного плеера с текстом
  const handleShowLyrics = () => {
    // Если это не текущий трек - сначала запускаем его
    if (currentTrack?.id !== track.id) {
      playPlaylist([track], 0);
      addToHistory(track);
    }
    // Открываем полноэкранный плеер если не открыт
    if (!isExpanded) {
      // Небольшая задержка чтобы трек успел загрузиться
      setTimeout(() => toggleExpanded(), 100);
    }
    setIsOpen(false);
  };

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
      onClick: handleShowLyrics,
    },
    {
      id: 'similar',
      label: 'Похожие треки',
      icon: Radio,
      onClick: () => {
        // Переход на страницу похожих треков
        const params = new URLSearchParams({
          title: track.title,
          artist: track.artist,
          ...(track.coverUrl && { cover: track.coverUrl }),
        });
        router.push(`/similar?${params.toString()}`);
        setIsOpen(false);
      },
    },
    {
      id: 'artist',
      label: 'Перейти к исполнителю',
      icon: Music2,
      hasSubmenu: artists.length > 1,
      onClick: () => {
        if (artists.length === 1) {
          // Если один исполнитель - сразу переходим
          router.push(`/search?q=${encodeURIComponent(artists[0])}&auto=1`);
          setIsOpen(false);
        } else {
          // Если несколько - показываем подменю
          setShowArtistSubmenu(!showArtistSubmenu);
        }
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
      <Tooltip content="Ещё" disabled={isOpen}>
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
      </Tooltip>

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
            const isHeartActive = item.id === 'like' && 'active' in item && item.active;
            const hasSubmenu = 'hasSubmenu' in item && item.hasSubmenu;
            
            return (
              <div key={item.id} className="relative">
                <button
                  onClick={item.onClick}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-left',
                    'hover:bg-gray-50 dark:hover:bg-neutral-700/50',
                    'transition-colors duration-150',
                    'danger' in item && item.danger && 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20',
                    'success' in item && item.success && 'text-green-500',
                    'active' in item && item.active && 'text-red-500'
                  )}
                >
                  <Icon className={cn('w-4 h-4 flex-shrink-0', isHeartActive && 'fill-current')} />
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                  {hasSubmenu && <ChevronRight className="w-4 h-4 text-gray-400" />}
                </button>
                
                {/* Подменю для выбора исполнителя */}
                {item.id === 'artist' && showArtistSubmenu && artists.length > 1 && (
                  <div className={cn(
                    'absolute right-full top-0 mr-1 z-50',
                    'min-w-[180px] py-2',
                    'bg-white dark:bg-neutral-800',
                    'rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/30',
                    'border border-gray-200/50 dark:border-neutral-700/50',
                    'animate-scale-in origin-top-right'
                  )}>
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-neutral-700 mb-2">
                      <p className="text-xs text-gray-500">Выберите исполнителя</p>
                    </div>
                    {artists.map((artist, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          router.push(`/search?q=${encodeURIComponent(artist)}&auto=1`);
                          setIsOpen(false);
                          setShowArtistSubmenu(false);
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2.5 text-left',
                          'hover:bg-gray-50 dark:hover:bg-neutral-700/50',
                          'transition-colors duration-150'
                        )}
                      >
                        <User className="w-4 h-4 flex-shrink-0 text-gray-400" />
                        <span className="text-sm font-medium truncate">{artist}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
