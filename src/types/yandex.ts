/**
 * Типы для Yandex Music API
 * @module types/yandex
 */

/**
 * Трек Yandex Music
 */
export interface YandexTrack {
  id: string | number;
  title: string;
  available: boolean;
  availableForPremiumUsers?: boolean;
  availableFullWithoutPermission?: boolean;
  durationMs: number;
  storageDir?: string;
  fileSize?: number;
  normalization?: {
    gain: number;
    peak: number;
  };
  r128?: {
    i: number;
    tp: number;
  };
  previewDurationMs?: number;
  artists: YandexArtist[];
  albums: YandexAlbum[];
  coverUri?: string;
  ogImage?: string;
  lyricsAvailable?: boolean;
  type?: string;
  rememberPosition?: boolean;
  trackSharingFlag?: string;
  backgroundVideoUri?: string;
  contentWarning?: string;
  explicit?: boolean;
}

/**
 * Артист Yandex Music
 */
export interface YandexArtist {
  id: number;
  name: string;
  various?: boolean;
  composer?: boolean;
  cover?: YandexCover;
  genres?: string[];
  counts?: {
    tracks: number;
    directAlbums: number;
    alsoAlbums: number;
    alsoTracks: number;
  };
  available?: boolean;
  ratings?: {
    week: number;
    month: number;
    day: number;
  };
  links?: YandexLink[];
  ticketsAvailable?: boolean;
}

/**
 * Альбом Yandex Music
 */
export interface YandexAlbum {
  id: number;
  title: string;
  type?: string;
  metaType?: string;
  year?: number;
  releaseDate?: string;
  coverUri?: string;
  ogImage?: string;
  genre?: string;
  trackCount?: number;
  recent?: boolean;
  veryImportant?: boolean;
  artists?: YandexArtist[];
  labels?: YandexLabel[];
  available?: boolean;
  availableForPremiumUsers?: boolean;
  availableForOptions?: string[];
  availableForMobile?: boolean;
  availablePartially?: boolean;
  bests?: number[];
  volumes?: YandexTrack[][];
  trackPosition?: {
    volume: number;
    index: number;
  };
}

/**
 * Плейлист Yandex Music
 */
export interface YandexPlaylist {
  uid: number;
  kind: number;
  title: string;
  description?: string;
  descriptionFormatted?: string;
  trackCount: number;
  visibility: 'public' | 'private';
  likesCount?: number;
  created?: string;
  modified?: string;
  available?: boolean;
  isBanner?: boolean;
  isPremiere?: boolean;
  durationMs?: number;
  cover?: YandexCover;
  ogImage?: string;
  owner?: {
    uid: number;
    login: string;
    name: string;
    verified?: boolean;
  };
  tracks?: YandexPlaylistTrack[];
  tags?: YandexTag[];
  revision?: number;
  snapshot?: number;
  backgroundImageUrl?: string;
  backgroundVideoUrl?: string;
}

/**
 * Трек в плейлисте Yandex
 */
export interface YandexPlaylistTrack {
  id: number;
  track?: YandexTrack;
  timestamp: string;
  recent?: boolean;
}

/**
 * Обложка Yandex
 */
export interface YandexCover {
  type?: string;
  dir?: string;
  version?: string;
  uri?: string;
  custom?: boolean;
  itemsUri?: string[];
}

/**
 * Ссылка артиста
 */
export interface YandexLink {
  title: string;
  href: string;
  type: string;
  socialNetwork?: string;
}

/**
 * Лейбл
 */
export interface YandexLabel {
  id: number;
  name: string;
}

/**
 * Тег
 */
export interface YandexTag {
  id: string;
  value: string;
}

/**
 * Информация о скачивании
 */
export interface YandexDownloadInfo {
  codec: string;
  gain: boolean;
  preview: boolean;
  downloadInfoUrl: string;
  direct: boolean;
  bitrateInKbps: number;
}

/**
 * Прямая ссылка для скачивания
 */
export interface YandexDirectLink {
  s: string;
  ts: string;
  path: string;
  host: string;
}

/**
 * Пользователь Yandex
 */
export interface YandexUser {
  uid: number;
  login: string;
  name: string;
  displayName?: string;
  fullName?: string;
  sex?: string;
  verified?: boolean;
  regions?: number[];
}

/**
 * Результат поиска Yandex
 */
export interface YandexSearchResult {
  type: string;
  page: number;
  perPage: number;
  text: string;
  searchRequestId: string;
  tracks?: {
    total: number;
    perPage: number;
    results: YandexTrack[];
  };
  artists?: {
    total: number;
    perPage: number;
    results: YandexArtist[];
  };
  albums?: {
    total: number;
    perPage: number;
    results: YandexAlbum[];
  };
  playlists?: {
    total: number;
    perPage: number;
    results: YandexPlaylist[];
  };
}

/**
 * Текст песни Yandex
 */
export interface YandexLyrics {
  id: number;
  lyrics: string;
  fullLyrics?: string;
  hasRights: boolean;
  showTranslation: boolean;
  textLanguage?: string;
}
