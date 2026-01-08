/**
 * API Route для обновления токенов VK
 * @route POST /api/auth/vk/refresh
 */

import { NextRequest, NextResponse } from 'next/server';

const VK_CONFIG = {
  APP_ID: process.env.NEXT_PUBLIC_VK_APP_ID || '',
  CLIENT_SECRET: process.env.VK_CLIENT_SECRET || '',
  TOKEN_URL: 'https://id.vk.com/oauth2/auth',
};

interface RefreshRequestBody {
  refresh_token: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RefreshRequestBody = await request.json();
    
    if (!body.refresh_token) {
      return NextResponse.json(
        { error: 'Missing refresh_token' },
        { status: 400 }
      );
    }
    
    // Формируем запрос к VK OAuth
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: body.refresh_token,
      client_id: VK_CONFIG.APP_ID,
      client_secret: VK_CONFIG.CLIENT_SECRET,
    });
    
    const response = await fetch(VK_CONFIG.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    
    const data = await response.json();
    
    if (!response.ok || data.error) {
      console.error('VK token refresh error:', data);
      return NextResponse.json(
        { 
          error: data.error_description || data.error || 'Token refresh failed',
          details: data 
        },
        { status: response.status || 400 }
      );
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('VK token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
