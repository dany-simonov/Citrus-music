/**
 * Типы для VK API
 * @module types/vk
 */

/**
 * Аудио объект VK API
 * @see https://dev.vk.com/reference/objects/audio
 */
export interface VKAudio {
  id: number;
  owner_id: number;
  artist: string;
  title: string;
  duration: number;
  url: string;
  lyrics_id?: number;
  album_id?: number;
  genre_id?: number;
  date?: number;
  no_search?: number;
  is_hq?: number;
  is_explicit?: number;
  content_restricted?: number;
  track_code?: string;
  access_key?: string;
  album?: VKAudioAlbum;
  main_artists?: VKArtist[];
}

/**
 * Альбом аудио VK
 */
export interface VKAudioAlbum {
  id: number;
  title: string;
  owner_id: number;
  access_key?: string;
  thumb?: VKPhotoSize;
}

/**
 * Размер фото VK
 */
export interface VKPhotoSize {
  height: number;
  url: string;
  width: number;
  type: string;
}

/**
 * Артист VK
 */
export interface VKArtist {
  name: string;
  domain?: string;
  id?: string;
}

/**
 * Плейлист VK
 */
export interface VKPlaylist {
  id: number;
  owner_id: number;
  type: number;
  title: string;
  description?: string;
  count: number;
  followers?: number;
  plays?: number;
  create_time?: number;
  update_time?: number;
  is_following?: boolean;
  photo?: VKPlaylistPhoto;
  access_key?: string;
  audios?: VKAudio[];
  main_artists?: VKArtist[];
  album_type?: string;
}

/**
 * Фото плейлиста VK
 */
export interface VKPlaylistPhoto {
  width: number;
  height: number;
  photo_34?: string;
  photo_68?: string;
  photo_135?: string;
  photo_270?: string;
  photo_300?: string;
  photo_600?: string;
  photo_1200?: string;
}

/**
 * Пользователь VK
 */
export interface VKUser {
  id: number;
  first_name: string;
  last_name: string;
  photo_50?: string;
  photo_100?: string;
  photo_200?: string;
  photo_max?: string;
  screen_name?: string;
}

/**
 * Базовый ответ VK API
 */
export interface VKApiResponse<T> {
  response: T;
}

/**
 * Ошибка VK API
 */
export interface VKApiError {
  error: {
    error_code: number;
    error_msg: string;
    request_params: Array<{ key: string; value: string }>;
  };
}

/**
 * Ответ audio.get
 */
export interface VKAudioGetResponse {
  count: number;
  items: VKAudio[];
}

/**
 * Ответ audio.getPlaylists
 */
export interface VKPlaylistsResponse {
  count: number;
  items: VKPlaylist[];
}

/**
 * Ответ audio.search
 */
export interface VKAudioSearchResponse {
  count: number;
  items: VKAudio[];
}

/**
 * Ответ audio.getRecommendations
 */
export interface VKRecommendationsResponse {
  count: number;
  items: VKAudio[];
}

/**
 * Параметры для audio.get
 */
export interface VKAudioGetParams {
  owner_id?: number;
  album_id?: number;
  audio_ids?: string;
  offset?: number;
  count?: number;
}

/**
 * Параметры для audio.search
 */
export interface VKAudioSearchParams {
  q: string;
  auto_complete?: number;
  lyrics?: number;
  performer_only?: number;
  sort?: number;
  search_own?: number;
  offset?: number;
  count?: number;
}

/**
 * Параметры для audio.getPlaylists
 */
export interface VKPlaylistsParams {
  owner_id?: number;
  offset?: number;
  count?: number;
}
