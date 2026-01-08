/**
 * Страница поиска
 * @module app/search/page
 */

'use client';

import { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout';
import { useAuthStore } from '@/store/auth';
import { useVKSearch } from '@/hooks/use-vk-api';
import { TrackList } from '@/components/track';
import { transformVKAudiosToTracks } from '@/lib/transformers';
import { debounce } from '@/lib/utils';
import { Search as SearchIcon, Loader2, Music } from 'lucide-react';

export default function SearchPage() {
  const { isAuthenticated } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const { data: searchResults, isLoading, isFetching } = useVKSearch(debouncedQuery);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setDebouncedQuery(query);
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const tracks = searchResults ? transformVKAudiosToTracks(searchResults.items) : [];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Search Input */}
        <div className="relative max-w-2xl">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Поиск треков, артистов..."
            className="input w-full pl-12 pr-4 py-4 text-lg"
            autoFocus
          />
          {isFetching && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-citrus-accent animate-spin" />
          )}
        </div>

        {/* Results */}
        {!isAuthenticated ? (
          <div className="text-center py-12">
            <Music className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">
              Войдите, чтобы искать музыку
            </p>
            <a
              href="/login"
              className="inline-block px-6 py-2 bg-citrus-accent text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Войти
            </a>
          </div>
        ) : !debouncedQuery ? (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-xl font-medium mb-2">Найдите свою музыку</p>
            <p className="text-gray-500">
              Введите название трека или имя исполнителя
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-citrus-accent" />
          </div>
        ) : tracks.length > 0 ? (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Найдено {searchResults?.count || 0} результатов для "{debouncedQuery}"
            </p>
            <TrackList tracks={tracks} showIndex={false} />
          </div>
        ) : (
          <div className="text-center py-12">
            <Music className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-xl font-medium mb-2">Ничего не найдено</p>
            <p className="text-gray-500">
              Попробуйте изменить поисковый запрос
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
