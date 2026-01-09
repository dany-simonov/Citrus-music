/**
 * Утилиты для получения обложек треков
 * @module lib/cover-utils
 */

/**
 * Получает обложку трека из VK Audio объекта
 */
export function getVKAudioCover(audio: any): string | undefined {
  if (!audio) return undefined;
  
  // Проверяем все возможные места где VK может вернуть обложку
  
  // 1. album.thumb.url (основной формат)
  if (audio.album?.thumb?.url) {
    return audio.album.thumb.url;
  }
  
  // 2. album.thumb.photo_XXX (альтернативный формат)
  if (audio.album?.thumb) {
    const thumb = audio.album.thumb;
    const url = thumb.photo_1200 || thumb.photo_600 || thumb.photo_300 || thumb.photo_270 || thumb.photo_135;
    if (url) return url;
  }
  
  // 3. album.photo (ещё один формат)
  if (audio.album?.photo) {
    const photo = audio.album.photo;
    if (typeof photo === 'string') return photo;
    const url = photo.photo_1200 || photo.photo_600 || photo.photo_300 || photo.photo_270 || photo.photo_135;
    if (url) return url;
  }
  
  // 4. Прямо в album (иногда VK так возвращает)
  if (audio.album) {
    const album = audio.album;
    const url = album.photo_1200 || album.photo_600 || album.photo_300 || album.photo_270 || album.photo_135;
    if (url) return url;
  }
  
  return undefined;
}

/**
 * Ищет обложку через iTunes API (бесплатно, без API ключа)
 */
export async function searchITunesCover(artist: string, title: string): Promise<string | undefined> {
  try {
    const query = encodeURIComponent(`${artist} ${title}`);
    const response = await fetch(
      `https://itunes.apple.com/search?term=${query}&media=music&limit=1`
    );
    
    if (!response.ok) return undefined;
    
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      // iTunes возвращает 100x100, заменяем на 600x600
      const artworkUrl = data.results[0].artworkUrl100;
      if (artworkUrl) {
        return artworkUrl.replace('100x100bb', '600x600bb');
      }
    }
  } catch (error) {
    console.error('iTunes cover search failed:', error);
  }
  
  return undefined;
}

/**
 * Ищет обложку через Deezer API (бесплатно, без API ключа)
 */
export async function searchDeezerCover(artist: string, title: string): Promise<string | undefined> {
  try {
    const query = encodeURIComponent(`${artist} ${title}`);
    const response = await fetch(
      `https://api.deezer.com/search?q=${query}&limit=1`
    );
    
    if (!response.ok) return undefined;
    
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      // Deezer возвращает album.cover_xl (1000x1000)
      const track = data.data[0];
      if (track.album?.cover_xl) {
        return track.album.cover_xl;
      }
      if (track.album?.cover_big) {
        return track.album.cover_big;
      }
    }
  } catch (error) {
    console.error('Deezer cover search failed:', error);
  }
  
  return undefined;
}

/**
 * Получает обложку с приоритетом: VK -> Deezer -> iTunes
 */
export async function getCoverWithFallback(
  audio: any,
  artist?: string,
  title?: string
): Promise<string | undefined> {
  // Сначала пробуем VK
  const vkCover = getVKAudioCover(audio);
  if (vkCover) return vkCover;
  
  // Если есть artist и title, ищем в других источниках
  if (artist && title) {
    // Пробуем Deezer (обычно работает лучше для русской музыки)
    const deezerCover = await searchDeezerCover(artist, title);
    if (deezerCover) return deezerCover;
    
    // Пробуем iTunes
    const itunesCover = await searchITunesCover(artist, title);
    if (itunesCover) return itunesCover;
  }
  
  return undefined;
}
