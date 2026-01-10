/**
 * Сервис для работы с Yandex Music API
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

/**
 * Класс для работы с Yandex API
 * Использует Yandex ID API для получения информации о пользователе
 */
export class YandexApiService {
  private static instance: YandexApiService;
  private userInfoUrl: string;
  
  private constructor() {
    // Yandex ID API для информации о пользователе
    this.userInfoUrl = 'https://login.yandex.ru/info';
  }
  
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
   * Базовый метод запроса к Yandex Music API
   * @todo Реализовать когда будет доступ к API
   */
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Yandex Music API требует специальный доступ и авторизацию
    // Этот метод пока не реализован
    console.warn(`Yandex Music API request to ${endpoint} not implemented`);
    throw new Error('Yandex Music API not implemented');
  }
  
  /**
   * Получает информацию о текущем пользователе через Yandex ID API
   */
  public async getCurrentUser(): Promise<YandexUser> {
    const tokens = yandexAuthService.getTokens();
    if (!tokens) {
      throw new Error('Not authenticated with Yandex');
    }
    
    const response = await fetch(this.userInfoUrl, {
      headers: {
        'Authorization': `OAuth ${tokens.accessToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Yandex ID API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Преобразуем ответ Yandex ID в наш формат YandexUser
    return {
      uid: data.id,
      login: data.login,
      name: data.real_name || data.display_name || data.login,
      displayName: data.display_name,
      avatarUrl: data.default_avatar_id 
        ? `https://avatars.yandex.net/get-yapic/${data.default_avatar_id}/islands-200`
        : undefined,
    } as YandexUser;
  }
  
  /**
   * Получает плейлисты пользователя
   * @todo Реализовать когда будет доступ к Yandex Music API
   */
  public async getUserPlaylists(userId?: string): Promise<YandexPlaylist[]> {
    // Yandex Music API требует специальный доступ
    // Пока возвращаем пустой массив
    console.warn('Yandex Music playlists API not implemented');
    return [];
  }
  
  /**
   * Получает плейлист по ID
   * @todo Реализовать когда будет доступ к Yandex Music API
   */
  public async getPlaylist(userId: number, kind: number): Promise<YandexPlaylist> {
    throw new Error('Yandex Music playlists API not implemented');
  }
  
  /**
   * Получает треки плейлиста
   */
  public async getPlaylistTracks(userId: number, kind: number): Promise<YandexTrack[]> {
    const playlist = await this.getPlaylist(userId, kind);
    
    if (!playlist.tracks) return [];
    
    // Получаем полную информацию о треках
    const trackIds = playlist.tracks
      .filter(t => t.track)
      .map(t => t.track!.id);
    
    if (trackIds.length === 0) return [];
    
    return this.getTracks(trackIds.map(String));
  }
  
  /**
   * Получает информацию о треках по ID
   */
  public async getTracks(trackIds: string[]): Promise<YandexTrack[]> {
    return this.request<YandexTrack[]>('/tracks', {
      method: 'POST',
      body: JSON.stringify({
        'track-ids': trackIds,
      }),
    });
  }
  
  /**
   * Получает "Мне нравится" (лайкнутые треки)
   */
  public async getLikedTracks(): Promise<YandexTrack[]> {
    const user = await this.getCurrentUser();
    const data = await this.request<{ library: { tracks: { id: string }[] } }>(
      `/users/${user.uid}/likes/tracks`
    );
    
    if (!data.library?.tracks?.length) return [];
    
    const trackIds = data.library.tracks.map(t => t.id);
    return this.getTracks(trackIds);
  }
  
  /**
   * Поиск
   */
  public async search(
    query: string,
    type: 'all' | 'track' | 'artist' | 'album' | 'playlist' = 'all',
    page: number = 0
  ): Promise<YandexSearchResult> {
    return this.request<YandexSearchResult>(
      `/search?text=${encodeURIComponent(query)}&type=${type}&page=${page}`
    );
  }
  
  /**
   * Получает информацию об альбоме
   */
  public async getAlbum(albumId: number): Promise<YandexAlbum> {
    return this.request<YandexAlbum>(`/albums/${albumId}/with-tracks`);
  }
  
  /**
   * Получает информацию об артисте
   */
  public async getArtist(artistId: number): Promise<YandexArtist> {
    return this.request<YandexArtist>(`/artists/${artistId}`);
  }
  
  /**
   * Получает популярные треки артиста
   */
  public async getArtistTracks(artistId: number): Promise<YandexTrack[]> {
    const data = await this.request<{ tracks: YandexTrack[] }>(
      `/artists/${artistId}/tracks`
    );
    return data.tracks || [];
  }
  
  /**
   * Получает текст песни
   */
  public async getLyrics(trackId: string): Promise<YandexLyrics | null> {
    try {
      return await this.request<YandexLyrics>(`/tracks/${trackId}/lyrics`);
    } catch {
      return null;
    }
  }
  
  /**
   * Получает информацию для скачивания трека
   */
  public async getDownloadInfo(trackId: string): Promise<YandexDownloadInfo[]> {
    return this.request<YandexDownloadInfo[]>(`/tracks/${trackId}/download-info`);
  }
  
  /**
   * Получает прямую ссылку на аудио файл
   */
  public async getTrackUrl(trackId: string, quality: 'lq' | 'hq' = 'hq'): Promise<string> {
    const downloadInfo = await this.getDownloadInfo(trackId);
    
    // Выбираем лучшее качество
    const sortedInfo = downloadInfo.sort((a, b) => b.bitrateInKbps - a.bitrateInKbps);
    const info = quality === 'hq' ? sortedInfo[0] : sortedInfo[sortedInfo.length - 1];
    
    if (!info) {
      throw new Error('No download info available');
    }
    
    // Получаем прямую ссылку
    const response = await fetch(info.downloadInfoUrl);
    const data = await response.text();
    
    // Парсим XML ответ
    const parser = new DOMParser();
    const xml = parser.parseFromString(data, 'text/xml');
    
    const host = xml.querySelector('host')?.textContent;
    const path = xml.querySelector('path')?.textContent;
    const ts = xml.querySelector('ts')?.textContent;
    const s = xml.querySelector('s')?.textContent;
    
    if (!host || !path || !ts || !s) {
      throw new Error('Invalid download info response');
    }
    
    // Формируем ссылку
    const sign = await this.generateSign(path.slice(1) + s);
    return `https://${host}/get-mp3/${sign}/${ts}${path}`;
  }
  
  /**
   * Генерирует подпись для ссылки
   */
  private async generateSign(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode('XGRlBW9FXlekgbPrRHuSiA' + data);
    const hashBuffer = await crypto.subtle.digest('MD5', dataBuffer).catch(() => {
      // Fallback если MD5 недоступен
      return new ArrayBuffer(16);
    });
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * Лайкает трек
   */
  public async likeTrack(trackId: string): Promise<void> {
    const user = await this.getCurrentUser();
    await this.request(`/users/${user.uid}/likes/tracks/add`, {
      method: 'POST',
      body: JSON.stringify({ 'track-ids': [trackId] }),
    });
  }
  
  /**
   * Убирает лайк с трека
   */
  public async unlikeTrack(trackId: string): Promise<void> {
    const user = await this.getCurrentUser();
    await this.request(`/users/${user.uid}/likes/tracks/remove`, {
      method: 'POST',
      body: JSON.stringify({ 'track-ids': [trackId] }),
    });
  }
  
  /**
   * Получает рекомендации
   */
  public async getRecommendations(): Promise<YandexTrack[]> {
    const user = await this.getCurrentUser();
    const data = await this.request<{ tracks: YandexTrack[] }>(
      `/users/${user.uid}/recommendations`
    );
    return data.tracks || [];
  }
  
  /**
   * Получает чарт
   */
  public async getChart(): Promise<YandexPlaylist> {
    return this.request<YandexPlaylist>('/landing3/chart');
  }
  
  /**
   * Получает новые релизы
   */
  public async getNewReleases(): Promise<YandexAlbum[]> {
    const data = await this.request<{ newReleases: YandexAlbum[] }>('/landing3/new-releases');
    return data.newReleases || [];
  }
}

// Экспортируем singleton экземпляр
export const yandexApiService = YandexApiService.getInstance();
