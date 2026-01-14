/**
 * Серверный прокси для Yandex Music API (обход CORS)
 * 
 * ⚠️ ВАЖНО: Это неофициальный API, который может измениться без предупреждения.
 * Мы используем reverse-engineered эндпоинты Яндекс.Музыки.
 * 
 * @module api/yandex/route
 */
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const YANDEX_MUSIC_API = 'https://api.music.yandex.net';

// Функция для выполнения запроса с retry
async function fetchWithRetry(url: string, options: RequestInit, retries = 3, timeout = 30000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      console.log(`Yandex API attempt ${i + 1}/${retries} failed:`, error.message);
      
      if (i === retries - 1) {
        throw error;
      }
      
      // Ждём перед повторной попыткой
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('All retries failed');
}

// Генерация sign для получения прямой ссылки на трек
function generateSign(trackId: string, salt: string): string {
  const toSign = `XGRlBW9FXlekgbPrRHuSiA${trackId}${salt}`;
  return crypto.createHash('md5').update(toSign).digest('hex');
}

// Общие заголовки для запросов
function getHeaders(accessToken: string): HeadersInit {
  return {
    'Authorization': `OAuth ${accessToken}`,
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
    'X-Yandex-Music-Client': 'YandexMusicAPI',
    'User-Agent': 'Yandex-Music-API',
  };
}

