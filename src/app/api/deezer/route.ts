/**
 * Прокси для Deezer API - обходим CORS
 * @module api/deezer
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 });
  }
  
  try {
    const response = await fetch(
      `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=1`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 86400 } // Кэшируем на 24 часа
      }
    );
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Deezer API error' }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Deezer proxy error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
