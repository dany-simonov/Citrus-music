/**
 * Хук для работы с VK API через React Query
 * @module hooks/use-vk-api
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vkApiService } from '@/services/vk';
import { useAuthStore } from '@/store/auth';
import type { VKAudioGetParams, VKAudioSearchParams, VKPlaylistsParams } from '@/types/vk';

/**
 * Ключи для React Query
 */
export const vkQueryKeys = {
  all: ['vk'] as const,
  user: () => [...vkQueryKeys.all, 'user'] as const,
  audio: () => [...vkQueryKeys.all, 'audio'] as const,
  audioList: (params?: VKAudioGetParams) => [...vkQueryKeys.audio(), 'list', params] as const,
  playlists: () => [...vkQueryKeys.all, 'playlists'] as const,
  playlistsList: (params?: VKPlaylistsParams) => [...vkQueryKeys.playlists(), 'list', params] as const,
  playlistAudios: (ownerId: number, playlistId: number) => 
    [...vkQueryKeys.playlists(), 'audios', ownerId, playlistId] as const,
  search: (query: string) => [...vkQueryKeys.all, 'search', query] as const,
  recommendations: (targetAudio: string) => [...vkQueryKeys.all, 'recommendations', targetAudio] as const,
};

/**
 * Хук для получения текущего пользователя VK
 */
export function useVKUser() {
  const { isAuthenticated, vkTokens } = useAuthStore();

  return useQuery({
    queryKey: vkQueryKeys.user(),
    queryFn: () => vkApiService.getCurrentUser(),
    enabled: isAuthenticated && !!vkTokens,
  });
}

/**
 * Хук для получения аудиозаписей
 */
export function useVKAudio(params?: VKAudioGetParams) {
  const { isAuthenticated, vkTokens } = useAuthStore();

  return useQuery({
    queryKey: vkQueryKeys.audioList(params),
    queryFn: () => vkApiService.getAudio(params),
    enabled: isAuthenticated && !!vkTokens,
  });
}

/**
 * Хук для получения плейлистов
 */
export function useVKPlaylists(params?: VKPlaylistsParams) {
  const { isAuthenticated, vkTokens } = useAuthStore();

  return useQuery({
    queryKey: vkQueryKeys.playlistsList(params),
    queryFn: () => vkApiService.getPlaylists(params || {}),
    enabled: isAuthenticated && !!vkTokens && params !== undefined,
  });
}

/**
 * Хук для получения аудиозаписей плейлиста
 */
export function useVKPlaylistAudios(
  ownerId: number,
  playlistId: number,
  accessKey?: string,
  enabled: boolean = true
) {
  const { isAuthenticated, vkTokens } = useAuthStore();

  return useQuery({
    queryKey: vkQueryKeys.playlistAudios(ownerId, playlistId),
    queryFn: () => vkApiService.getPlaylistAudios(ownerId, playlistId, 0, 200, accessKey),
    enabled: isAuthenticated && !!vkTokens && enabled,
  });
}

/**
 * Хук для поиска аудиозаписей
 */
export function useVKSearch(query: string, params?: Omit<VKAudioSearchParams, 'q'>) {
  const { isAuthenticated, vkTokens } = useAuthStore();

  return useQuery({
    queryKey: [...vkQueryKeys.search(query), params],
    queryFn: () => vkApiService.searchAudio({ ...params, q: query }),
    enabled: isAuthenticated && !!vkTokens && query.length >= 2,
    staleTime: 30 * 1000, // 30 секунд
  });
}

/**
 * Хук для получения рекомендаций
 */
export function useVKRecommendations(targetAudio: string) {
  const { isAuthenticated, vkTokens } = useAuthStore();

  return useQuery({
    queryKey: vkQueryKeys.recommendations(targetAudio),
    queryFn: () => vkApiService.getRecommendations(targetAudio),
    enabled: isAuthenticated && !!vkTokens && !!targetAudio,
  });
}

/**
 * Хук для добавления аудио в библиотеку
 */
export function useAddAudio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ audioId, ownerId }: { audioId: number; ownerId: number }) =>
      vkApiService.addAudio(audioId, ownerId),
    onSuccess: () => {
      // Инвалидируем кэш аудиозаписей
      queryClient.invalidateQueries({ queryKey: vkQueryKeys.audio() });
    },
  });
}

/**
 * Хук для удаления аудио из библиотеки
 */
export function useDeleteAudio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ audioId, ownerId }: { audioId: number; ownerId: number }) =>
      vkApiService.deleteAudio(audioId, ownerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vkQueryKeys.audio() });
    },
  });
}

/**
 * Хук для создания плейлиста
 */
export function useCreatePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ title, description }: { title: string; description?: string }) =>
      vkApiService.createPlaylist(title, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vkQueryKeys.playlists() });
    },
  });
}

/**
 * Хук для редактирования плейлиста
 */
export function useEditPlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      playlistId,
      title,
      description,
      ownerId,
    }: {
      playlistId: number;
      title: string;
      description?: string;
      ownerId?: number;
    }) => vkApiService.editPlaylist(playlistId, title, description, ownerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vkQueryKeys.playlists() });
    },
  });
}

/**
 * Хук для удаления плейлиста
 */
export function useDeletePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playlistId, ownerId }: { playlistId: number; ownerId?: number }) =>
      vkApiService.deletePlaylist(playlistId, ownerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vkQueryKeys.playlists() });
    },
  });
}
