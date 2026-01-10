/**
 * Страница похожих треков
 * @module app/similar/page
 */

'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { TrackList } from '@/components/track';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { vkApiService } from '@/services/vk';
import { transformVKAudiosToTracks } from '@/lib/transformers';
import { useAuthStore } from '@/store/auth';
import { useCoversStore, fetchDeezerCover } from '@/store/covers';
import type { Track } from '@/types/audio';
import { 
  ArrowLeft, 
  Loader2, 
  Music2, 
  RefreshCw,
  Disc3,
} from 'lucide-react';

/**
 * Парсит строку исполнителей и возвращает массив имён
 */
function parseArtists(artistString: string): string[] {
  const separators = /\s*[,&]\s*|\s+feat\.?\s+|\s+ft\.?\s+|\s+featuring\s+|\s+x\s+/i;
  const artists = artistString.split(separators).map(a => a.trim()).filter(a => a.length > 0);
  return Array.from(new Set(artists));
}

/**
 * Перемешивание массива (Fisher-Yates)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function SimilarTracksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const trackTitle = searchParams.get('title') || '';
  const trackArtist = searchParams.get('artist') || '';
  const trackCover = searchParams.get('cover') || '';
  
  const { vkTokens } = useAuthStore();
  const { getCover, setCover, setLoading: setLoadingCover } = useCoversStore();
  
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [coverUrl, setCoverUrl] = useState<string | undefined>(trackCover || undefined);
  const [loadedPages, setLoadedPages] = useState(0);
  
  const TRACKS_PER_ARTIST = 25; // Треков на каждого исполнителя
  
  // Парсим исполнителей
  const artists = useMemo(() => parseArtists(trackArtist), [trackArtist]);
  
  // Загружаем обложку если не передана
  useEffect(() => {
    if (trackCover) {
      setCoverUrl(trackCover);
      return;
    }
    
    if (!trackArtist || !trackTitle) return;
    
    const fetchCover = async () => {
      const cacheKey = `similar_${trackArtist}_${trackTitle}`;
      const cached = getCover(cacheKey);
      if (cached) {
        setCoverUrl(cached);
        return;
      }
      
      try {
        const cover = await fetchDeezerCover(trackArtist, trackTitle);
        if (cover) {
          setCover(cacheKey, cover);
          setCoverUrl(cover);
        }
      } catch (e) {
        // Ignore
      }
    };
    
    fetchCover();
  }, [trackArtist, trackTitle, trackCover]);
  
  // Загрузка треков по всем исполнителям с рандомизацией
  const loadTracks = useCallback(async (append: boolean = false) => {
    if (!vkTokens || artists.length === 0) {
      setError('Необходимо авторизоваться через VK');
      setLoading(false);
      return;
    }
    
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      const allTracks: Track[] = [];
      const seenIds = new Set<string>();
      
      // Рандомизируем порядок исполнителей
      const shuffledArtists = shuffleArray(artists);
      
      // Загружаем треки каждого исполнителя
      for (const artist of shuffledArtists) {
        try {
          // Случайный офсет для разнообразия
          const randomOffset = append ? Math.floor(Math.random() * 50) + loadedPages * TRACKS_PER_ARTIST : Math.floor(Math.random() * 30);
          
          const result = await vkApiService.searchAudio({
            q: artist,
            performer_only: 1,
            count: TRACKS_PER_ARTIST,
            offset: randomOffset,
          });
          
          if (result?.items) {
            const artistTracks = transformVKAudiosToTracks(result.items);
            
            // Добавляем только уникальные треки
            for (const track of artistTracks) {
              if (!seenIds.has(track.id)) {
                seenIds.add(track.id);
                allTracks.push(track);
              }
            }
          }
          
          // Небольшая задержка между запросами
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (err) {
          console.error(`Error loading tracks for ${artist}:`, err);
        }
      }
      
      // Перемешиваем все треки
      const shuffledTracks = shuffleArray(allTracks);
      
      if (append) {
        setTracks(prev => {
          // Убираем дубликаты при добавлении
          const existingIds = new Set(prev.map(t => t.id));
          const newUniqueTracks = shuffledTracks.filter(t => !existingIds.has(t.id));
          return [...prev, ...newUniqueTracks];
        });
        setLoadedPages(p => p + 1);
      } else {
        setTracks(shuffledTracks);
        setLoadedPages(1);
      }
      
      setHasMore(allTracks.length >= artists.length * 10); // Есть ещё если загрузили достаточно
    } catch (err) {
      console.error('Error loading similar tracks:', err);
      setError('Не удалось загрузить похожие треки');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [vkTokens, artists, loadedPages]);
  
  // Загрузка при монтировании
  useEffect(() => {
    loadTracks(false);
  }, []);  // Только при первой загрузке
  
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadTracks(true);
    }
  };
  
  const handleRefresh = () => {
    setLoadedPages(0);
    loadTracks(false);
  };
  
  return (
    <MainLayout>
      <div className="space-y-8 animate-fade-in pt-4 md:pt-6">
        {/* Заголовок с градиентом */}
        <div className="relative rounded-3xl overflow-hidden">
          {/* Фон с градиентом и размытой обложкой */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500">
            {coverUrl && (
              <div 
                className="absolute inset-0 opacity-30 blur-2xl scale-110"
                style={{
                  backgroundImage: `url(${coverUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            )}
          </div>
          
          {/* Контент заголовка */}
          <div className="relative p-6 md:p-8 flex items-center gap-6">
            {/* Кнопка назад */}
            <Tooltip content="Назад">
              <Button
                variant="icon"
                onClick={() => router.back()}
                className="w-12 h-12 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm rounded-full flex-shrink-0"
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Tooltip>
            
            {/* Обложка */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-white/20 flex-shrink-0 shadow-xl">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={trackTitle}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Disc3 className="w-10 h-10 text-white/50" />
                </div>
              )}
            </div>
            
            {/* Информация */}
            <div className="flex-1 min-w-0">
              <p className="text-white/70 text-sm font-medium mb-1">
                Похожие треки на
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-white truncate">
                {trackTitle || 'Трек'}
              </h1>
              <p className="text-white/80 text-lg truncate mt-1">
                {trackArtist || 'Исполнитель'}
              </p>
            </div>
            
            {/* Кнопка обновить */}
            <Tooltip content="Обновить">
              <Button
                variant="icon"
                onClick={handleRefresh}
                disabled={loading}
                className="w-12 h-12 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm rounded-full flex-shrink-0"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </Tooltip>
          </div>
        </div>
        
        {/* Контент */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
            <p className="text-gray-500">Загрузка похожих треков...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Music2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="secondary">
              Попробовать снова
            </Button>
          </div>
        ) : tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Music2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Похожие треки не найдены
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Информация о количестве */}
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 px-1">
              <Music2 className="w-5 h-5" />
              <span>Найдено {tracks.length} треков</span>
            </div>
            
            {/* Список треков */}
            <TrackList tracks={tracks} />
            
            {/* Кнопка "Показать ещё" */}
            {hasMore && (
              <div className="flex justify-center py-6">
                <Button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  variant="secondary"
                  className="px-8 py-3 text-base"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Загрузка...
                    </>
                  ) : (
                    'Показать ещё'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
