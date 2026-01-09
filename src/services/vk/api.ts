/**
 * Сервис для работы с VK API
 * @module services/vk/api
 */

import { vkAuthService } from './auth';
import type {
  VKApiResponse,
  VKApiError,
  VKAudio,
  VKAudioGetResponse,
  VKPlaylist,
  VKPlaylistsResponse,
  VKAudioSearchResponse,
  VKUser,
  VKAudioGetParams,
  VKAudioSearchParams,
  VKPlaylistsParams,
} from '@/types/vk';

/**
 * Класс для работы с VK API
 */
export class VKApiService {
  private static instance: VKApiService;
  
  private constructor() {}
  
  /**
   * Получить singleton экземпляр
   */
  public static getInstance(): VKApiService {
    if (!VKApiService.instance) {
      VKApiService.instance = new VKApiService();
    }
    return VKApiService.instance;
  }
  
  /**
   * Выполняет запрос к VK API через серверный прокси (обход CORS)
   */
  private async request<T>(
    method: string,
    params: Record<string, string | number | undefined> = {}
  ): Promise<T> {
    // Проверяем и обновляем токены
    const tokens = await vkAuthService.ensureValidTokens();
    if (!tokens) {
      throw new Error('Not authenticated with VK');
    }
    
    // Используем серверный прокси для обхода CORS
    const response = await fetch('/api/vk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        method,
        params,
        accessToken: tokens.accessToken,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Proxy request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Проверяем на ошибку VK API
    if ('error' in data) {
      const error = data as VKApiError;
      throw new Error(`VK API Error: ${error.error.error_msg} (code: ${error.error.error_code})`);
    }
    
    return (data as VKApiResponse<T>).response;
  }
  
  /**
   * Получает информацию о текущем пользователе
   */
  public async getCurrentUser(): Promise<VKUser> {
    const users = await this.request<VKUser[]>('users.get', {
      fields: 'photo_50,photo_100,photo_200,photo_max,screen_name',
    });
    
    if (!users || users.length === 0) {
      throw new Error('Failed to get current user');
    }
    
    return users[0];
  }
  
  /**
   * Получает аудиозаписи пользователя
   */
  public async getAudio(params: VKAudioGetParams = {}): Promise<VKAudioGetResponse> {
    return this.request<VKAudioGetResponse>('audio.get', {
      owner_id: params.owner_id,
      album_id: params.album_id,
      audio_ids: params.audio_ids,
      offset: params.offset || 0,
      count: params.count || 50,
    });
  }
  
  /**
   * Получает плейлисты пользователя
   */
  public async getPlaylists(params: VKPlaylistsParams = {}): Promise<VKPlaylistsResponse> {
    return this.request<VKPlaylistsResponse>('audio.getPlaylists', {
      owner_id: params.owner_id,
      offset: params.offset || 0,
      count: params.count || 50,
    });
  }
  
  /**
   * Получает плейлист по ID
   */
  public async getPlaylistById(
    ownerId: number,
    playlistId: number,
    accessKey?: string
  ): Promise<VKPlaylist> {
    const result = await this.request<{ items: VKPlaylist[]; count: number }>('audio.getPlaylistById', {
      owner_id: ownerId,
      playlist_id: playlistId,
      access_key: accessKey,
    });
    
    return result.items[0];
  }
  
  /**
   * Получает аудиозаписи из плейлиста
   */
  public async getPlaylistAudios(
    ownerId: number,
    playlistId: number,
    offset: number = 0,
    count: number = 50,
    accessKey?: string
  ): Promise<VKAudioGetResponse> {
    return this.request<VKAudioGetResponse>('audio.get', {
      owner_id: ownerId,
      album_id: playlistId,
      access_key: accessKey,
      offset,
      count,
    });
  }
  
  /**
   * Поиск аудиозаписей
   */
  public async searchAudio(params: VKAudioSearchParams): Promise<VKAudioSearchResponse> {
    return this.request<VKAudioSearchResponse>('audio.search', {
      q: params.q,
      auto_complete: params.auto_complete || 1,
      lyrics: params.lyrics || 0,
      performer_only: params.performer_only || 0,
      sort: params.sort || 2,
      search_own: params.search_own || 0,
      offset: params.offset || 0,
      count: params.count || 50,
    });
  }
  
  /**
   * Получает рекомендации на основе трека
   */
  public async getRecommendations(
    targetAudio: string,
    offset: number = 0,
    count: number = 50
  ): Promise<VKAudioGetResponse> {
    return this.request<VKAudioGetResponse>('audio.getRecommendations', {
      target_audio: targetAudio,
      offset,
      count,
    });
  }
  
  /**
   * Добавляет аудиозапись в библиотеку пользователя
   */
  public async addAudio(audioId: number, ownerId: number): Promise<number> {
    return this.request<number>('audio.add', {
      audio_id: audioId,
      owner_id: ownerId,
    });
  }
  
  /**
   * Удаляет аудиозапись из библиотеки
   */
  public async deleteAudio(audioId: number, ownerId: number): Promise<number> {
    return this.request<number>('audio.delete', {
      audio_id: audioId,
      owner_id: ownerId,
    });
  }
  
  /**
   * Получает текст песни
   */
  public async getLyrics(lyricsId: number): Promise<{ lyrics_id: number; text: string }> {
    return this.request<{ lyrics_id: number; text: string }>('audio.getLyrics', {
      lyrics_id: lyricsId,
    });
  }
  
  /**
   * Создаёт новый плейлист
   */
  public async createPlaylist(
    title: string,
    description?: string
  ): Promise<VKPlaylist> {
    return this.request<VKPlaylist>('audio.createPlaylist', {
      title,
      description,
    });
  }
  
  /**
   * Редактирует плейлист
   */
  public async editPlaylist(
    playlistId: number,
    title: string,
    description?: string,
    ownerId?: number
  ): Promise<number> {
    return this.request<number>('audio.editPlaylist', {
      playlist_id: playlistId,
      owner_id: ownerId,
      title,
      description,
    });
  }
  
  /**
   * Удаляет плейлист
   */
  public async deletePlaylist(playlistId: number, ownerId?: number): Promise<number> {
    return this.request<number>('audio.deletePlaylist', {
      playlist_id: playlistId,
      owner_id: ownerId,
    });
  }
  
  /**
   * Добавляет аудиозаписи в плейлист
   */
  public async addToPlaylist(
    playlistId: number,
    audioIds: string[],
    ownerId?: number
  ): Promise<number[]> {
    return this.request<number[]>('audio.addToPlaylist', {
      playlist_id: playlistId,
      owner_id: ownerId,
      audio_ids: audioIds.join(','),
    });
  }
}

// Экспортируем singleton экземпляр
export const vkApiService = VKApiService.getInstance();
