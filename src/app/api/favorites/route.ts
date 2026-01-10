/**
 * API для работы с избранными треками
 * @module api/favorites
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET - получить все избранные треки пользователя
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }
  
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { addedAt: 'desc' },
    });
    
    return NextResponse.json({ favorites });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST - добавить трек в избранное
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, track } = body;
    
    if (!userId || !track) {
      return NextResponse.json({ error: 'userId and track required' }, { status: 400 });
    }
    
    // Проверяем, не добавлен ли уже
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_trackId: {
          userId,
          trackId: track.id,
        },
      },
    });
    
    if (existing) {
      return NextResponse.json({ error: 'Already in favorites', favorite: existing }, { status: 409 });
    }
    
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        trackId: track.id,
        title: track.title,
        artist: track.artist,
        duration: track.duration,
        coverUrl: track.coverUrl,
        audioUrl: track.audioUrl,
        source: track.source || 'vk',
      },
    });
    
    return NextResponse.json({ favorite }, { status: 201 });
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// DELETE - удалить трек из избранного
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const trackId = searchParams.get('trackId');
  
  if (!userId || !trackId) {
    return NextResponse.json({ error: 'userId and trackId required' }, { status: 400 });
  }
  
  try {
    await prisma.favorite.delete({
      where: {
        userId_trackId: {
          userId,
          trackId,
        },
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
