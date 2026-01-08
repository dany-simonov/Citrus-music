/**
 * Типы для аутентификации
 * @module types/auth
 */

import { MusicSource } from './audio';

/**
 * Данные пользователя
 */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  email?: string;
  source: MusicSource;
}

/**
 * Токены аутентификации VK
 */
export interface VKAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  expiresAt: Date;
  userId: string;
  deviceId?: string;
}

/**
 * Токены аутентификации Yandex
 */
export interface YandexAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  expiresAt: Date;
  userId: string;
}

/**
 * Состояние аутентификации
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  vkTokens: VKAuthTokens | null;
  yandexTokens: YandexAuthTokens | null;
  error: string | null;
}

/**
 * Параметры PKCE для OAuth 2.1
 */
export interface PKCEParams {
  codeVerifier: string;
  codeChallenge: string;
  state: string;
}

/**
 * Ответ при обмене кода на токен VK
 */
export interface VKTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  user_id: number;
  state?: string;
  device_id?: string;
}

/**
 * Ответ при обмене кода на токен Yandex
 */
export interface YandexTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

/**
 * Параметры для VK OAuth авторизации
 */
export interface VKOAuthParams {
  client_id: string;
  redirect_uri: string;
  response_type: 'code';
  scope: string;
  state: string;
  code_challenge: string;
  code_challenge_method: 'S256';
}

/**
 * Параметры для Yandex OAuth авторизации
 */
export interface YandexOAuthParams {
  client_id: string;
  redirect_uri: string;
  response_type: 'code';
  scope?: string;
  state: string;
}
