/**
 * Базовые типы для аудио контента
 * @module types/audio
 */

/**
 * Информация о треке
 */
export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  album?: string;
  albumId?: string;
  duration: number; // в секундах
  coverUrl?: string;
  audioUrl?: string;
  source: MusicSource;
  quality?: AudioQuality;
  isExplicit?: boolean;
  isAvailable: boolean;
  addedAt?: Date;
  lyricsId?: number; // ID текста песни (для VK)
}

/**
 * Плейлист
 */
export interface Playlist {
  id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  ownerName: string;
  ownerId: string;
  trackCount: number;
  tracks?: Track[];
  source: MusicSource;
  isPublic: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Альбом
 */
export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  coverUrl?: string;
  year?: number;
  trackCount: number;
  tracks?: Track[];
  source: MusicSource;
  genre?: string;
}

/**
 * Артист
 */
export interface Artist {
  id: string;
  name: string;
  avatarUrl?: string;
  genres?: string[];
  albumCount?: number;
  trackCount?: number;
  source: MusicSource;
}

/**
 * Источник музыки
 */
export enum MusicSource {
  VK = 'vk',
  YANDEX = 'yandex',
  LOCAL = 'local',
}

/**
 * Качество аудио
 */
export enum AudioQuality {
  LOW = 'low',       // 128 kbps
  MEDIUM = 'medium', // 192 kbps
  HIGH = 'high',     // 320 kbps
  LOSSLESS = 'lossless',
}

/**
 * Состояние плеера
 */
export enum PlayerState {
  IDLE = 'idle',
  LOADING = 'loading',
  PLAYING = 'playing',
  PAUSED = 'paused',
  ERROR = 'error',
}

/**
 * Режим повтора
 */
export enum RepeatMode {
  OFF = 'off',
  ALL = 'all',
  ONE = 'one',
}

/**
 * Результат поиска
 */
export interface SearchResult {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
  query: string;
  source: MusicSource;
}

/**
 * Элемент очереди воспроизведения
 */
export interface QueueItem {
  track: Track;
  addedAt: Date;
  source: 'user' | 'autoplay' | 'playlist';
}

/**
 * История прослушивания
 */
export interface ListeningHistoryItem {
  track: Track;
  playedAt: Date;
  playDuration: number; // сколько секунд слушали
  completed: boolean;
}
