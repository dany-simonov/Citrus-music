/**
 * Сервис аутентификации VK OAuth (Kate Mobile style - implicit flow)
 * @module services/vk/auth
 */

import { VK_CONFIG, STORAGE_KEYS } from '@/lib/config';
import { generateRandomString, isBrowser } from '@/lib/utils';
import type { VKAuthTokens } from '@/types/auth';

/**
 * Класс для работы с VK OAuth аутентификацией (implicit flow)
 * Использует Kate Mobile client_id для доступа к audio API
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
   * Инициирует процесс авторизации VK OAuth (implicit flow)
   * @returns URL для открытия в новом окне
   */
  public initiateAuth(): string {
    if (!isBrowser()) {
      throw new Error('VK auth can only be initiated in browser');
    }
    
    // Формируем URL для авторизации через старый VK OAuth (не VK ID)
    // Используем Kate Mobile client_id (2685278) для доступа к audio API
    const params = new URLSearchParams({
      client_id: VK_CONFIG.APP_ID,
      redirect_uri: VK_CONFIG.REDIRECT_URI,
      response_type: 'token', // implicit flow - токен сразу в URL
      scope: VK_CONFIG.SCOPE,
      display: 'page',
      v: '5.199',
    });
    
    return `${VK_CONFIG.OAUTH_URL}/authorize?${params.toString()}`;
  }
  
  /**
   * Обрабатывает callback после авторизации VK (implicit flow)
   * Токен приходит в hash части URL
   * @param hash - hash часть URL с токеном
   */
  public handleCallback(hash: string): VKAuthTokens {
    if (!isBrowser()) {
      throw new Error('VK callback can only be handled in browser');
    }
    
    // Парсим hash параметры
    const params = new URLSearchParams(hash.replace('#', ''));
    
    const accessToken = params.get('access_token');
    const expiresIn = params.get('expires_in');
    const userId = params.get('user_id');
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    
    if (error) {
      throw new Error(`VK auth error: ${errorDescription || error}`);
    }
    
    if (!accessToken) {
      throw new Error('No access token received from VK');
    }
    
    // Kate Mobile токены не истекают (expires_in = 0)
    const tokens: VKAuthTokens = {
      accessToken,
      expiresIn: parseInt(expiresIn || '0', 10),
      expiresAt: expiresIn === '0' 
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 год для "вечных" токенов
        : new Date(Date.now() + parseInt(expiresIn || '86400', 10) * 1000),
      userId: userId || '',
    };
    
    // Сохраняем токены
    this.saveTokens(tokens);
    
    return tokens;
  }
  
  /**
   * Проверяет и возвращает валидные токены
   */
  public async ensureValidTokens(): Promise<VKAuthTokens | null> {
    const tokens = this.getTokens();
    if (!tokens) return null;
    
    // Kate Mobile токены обычно не истекают
    const now = new Date();
    const expiresAt = new Date(tokens.expiresAt);
    
    if (expiresAt <= now) {
      this.clearTokens();
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
