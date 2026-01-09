/**
 * Утилиты для преобразования данных VK в формат приложения
 * @module lib/transformers
 */

import type { Track, Playlist, MusicSource } from '@/types/audio';
import type { VKAudio, VKPlaylist } from '@/types/vk';
import { getVKPlaylistCover } from './utils';

/**
 * Преобразует VK аудио в формат Track
 */
export function transformVKAudioToTrack(audio: VKAudio): Track {
  // Получаем обложку из альбома - проверяем разные поля
  let coverUrl: string | undefined;
  
  // VK возвращает обложку в album.thumb в разных форматах
  if (audio.album) {
    const album = audio.album as any;
    
    // Формат 1: album.thumb.url
    if (album.thumb?.url) {
      coverUrl = album.thumb.url;
    }
    // Формат 2: album.thumb.photo_XXX
    else if (album.thumb?.photo_600 || album.thumb?.photo_300) {
      coverUrl = album.thumb.photo_600 || album.thumb.photo_300 || album.thumb.photo_270 || album.thumb.photo_135;
    }
    // Формат 3: album.photo.photo_XXX
    else if (album.photo) {
      coverUrl = album.photo.photo_600 || album.photo.photo_300 || album.photo.photo_270 || album.photo.photo_135;
    }
    // Формат 4: album напрямую с photo_XXX (иногда VK так возвращает)
    else if (album.photo_600 || album.photo_300) {
      coverUrl = album.photo_600 || album.photo_300 || album.photo_270 || album.photo_135;
    }
  }

  return {
    id: `vk_${audio.owner_id}_${audio.id}`,
    title: audio.title,
    artist: audio.artist,
    duration: audio.duration,
    coverUrl,
    audioUrl: audio.url || undefined,
    source: 'vk' as MusicSource,
    isAvailable: !!audio.url && audio.content_restricted !== 1,
    isExplicit: audio.is_explicit === 1,
  };
}

/**
 * Преобразует массив VK аудио в массив Track
 */
export function transformVKAudiosToTracks(audios: VKAudio[]): Track[] {
  return audios.map(transformVKAudioToTrack);
}

/**
 * Преобразует VK плейлист в формат Playlist
 */
export function transformVKPlaylistToPlaylist(playlist: VKPlaylist): Playlist {
  const coverUrl = getVKPlaylistCover(playlist.photo, playlist.thumbs);

  return {
    id: `vk_${playlist.owner_id}_${playlist.id}`,
    title: playlist.title,
    description: playlist.description,
    coverUrl,
    ownerName: '', // Будет заполнено отдельно, если нужно
    ownerId: playlist.owner_id.toString(),
    trackCount: playlist.count,
    tracks: playlist.audios ? transformVKAudiosToTracks(playlist.audios) : undefined,
    source: 'vk' as MusicSource,
    isPublic: playlist.type === 1,
    createdAt: playlist.create_time ? new Date(playlist.create_time * 1000) : undefined,
    updatedAt: playlist.update_time ? new Date(playlist.update_time * 1000) : undefined,
  };
}

/**
 * Преобразует массив VK плейлистов
 */
export function transformVKPlaylistsToPlaylists(playlists: VKPlaylist[]): Playlist[] {
  return playlists.map(transformVKPlaylistToPlaylist);
}

/**
 * Извлекает owner_id и playlist_id из ID плейлиста в формате приложения
 */
export function parseVKPlaylistId(playlistId: string): { ownerId: number; id: number } | null {
  const match = playlistId.match(/^vk_(-?\d+)_(\d+)$/);
  if (!match) return null;
  
  return {
    ownerId: parseInt(match[1], 10),
    id: parseInt(match[2], 10),
  };
}

/**
 * Извлекает owner_id и audio_id из ID трека в формате приложения
 */
export function parseVKTrackId(trackId: string): { ownerId: number; id: number } | null {
  const match = trackId.match(/^vk_(-?\d+)_(\d+)$/);
  if (!match) return null;
  
  return {
    ownerId: parseInt(match[1], 10),
    id: parseInt(match[2], 10),
  };
}
