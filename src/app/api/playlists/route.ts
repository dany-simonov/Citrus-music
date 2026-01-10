/**
 * API для работы с пользовательскими плейлистами
 * @module api/playlists
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET - получить все плейлисты пользователя
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }
  
  try {
    const playlists = await prisma.playlist.findMany({
      where: { userId },
      include: {
        tracks: {
          orderBy: { position: 'asc' },
        },
        _count: {
          select: { tracks: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    
    return NextResponse.json({ playlists });
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST - создать новый плейлист
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, description, coverUrl } = body;
    
    if (!userId || !title) {
      return NextResponse.json({ error: 'userId and title required' }, { status: 400 });
    }
    
    // Сначала создаём пользователя если его нет
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId },
    });
    
    const playlist = await prisma.playlist.create({
      data: {
        userId,
        title,
        description,
        coverUrl,
      },
    });
    
    return NextResponse.json({ playlist }, { status: 201 });
  } catch (error) {
    console.error('Error creating playlist:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// DELETE - удалить плейлист
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const playlistId = searchParams.get('playlistId');
  
  if (!playlistId) {
    return NextResponse.json({ error: 'playlistId required' }, { status: 400 });
  }
  
  try {
    await prisma.playlist.delete({
      where: { id: playlistId },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// PATCH - обновить плейлист
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { playlistId, name, description, coverUrl } = body;
    
    if (!playlistId) {
      return NextResponse.json({ error: 'playlistId required' }, { status: 400 });
    }
    
    const updateData: any = {};
    if (name !== undefined) updateData.title = name;
    if (description !== undefined) updateData.description = description;
    if (coverUrl !== undefined) updateData.coverUrl = coverUrl;
    
    const playlist = await prisma.playlist.update({
      where: { id: playlistId },
      data: updateData,
    });
    
    return NextResponse.json({ playlist });
  } catch (error) {
    console.error('Error updating playlist:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
