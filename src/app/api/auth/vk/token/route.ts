/**
 * API Route для обмена кода на токены VK
 * @route POST /api/auth/vk/token
 */

import { NextRequest, NextResponse } from 'next/server';

const VK_CONFIG = {
  APP_ID: process.env.NEXT_PUBLIC_VK_APP_ID || '',
  CLIENT_SECRET: process.env.VK_CLIENT_SECRET || '',
  TOKEN_URL: 'https://id.vk.com/oauth2/auth',
};

interface TokenRequestBody {
  code: string;
  code_verifier: string;
  redirect_uri: string;
  device_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TokenRequestBody = await request.json();
    
    if (!body.code || !body.code_verifier || !body.redirect_uri) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Формируем запрос к VK OAuth
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: body.code,
      code_verifier: body.code_verifier,
      client_id: VK_CONFIG.APP_ID,
      client_secret: VK_CONFIG.CLIENT_SECRET,
      redirect_uri: body.redirect_uri,
    });
    
    if (body.device_id) {
      params.append('device_id', body.device_id);
    }
    
    const response = await fetch(VK_CONFIG.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    
    const data = await response.json();
    
    if (!response.ok || data.error) {
      console.error('VK token exchange error:', data);
      return NextResponse.json(
        { 
          error: data.error_description || data.error || 'Token exchange failed',
          details: data 
        },
        { status: response.status || 400 }
      );
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('VK token exchange error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
