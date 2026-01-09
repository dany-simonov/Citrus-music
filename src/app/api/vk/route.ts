/**
 * Серверный прокси для VK API (обход CORS)
 */
import { NextRequest, NextResponse } from 'next/server';

const VK_API_URL = 'https://api.vk.com/method';
const VK_API_VERSION = '5.199';

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
      console.log(`VK API attempt ${i + 1}/${retries} failed:`, error.message);
      
      if (i === retries - 1) {
        throw error;
      }
      
      // Ждём перед повторной попыткой
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('All retries failed');
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

    // Формируем параметры запроса
    const queryParams = new URLSearchParams();
    queryParams.append('access_token', accessToken);
    queryParams.append('v', VK_API_VERSION);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = `${VK_API_URL}/${method}?${queryParams.toString()}`;

    // Выполняем запрос к VK API с retry и увеличенным timeout
    const response = await fetchWithRetry(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'KateMobileAndroid/56 lite-460 (Android 4.4.2; SDK 19; x86; unknown Android SDK built for x86; en)',
      },
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('VK API Proxy error:', error);
    
    // Более информативная ошибка
    const errorMessage = error.name === 'AbortError' 
      ? 'Timeout: VK API не отвечает. Проверьте подключение к интернету.'
      : error.message || 'Failed to fetch from VK API';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
