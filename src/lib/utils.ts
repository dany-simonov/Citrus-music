/**
 * Утилиты для работы с классами CSS
 * @module lib/utils
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Объединяет классы с помощью clsx и tailwind-merge
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Форматирует длительность в секундах в строку MM:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Форматирует длительность в миллисекундах в строку MM:SS
 */
export function formatDurationMs(ms: number): string {
  return formatDuration(Math.floor(ms / 1000));
}

/**
 * Форматирует число в читаемый формат (1000 -> 1K)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Генерирует случайную строку заданной длины
 */
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);
  
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(randomValues);
  } else {
    for (let i = 0; i < length; i++) {
      randomValues[i] = Math.floor(Math.random() * 256);
    }
  }
  
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  
  return result;
}

/**
 * Кодирует строку в Base64 URL-safe формат
 */
export function base64URLEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Вычисляет SHA-256 хеш строки
 */
export async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await crypto.subtle.digest('SHA-256', data);
}

/**
 * Генерирует PKCE параметры для OAuth 2.1
 */
export async function generatePKCE(): Promise<{
  codeVerifier: string;
  codeChallenge: string;
}> {
  const codeVerifier = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64URLEncode(hashed);
  
  return { codeVerifier, codeChallenge };
}

/**
 * Задержка выполнения
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Обрезает текст до указанной длины
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Проверяет, находимся ли мы в браузере
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Получает URL обложки Yandex с нужным размером
 */
export function getYandexCoverUrl(uri: string | undefined, size: number = 400): string {
  if (!uri) return '/images/default-cover.png';
  const cleanUri = uri.replace('%%', `${size}x${size}`);
  return `https://${cleanUri}`;
}

/**
 * Получает лучшую обложку плейлиста VK
 */
export function getVKPlaylistCover(photo: {
  photo_1200?: string;
  photo_600?: string;
  photo_300?: string;
  photo_270?: string;
  photo_135?: string;
} | undefined, thumbs?: Array<{
  photo_1200?: string;
  photo_600?: string;
  photo_300?: string;
  photo_270?: string;
  photo_135?: string;
}>): string {
  // Сначала пробуем photo
  if (photo) {
    const url = photo.photo_600 || photo.photo_300 || photo.photo_270 || photo.photo_135 || photo.photo_1200;
    if (url) return url;
  }
  
  // Потом пробуем thumbs
  if (thumbs && thumbs.length > 0) {
    const thumb = thumbs[0];
    const url = thumb.photo_600 || thumb.photo_300 || thumb.photo_270 || thumb.photo_135 || thumb.photo_1200;
    if (url) return url;
  }
  
  return '/images/default-cover.png';
}

/**
 * Debounce функция
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle функция
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
