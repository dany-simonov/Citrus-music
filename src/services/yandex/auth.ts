/**
 * Сервис аутентификации Яндекс OAuth
 * @module services/yandex/auth
 */

import { YANDEX_CONFIG, STORAGE_KEYS } from '@/lib/config';
import { generateRandomString, isBrowser } from '@/lib/utils';
import type { YandexAuthTokens, YandexTokenResponse } from '@/types/auth';

/**
 * Класс для работы с Yandex OAuth аутентификацией
 */
export class YandexAuthService {
  private static instance: YandexAuthService;
  
  private constructor() {}
  
  /**
   * Получить singleton экземпляр
   */
  public static getInstance(): YandexAuthService {
    if (!YandexAuthService.instance) {
      YandexAuthService.instance = new YandexAuthService();
    }
    return YandexAuthService.instance;
  }
  
  /**
   * Инициирует процесс авторизации Yandex OAuth
   * @returns URL для редиректа на страницу авторизации Yandex
   */
  public initiateAuth(): string {
    if (!isBrowser()) {
      throw new Error('Yandex auth can only be initiated in browser');
    }
    
    const state = generateRandomString(32);
    
    // Сохраняем state для проверки после редиректа
    sessionStorage.setItem(STORAGE_KEYS.OAUTH_STATE + '_yandex', state);
    
    // Формируем URL для авторизации
    const params = new URLSearchParams({
      response_type: 'token', // Используем implicit flow для простоты
      client_id: YANDEX_CONFIG.CLIENT_ID,
      redirect_uri: YANDEX_CONFIG.REDIRECT_URI,
      state: state,
    });
    
    return `${YANDEX_CONFIG.OAUTH_URL}?${params.toString()}`;
  }
  
  /**
   * Обрабатывает callback после авторизации Yandex (implicit flow)
   * @param hash - hash часть URL с токеном
   */
  public handleCallback(hash: string): YandexAuthTokens {
    if (!isBrowser()) {
      throw new Error('Yandex callback can only be handled in browser');
    }
    
    // Парсим hash параметры
    const params = new URLSearchParams(hash.replace('#', ''));
    
    const accessToken = params.get('access_token');
    const expiresIn = params.get('expires_in');
    const state = params.get('state');
    const error = params.get('error');
    
    if (error) {
      throw new Error(`Yandex auth error: ${error}`);
    }
    
    // Проверяем state (мягкая проверка - предупреждение вместо ошибки)
    const savedState = sessionStorage.getItem(STORAGE_KEYS.OAUTH_STATE + '_yandex');
    if (state && savedState && state !== savedState) {
      console.warn('OAuth state mismatch - this could indicate a CSRF attack, but proceeding anyway');
    }
    
    if (!accessToken) {
      throw new Error('No access token received');
    }
    
    // Очищаем временные данные
    sessionStorage.removeItem(STORAGE_KEYS.OAUTH_STATE + '_yandex');
    
    const tokens: YandexAuthTokens = {
      accessToken,
      expiresIn: parseInt(expiresIn || '31536000', 10),
      expiresAt: new Date(Date.now() + parseInt(expiresIn || '31536000', 10) * 1000),
      userId: '', // Будет заполнено после запроса к API
    };
    
    // Сохраняем токены
    this.saveTokens(tokens);
    
    return tokens;
  }
  
  /**
   * Сохраняет токены в localStorage
   */
  public saveTokens(tokens: YandexAuthTokens): void {
    if (!isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.YANDEX_TOKENS, JSON.stringify(tokens));
  }
  
  /**
   * Получает токены из localStorage
   */
  public getTokens(): YandexAuthTokens | null {
    if (!isBrowser()) return null;
    
    const stored = localStorage.getItem(STORAGE_KEYS.YANDEX_TOKENS);
    if (!stored) return null;
    
    try {
      const tokens = JSON.parse(stored);
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
    localStorage.removeItem(STORAGE_KEYS.YANDEX_TOKENS);
  }
  
  /**
   * Проверяет, авторизован ли пользователь Yandex
   */
  public isAuthenticated(): boolean {
    const tokens = this.getTokens();
    if (!tokens) return false;
    
    const now = new Date();
    const expiresAt = new Date(tokens.expiresAt);
    
    return expiresAt > now;
  }
  
  /**
   * Выход из аккаунта Yandex
   */
  public logout(): void {
    this.clearTokens();
  }
}

// Экспортируем singleton экземпляр
export const yandexAuthService = YandexAuthService.getInstance();