export async function GET(request: NextRequest) {
  // Для обратной совместимости поддерживаем старый формат
  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get('endpoint');
  const token = request.headers.get('Authorization')?.replace('OAuth ', '');
  
  if (!endpoint || !token) {
    return NextResponse.json({ error: 'Missing endpoint or token' }, { status: 400 });
  }
  
  try {
    const response = await fetchWithRetry(`${YANDEX_MUSIC_API}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Yandex API Error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json({ result: data });
  } catch (error: any) {
    console.error('Yandex proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch from Yandex API' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { method, params, accessToken } = body;

    if (!method) {
      return NextResponse.json(
        { error: 'Method is required' },
        { status: 400 }
      );
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 401 }
      );
    }

    const headers = getHeaders(accessToken);
    let url = '';
    let fetchOptions: RequestInit = { headers };

    // Роутинг методов
    switch (method) {
      // Получить информацию о текущем пользователе
      case 'account/status': {
        url = `${YANDEX_MUSIC_API}/account/status`;
        fetchOptions.method = 'GET';
        break;
      }

      // Получить плейлисты пользователя
      case 'users/playlists/list': {
        const userId = params?.userId;
        if (!userId) {
          return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }
        url = `${YANDEX_MUSIC_API}/users/${userId}/playlists/list`;
        fetchOptions.method = 'GET';
        break;
      }

      // Получить конкретный плейлист
      case 'users/playlists': {
        const { userId, kind } = params || {};
        if (!userId || !kind) {
          return NextResponse.json({ error: 'userId and kind are required' }, { status: 400 });
        }
        url = `${YANDEX_MUSIC_API}/users/${userId}/playlists/${kind}`;
        fetchOptions.method = 'GET';
        break;
      }

      // Получить лайкнутые треки
      case 'users/likes/tracks': {
        const userId = params?.userId;
        if (!userId) {
          return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }
        url = `${YANDEX_MUSIC_API}/users/${userId}/likes/tracks`;
        fetchOptions.method = 'GET';
        break;
      }

      // Получить информацию о треках по ID
      case 'tracks': {
        const trackIds = params?.trackIds;
        if (!trackIds || !Array.isArray(trackIds)) {
          return NextResponse.json({ error: 'trackIds array is required' }, { status: 400 });
        }
        url = `${YANDEX_MUSIC_API}/tracks`;
        fetchOptions.method = 'POST';
        fetchOptions.body = new URLSearchParams({
          'track-ids': trackIds.join(','),
        }).toString();
        break;
      }

      // Получить информацию для скачивания трека
      case 'tracks/download-info': {
        const trackId = params?.trackId;
        if (!trackId) {
          return NextResponse.json({ error: 'trackId is required' }, { status: 400 });
        }
        url = `${YANDEX_MUSIC_API}/tracks/${trackId}/download-info`;
        fetchOptions.method = 'GET';
        break;
      }

      // Получить прямую ссылку на трек
      case 'tracks/direct-link': {
        const { downloadInfoUrl } = params || {};
        if (!downloadInfoUrl) {
          return NextResponse.json({ error: 'downloadInfoUrl is required' }, { status: 400 });
        }

        // Запрашиваем XML с информацией о скачивании
        const xmlResponse = await fetchWithRetry(downloadInfoUrl + '&format=json', {
          method: 'GET',
          headers: { 'Accept': '*/*' },
        });
        
        const xmlText = await xmlResponse.text();
        
        // Парсим XML (простой парсинг)
        const hostMatch = xmlText.match(/<host>([^<]+)<\/host>/);
        const pathMatch = xmlText.match(/<path>([^<]+)<\/path>/);
        const tsMatch = xmlText.match(/<ts>([^<]+)<\/ts>/);
        const sMatch = xmlText.match(/<s>([^<]+)<\/s>/);

        if (!hostMatch || !pathMatch || !tsMatch || !sMatch) {
          return NextResponse.json({ error: 'Failed to parse download info' }, { status: 500 });
        }

        const host = hostMatch[1];
        const path = pathMatch[1];
        const ts = tsMatch[1];
        const s = sMatch[1];

        // Генерируем sign
        const sign = generateSign(path.slice(1, path.lastIndexOf('/')), s);
        
        // Формируем прямую ссылку
        const directLink = `https://${host}/get-mp3/${sign}/${ts}${path}`;
        
        return NextResponse.json({ result: { directLink } });
      }

      // Поиск
      case 'search': {
        const { text, type = 'all', page = 0, pageSize = 20 } = params || {};
        if (!text) {
          return NextResponse.json({ error: 'text is required' }, { status: 400 });
        }
        const searchParams = new URLSearchParams({
          text,
          type,
          page: String(page),
          'page-size': String(pageSize),
        });
        url = `${YANDEX_MUSIC_API}/search?${searchParams.toString()}`;
        fetchOptions.method = 'GET';
        break;
      }

      // Лайкнуть трек
      case 'users/likes/tracks/add': {
        const { userId, trackIds } = params || {};
        if (!userId || !trackIds) {
          return NextResponse.json({ error: 'userId and trackIds are required' }, { status: 400 });
        }
        url = `${YANDEX_MUSIC_API}/users/${userId}/likes/tracks/add-multiple`;
        fetchOptions.method = 'POST';
        fetchOptions.body = new URLSearchParams({
          'track-ids': Array.isArray(trackIds) ? trackIds.join(',') : trackIds,
        }).toString();
        break;
      }

      // Убрать лайк с трека
      case 'users/likes/tracks/remove': {
        const { userId, trackIds } = params || {};
        if (!userId || !trackIds) {
          return NextResponse.json({ error: 'userId and trackIds are required' }, { status: 400 });
        }
        url = `${YANDEX_MUSIC_API}/users/${userId}/likes/tracks/remove`;
        fetchOptions.method = 'POST';
        fetchOptions.body = new URLSearchParams({
          'track-ids': Array.isArray(trackIds) ? trackIds.join(',') : trackIds,
        }).toString();
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown method: ${method}` },
          { status: 400 }
        );
    }

    // Выполняем запрос к Yandex API
    const response = await fetchWithRetry(url, fetchOptions);
    
    // Проверяем статус ответа
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Yandex API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Yandex API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ result: data });

  } catch (error: any) {
    console.error('Yandex API Proxy error:', error);
    
    const errorMessage = error.name === 'AbortError' 
      ? 'Timeout: Яндекс.Музыка не отвечает. Проверьте подключение к интернету.'
      : error.message || 'Failed to fetch from Yandex Music API';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
