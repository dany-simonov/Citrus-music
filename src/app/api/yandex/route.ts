/**
 * Прокси для Yandex Music API
 * Обходит CORS, делая запросы с сервера
 */

import { NextRequest, NextResponse } from 'next/server';

const YANDEX_API_BASE = 'https://api.music.yandex.net:443';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get('endpoint');
  const token = request.headers.get('Authorization')?.replace('OAuth ', '');
  
  if (!endpoint) {
    return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
  }
  
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 });
  }
  
  try {
    const url = `${YANDEX_API_BASE}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `OAuth ${token}`,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Yandex API Error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Yandex proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from Yandex API' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get('endpoint');
  const token = request.headers.get('Authorization')?.replace('OAuth ', '');
  
  if (!endpoint) {
    return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
  }
  
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 });
  }
  
  try {
    const body = await request.text();
    const url = `${YANDEX_API_BASE}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `OAuth ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Yandex API Error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Yandex proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from Yandex API' },
      { status: 500 }
    );
  }
}
