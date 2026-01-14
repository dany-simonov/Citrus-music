/**
 * Сервис для работы с Yandex Music API
 * Использует серверный прокси для обхода CORS
 * 
 * ⚠️ ВАЖНО: Это неофициальный API, который может измениться без предупреждения.
 * 
 * @module services/yandex/api
 */

import { yandexAuthService } from './auth';
import type {
  YandexTrack,
  YandexPlaylist,
  YandexAlbum,
  YandexArtist,
  YandexSearchResult,
  YandexUser,
  YandexLyrics,
  YandexDownloadInfo,
} from '@/types/yandex';

// Интерфейс для ответа API
interface YandexApiResponse<T> {
  result: T;
  error?: string;
}

// Кэш пользователя (чтобы не запрашивать при каждом вызове)
let cachedUser: YandexUser | null = null;
let cachedUserId: number | null = null;

/**
 * Класс для работы с Yandex Music API
 * Все запросы идут через /api/yandex прокси
 */
export class YandexApiService {
  private static instance: YandexApiService;
  private proxyUrl: string = '/api/yandex';
  
  private constructor() {}
  
  /**
   * Получить singleton экземпляр
   */
  public static getInstance(): YandexApiService {
    if (!YandexApiService.instance) {
      YandexApiService.instance = new YandexApiService();
    }
    return YandexApiService.instance;
  }

  /**
   * Получить токен доступа
   */
  private getAccessToken(): string {
    const tokens = yandexAuthService.getTokens();
    if (!tokens?.accessToken) {
      throw new Error('Не авторизован в Яндекс.Музыке. Введите токен в настройках аккаунта.');
    }
    return tokens.accessToken;
  }

  /**
   * Базовый метод запроса через прокси
   */
  private async request<T>(method: string, params?: Record<string, any>): Promise<T> {
    const accessToken = this.getAccessToken();
    
    const response = await fetch(this.proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        method,
        params,
        accessToken,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `Yandex API Error: ${response.status}`);
    }
    
