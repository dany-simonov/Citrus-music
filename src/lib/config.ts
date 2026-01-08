/**
 * Конфигурация приложения
 * @module lib/config
 */

/**
 * Конфигурация VK OAuth
 */
export const VK_CONFIG = {
  APP_ID: process.env.NEXT_PUBLIC_VK_APP_ID || '',
  REDIRECT_URI: process.env.NEXT_PUBLIC_VK_REDIRECT_URI || 'http://localhost:3000/auth/vk/callback',
  OAUTH_URL: process.env.NEXT_PUBLIC_VK_OAUTH_URL || 'https://id.vk.com/oauth2',
  API_URL: 'https://api.vk.com/method',
  API_VERSION: '5.199',
  SCOPE: 'audio,offline',
} as const;

/**
 * Конфигурация Yandex OAuth
 */
export const YANDEX_CONFIG = {
  CLIENT_ID: process.env.NEXT_PUBLIC_YANDEX_CLIENT_ID || '',
  REDIRECT_URI: process.env.NEXT_PUBLIC_YANDEX_REDIRECT_URI || 'http://localhost:3000/auth/yandex/callback',
  OAUTH_URL: 'https://oauth.yandex.ru/authorize',
  TOKEN_URL: 'https://oauth.yandex.ru/token',
  API_URL: process.env.NEXT_PUBLIC_YANDEX_API_BASE || 'https://api.music.yandex.net:443',
} as const;

/**
 * Общая конфигурация приложения
 */
export const APP_CONFIG = {
  NAME: 'Citrus',
  VERSION: process.env.NEXT_PUBLIC_CITRUS_VERSION || '1.0.0',
  URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  CACHE_ENABLED: process.env.NEXT_PUBLIC_CACHE_ENABLED === 'true',
} as const;

/**
 * Ключи для localStorage
 */
export const STORAGE_KEYS = {
  VK_TOKENS: 'citrus_vk_tokens',
  YANDEX_TOKENS: 'citrus_yandex_tokens',
  USER: 'citrus_user',
  THEME: 'citrus_theme',
  PKCE_VERIFIER: 'citrus_pkce_verifier',
  OAUTH_STATE: 'citrus_oauth_state',
  PLAYER_VOLUME: 'citrus_player_volume',
  QUEUE: 'citrus_queue',
  HISTORY: 'citrus_history',
} as const;

/**
 * Названия тем
 */
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

/**
 * Константы API
 */
export const API_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 200,
  SEARCH_DEBOUNCE_MS: 300,
  TOKEN_REFRESH_THRESHOLD_MS: 5 * 60 * 1000, // 5 минут до истечения
} as const;

/**
 * Типы тем
 */
export type ThemeType = typeof THEMES[keyof typeof THEMES];
