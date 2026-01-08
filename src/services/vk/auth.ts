/**
 * Сервис аутентификации VK OAuth 2.1
 * @module services/vk/auth
 */

import { VK_CONFIG, STORAGE_KEYS } from '@/lib/config';
import { generatePKCE, generateRandomString, isBrowser } from '@/lib/utils';
import type { VKAuthTokens, VKTokenResponse, PKCEParams } from '@/types/auth';

/**
 * Класс для работы с VK OAuth 2.1 аутентификацией
 */
export class VKAuthService {
  private static instance: VKAuthService;
  
  private constructor() {}
  
  /**
   * Получить singleton экземпляр
   */
  public static getInstance(): VKAuthService {
    if (!VKAuthService.instance) {
      VKAuthService.instance = new VKAuthService();
    }
    return VKAuthService.instance;
  }
  
  /**
   * Инициирует процесс авторизации VK OAuth 2.1
   * @returns URL для редиректа на страницу авторизации VK
   */
  public async initiateAuth(): Promise<string> {
    if (!isBrowser()) {
      throw new Error('VK auth can only be initiated in browser');
    }
    
    // Генерируем PKCE параметры
    const { codeVerifier, codeChallenge } = await generatePKCE();
    const state = generateRandomString(32);
    
    // Сохраняем PKCE verifier и state для проверки после редиректа
    const pkceParams: PKCEParams = {
      codeVerifier,
      codeChallenge,
      state,
    };
    
    sessionStorage.setItem(STORAGE_KEYS.PKCE_VERIFIER, codeVerifier);
    sessionStorage.setItem(STORAGE_KEYS.OAUTH_STATE, state);
    
    // Формируем URL для авторизации
    const params = new URLSearchParams({
      client_id: VK_CONFIG.APP_ID,
      redirect_uri: VK_CONFIG.REDIRECT_URI,
      response_type: 'code',
      scope: VK_CONFIG.SCOPE,
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });
    
    return `${VK_CONFIG.OAUTH_URL}/authorize?${params.toString()}`;
  }
  
  /**
   * Обрабатывает callback после авторизации VK
   * @param code - Код авторизации
   * @param state - State параметр для проверки
   */
  public async handleCallback(code: string, state: string): Promise<VKAuthTokens> {
    if (!isBrowser()) {
      throw new Error('VK callback can only be handled in browser');
    }
    
    // Проверяем state
    const savedState = sessionStorage.getItem(STORAGE_KEYS.OAUTH_STATE);
    if (state !== savedState) {
      throw new Error('Invalid OAuth state. Possible CSRF attack.');
    }
    
    // Получаем PKCE verifier
    const codeVerifier = sessionStorage.getItem(STORAGE_KEYS.PKCE_VERIFIER);
    if (!codeVerifier) {
      throw new Error('PKCE verifier not found. Please restart authorization.');
    }
    
    // Обмениваем код на токены
    const tokens = await this.exchangeCodeForTokens(code, codeVerifier);
    
    // Очищаем временные данные
    sessionStorage.removeItem(STORAGE_KEYS.PKCE_VERIFIER);
    sessionStorage.removeItem(STORAGE_KEYS.OAUTH_STATE);
    
    // Сохраняем токены
    this.saveTokens(tokens);
    
    return tokens;
  }
  
  /**
   * Обмен кода авторизации на токены
   */
  private async exchangeCodeForTokens(code: string, codeVerifier: string): Promise<VKAuthTokens> {
    // Используем API route для обмена кода на токен (чтобы скрыть client_secret)
    const response = await fetch('/api/auth/vk/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        code_verifier: codeVerifier,
        redirect_uri: VK_CONFIG.REDIRECT_URI,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to exchange code for tokens');
    }
    
    const data: VKTokenResponse = await response.json();
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      userId: data.user_id.toString(),
      deviceId: data.device_id,
    };
  }
  
  /**
   * Обновление access token с помощью refresh token
   */
  public async refreshTokens(): Promise<VKAuthTokens> {
    const currentTokens = this.getTokens();
    if (!currentTokens?.refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await fetch('/api/auth/vk/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: currentTokens.refreshToken,
      }),
    });
    
    if (!response.ok) {
      // Если refresh token недействителен, очищаем токены
      this.clearTokens();
      throw new Error('Failed to refresh tokens. Please re-authenticate.');
    }
    
    const data: VKTokenResponse = await response.json();
    
    const tokens: VKAuthTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || currentTokens.refreshToken,
      expiresIn: data.expires_in,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      userId: data.user_id.toString(),
      deviceId: data.device_id || currentTokens.deviceId,
    };
    
    this.saveTokens(tokens);
    
    return tokens;
  }
  
  /**
   * Проверяет и при необходимости обновляет токены
   */
  public async ensureValidTokens(): Promise<VKAuthTokens | null> {
    const tokens = this.getTokens();
    if (!tokens) return null;
    
    // Проверяем, не истек ли токен (с запасом 5 минут)
    const now = new Date();
    const expiresAt = new Date(tokens.expiresAt);
    const threshold = 5 * 60 * 1000; // 5 минут
    
    if (expiresAt.getTime() - now.getTime() < threshold) {
      // Токен скоро истечёт, пробуем обновить
      if (tokens.refreshToken) {
        try {
          return await this.refreshTokens();
        } catch {
          return null;
        }
      }
      return null;
    }
    
    return tokens;
  }
  
  /**
   * Сохраняет токены в localStorage
   */
  public saveTokens(tokens: VKAuthTokens): void {
    if (!isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.VK_TOKENS, JSON.stringify(tokens));
  }
  
  /**
   * Получает токены из localStorage
   */
  public getTokens(): VKAuthTokens | null {
    if (!isBrowser()) return null;
    
    const stored = localStorage.getItem(STORAGE_KEYS.VK_TOKENS);
    if (!stored) return null;
    
    try {
      const tokens = JSON.parse(stored);
      // Преобразуем строку даты обратно в Date
      tokens.expiresAt = new Date(tokens.expiresAt);
      return tokens;
    } catch {
      return null;
    }
  }
  
  /**
   * Очищает токены
   */
  public clearTokens(): void {
    if (!isBrowser()) return;
    localStorage.removeItem(STORAGE_KEYS.VK_TOKENS);
  }
  
  /**
   * Проверяет, авторизован ли пользователь VK
   */
  public isAuthenticated(): boolean {
    const tokens = this.getTokens();
    if (!tokens) return false;
    
    const now = new Date();
    const expiresAt = new Date(tokens.expiresAt);
    
    return expiresAt > now;
  }
  
  /**
   * Выход из аккаунта VK
   */
  public logout(): void {
    this.clearTokens();
  }
}

// Экспортируем singleton экземпляр
export const vkAuthService = VKAuthService.getInstance();
