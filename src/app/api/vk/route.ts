/**
 * Серверный прокси для VK API (обход CORS)
 */
import { NextRequest, NextResponse } from 'next/server';

const VK_API_URL = 'https://api.vk.com/method';
const VK_API_VERSION = '5.199';

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

    // Выполняем запрос к VK API с сервера (без CORS ограничений)
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'KateMobileAndroid/56 lite-460 (Android 4.4.2; SDK 19; x86; unknown Android SDK built for x86; en)',
      },
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('VK API Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from VK API' },
      { status: 500 }
    );
  }
}