    const data: YandexApiResponse<T> = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data.result;
  }
  
  /**
   * Получает информацию о текущем пользователе
   */
  public async getCurrentUser(): Promise<YandexUser> {
    // Используем кэш если есть
    if (cachedUser) {
      return cachedUser;
    }
    
    const data = await this.request<{ account: any }>('account/status');
    
    const account = data.account;
    if (!account) {
      throw new Error('Не удалось получить информацию об аккаунте');
    }
    
    // Сохраняем userId для других запросов
    cachedUserId = account.uid;
    
    // Формируем объект пользователя
    cachedUser = {
      uid: account.uid,
      login: account.login,
      name: account.displayName || account.login,
      displayName: account.displayName,
      avatarUrl: account.avatarUrl 
        ? `https://avatars.yandex.net/get-yapic/${account.avatarUrl}/islands-200`
        : undefined,
    } as YandexUser;
    
    return cachedUser;
  }

  /**
   * Получает userId (с кэшированием)
   */
  private async getUserId(): Promise<number> {
    if (cachedUserId) {
      return cachedUserId;
    }
    const user = await this.getCurrentUser();
    return user.uid;
  }

  /**
   * Сбрасывает кэш пользователя
   */
  public clearUserCache(): void {
    cachedUser = null;
    cachedUserId = null;
  }
  
  /**
   * Получает плейлисты пользователя
   */
  public async getUserPlaylists(userId?: string): Promise<YandexPlaylist[]> {
    const uid = userId ? parseInt(userId) : await this.getUserId();
    
    const data = await this.request<YandexPlaylist[]>('users/playlists/list', {
      userId: uid,
    });
    
    return data || [];
  }
  
  /**
   * Получает плейлист по ID
   */
  public async getPlaylist(userId: number, kind: number): Promise<YandexPlaylist> {
    const data = await this.request<YandexPlaylist>('users/playlists', {
      userId,
      kind,
    });
    
    return data;
  }
  
  /**
   * Получает треки плейлиста
   */
  public async getPlaylistTracks(userId: number, kind: number): Promise<YandexTrack[]> {
    const playlist = await this.getPlaylist(userId, kind);
    
    if (!playlist.tracks || playlist.tracks.length === 0) {
      return [];
    }
    
    // Получаем полную информацию о треках
    const trackIds = playlist.tracks
      .filter(t => t.track)
      .map(t => String(t.track!.id));
    
    if (trackIds.length === 0) return [];
    
    return this.getTracks(trackIds);
  }
  
  /**
   * Получает информацию о треках по ID
   */
  public async getTracks(trackIds: string[]): Promise<YandexTrack[]> {
    const data = await this.request<YandexTrack[]>('tracks', {
      trackIds,
    });
    
    return data || [];
  }
  
  /**
   * Получает "Мне нравится" (лайкнутые треки)
   */
  public async getLikedTracks(): Promise<YandexTrack[]> {
    const userId = await this.getUserId();
    
    const data = await this.request<{ library: { tracks: { id: string; albumId?: string }[] } }>(
      'users/likes/tracks',
      { userId }
    );
    
    if (!data.library?.tracks?.length) {
      return [];
    }
    
    // Получаем полную информацию о треках
    const trackIds = data.library.tracks.map(t => t.id);
    return this.getTracks(trackIds);
  }
  
  /**
   * Поиск
   */
  public async search(
    query: string,
    type: 'all' | 'track' | 'artist' | 'album' | 'playlist' = 'all',
    page: number = 0,
    pageSize: number = 20
  ): Promise<YandexSearchResult> {
    const data = await this.request<YandexSearchResult>('search', {
      text: query,
      type,
      page,
      pageSize,
    });
    
    return data;
  }
  
  /**
   * Получает информацию об альбоме
   * @todo Добавить в API route при необходимости
   */
  public async getAlbum(albumId: number): Promise<YandexAlbum> {
    throw new Error('Метод getAlbum пока не реализован');
  }
  
  /**
   * Получает информацию об артисте
   * @todo Добавить в API route при необходимости
   */
  public async getArtist(artistId: number): Promise<YandexArtist> {
    throw new Error('Метод getArtist пока не реализован');
  }
  
  /**
   * Получает популярные треки артиста
   * @todo Добавить в API route при необходимости
   */
  public async getArtistTracks(artistId: number): Promise<YandexTrack[]> {
    throw new Error('Метод getArtistTracks пока не реализован');
  }
  
  /**
   * Получает текст песни
   * @todo Добавить в API route при необходимости
   */
  public async getLyrics(trackId: string): Promise<YandexLyrics | null> {
    // Пока не реализовано
    return null;
  }
  
  /**
   * Получает информацию для скачивания трека
   */
  public async getDownloadInfo(trackId: string): Promise<YandexDownloadInfo[]> {
    const data = await this.request<YandexDownloadInfo[]>('tracks/download-info', {
      trackId,
    });
    
    return data || [];
  }
  
  /**
   * Получает прямую ссылку на аудио файл
   */
  public async getTrackUrl(trackId: string, quality: 'lq' | 'hq' = 'hq'): Promise<string> {
    // Сначала получаем download info
    const downloadInfo = await this.getDownloadInfo(trackId);
    
    if (!downloadInfo || downloadInfo.length === 0) {
      throw new Error('Нет информации для скачивания трека');
    }
    
    // Выбираем нужное качество
    const sortedInfo = downloadInfo.sort((a, b) => b.bitrateInKbps - a.bitrateInKbps);
    const info = quality === 'hq' ? sortedInfo[0] : sortedInfo[sortedInfo.length - 1];
    
    if (!info?.downloadInfoUrl) {
      throw new Error('Не найдена ссылка для скачивания');
    }
    
    // Получаем прямую ссылку через прокси
    const data = await this.request<{ directLink: string }>('tracks/direct-link', {
      downloadInfoUrl: info.downloadInfoUrl,
    });
    
    return data.directLink;
  }
  
  /**
   * Лайкает трек
   */
  public async likeTrack(trackId: string): Promise<void> {
    const userId = await this.getUserId();
    
    await this.request('users/likes/tracks/add', {
      userId,
      trackIds: [trackId],
    });
  }
  
  /**
   * Убирает лайк с трека
   */
  public async unlikeTrack(trackId: string): Promise<void> {
    const userId = await this.getUserId();
    
    await this.request('users/likes/tracks/remove', {
      userId,
      trackIds: [trackId],
    });
  }
  
  /**
   * Получает рекомендации
   * @todo Добавить в API route при необходимости
   */
  public async getRecommendations(): Promise<YandexTrack[]> {
    throw new Error('Метод getRecommendations пока не реализован');
  }
  
  /**
   * Получает чарт
   * @todo Добавить в API route при необходимости
   */
  public async getChart(): Promise<YandexPlaylist> {
    throw new Error('Метод getChart пока не реализован');
  }
  
  /**
   * Получает новые релизы
   * @todo Добавить в API route при необходимости
   */
  public async getNewReleases(): Promise<YandexAlbum[]> {
    throw new Error('Метод getNewReleases пока не реализован');
  }

  /**
   * Проверяет валидность токена
   */
  public async validateToken(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }
}

// Экспортируем singleton экземпляр
export const yandexApiService = YandexApiService.getInstance();
