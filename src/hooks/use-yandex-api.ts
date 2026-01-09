/**
 * Хук для работы с Yandex Music API через React Query
 * @module hooks/use-yandex-api
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { yandexApiService } from '@/services/yandex';
import { useAuthStore } from '@/store/auth';

/**
 * Ключи для React Query
 */
export const yandexQueryKeys = {
  all: ['yandex'] as const,
  user: () => [...yandexQueryKeys.all, 'user'] as const,
  playlists: () => [...yandexQueryKeys.all, 'playlists'] as const,
  playlistsList: () => [...yandexQueryKeys.playlists(), 'list'] as const,
  playlist: (userId: number, kind: number) => 
    [...yandexQueryKeys.playlists(), userId, kind] as const,
  playlistTracks: (userId: number, kind: number) => 
    [...yandexQueryKeys.playlists(), 'tracks', userId, kind] as const,
  likedTracks: () => [...yandexQueryKeys.all, 'liked'] as const,
  search: (query: string) => [...yandexQueryKeys.all, 'search', query] as const,
  album: (albumId: number) => [...yandexQueryKeys.all, 'album', albumId] as const,
  artist: (artistId: number) => [...yandexQueryKeys.all, 'artist', artistId] as const,
  artistTracks: (artistId: number) => [...yandexQueryKeys.all, 'artistTracks', artistId] as const,
  recommendations: () => [...yandexQueryKeys.all, 'recommendations'] as const,
  chart: () => [...yandexQueryKeys.all, 'chart'] as const,
  newReleases: () => [...yandexQueryKeys.all, 'newReleases'] as const,
};

/**
 * Хук для получения текущего пользователя Yandex
 */
export function useYandexUser() {
  const { yandexTokens } = useAuthStore();

  return useQuery({
    queryKey: yandexQueryKeys.user(),
    queryFn: () => yandexApiService.getCurrentUser(),
    enabled: !!yandexTokens,
  });
}

/**
 * Хук для получения плейлистов пользователя Yandex
 */
export function useYandexPlaylists() {
  const { yandexTokens } = useAuthStore();

  return useQuery({
    queryKey: yandexQueryKeys.playlistsList(),
    queryFn: () => yandexApiService.getUserPlaylists(),
    enabled: !!yandexTokens,
  });
}

/**
 * Хук для получения треков плейлиста
 */
export function useYandexPlaylistTracks(userId: number, kind: number, enabled: boolean = true) {
  const { yandexTokens } = useAuthStore();

  return useQuery({
    queryKey: yandexQueryKeys.playlistTracks(userId, kind),
    queryFn: () => yandexApiService.getPlaylistTracks(userId, kind),
    enabled: !!yandexTokens && enabled,
  });
}

/**
 * Хук для получения лайкнутых треков
 */
export function useYandexLikedTracks() {
  const { yandexTokens } = useAuthStore();

  return useQuery({
    queryKey: yandexQueryKeys.likedTracks(),
    queryFn: () => yandexApiService.getLikedTracks(),
    enabled: !!yandexTokens,
  });
}

/**
 * Хук для поиска в Yandex Music
 */
export function useYandexSearch(query: string) {
  const { yandexTokens } = useAuthStore();

  return useQuery({
    queryKey: yandexQueryKeys.search(query),
    queryFn: () => yandexApiService.search(query),
    enabled: !!yandexTokens && query.length >= 2,
    staleTime: 30 * 1000,
  });
}

/**
 * Хук для получения альбома
 */
export function useYandexAlbum(albumId: number) {
  const { yandexTokens } = useAuthStore();

  return useQuery({
    queryKey: yandexQueryKeys.album(albumId),
    queryFn: () => yandexApiService.getAlbum(albumId),
    enabled: !!yandexTokens && !!albumId,
  });
}

/**
 * Хук для получения информации об артисте
 */
export function useYandexArtist(artistId: number) {
  const { yandexTokens } = useAuthStore();

  return useQuery({
    queryKey: yandexQueryKeys.artist(artistId),
    queryFn: () => yandexApiService.getArtist(artistId),
    enabled: !!yandexTokens && !!artistId,
  });
}

/**
 * Хук для получения треков артиста
 */
export function useYandexArtistTracks(artistId: number) {
  const { yandexTokens } = useAuthStore();

  return useQuery({
    queryKey: yandexQueryKeys.artistTracks(artistId),
    queryFn: () => yandexApiService.getArtistTracks(artistId),
    enabled: !!yandexTokens && !!artistId,
  });
}

/**
 * Хук для получения рекомендаций
 */
export function useYandexRecommendations() {
  const { yandexTokens } = useAuthStore();

  return useQuery({
    queryKey: yandexQueryKeys.recommendations(),
    queryFn: () => yandexApiService.getRecommendations(),
    enabled: !!yandexTokens,
  });
}

/**
 * Хук для получения чарта
 */
export function useYandexChart() {
  const { yandexTokens } = useAuthStore();

  return useQuery({
    queryKey: yandexQueryKeys.chart(),
    queryFn: () => yandexApiService.getChart(),
    enabled: !!yandexTokens,
  });
}

/**
 * Хук для лайка трека
 */
export function useLikeYandexTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trackId: string) => yandexApiService.likeTrack(trackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: yandexQueryKeys.likedTracks() });
    },
  });
}

/**
 * Хук для удаления лайка
 */
export function useUnlikeYandexTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trackId: string) => yandexApiService.unlikeTrack(trackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: yandexQueryKeys.likedTracks() });
    },
  });
}
