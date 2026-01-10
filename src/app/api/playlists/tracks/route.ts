/**
 * API для добавления/удаления треков в плейлисте
 * @module api/playlists/tracks
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// POST - добавить трек в плейлист
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playlistId, track } = body;
    
    if (!playlistId || !track) {
      return NextResponse.json({ error: 'playlistId and track required' }, { status: 400 });
    }
    
    // Проверяем, не добавлен ли уже
    const existing = await prisma.playlistTrack.findUnique({
      where: {
        playlistId_trackId: {
          playlistId,
          trackId: track.id,
        },
      },
    });
    
    if (existing) {
      return NextResponse.json({ error: 'Track already in playlist' }, { status: 409 });
    }
    
    // Получаем последнюю позицию
    const lastTrack = await prisma.playlistTrack.findFirst({
      where: { playlistId },
      orderBy: { position: 'desc' },
    });
    
    const position = lastTrack ? lastTrack.position + 1 : 0;
    
    const playlistTrack = await prisma.playlistTrack.create({
      data: {
        playlistId,
        trackId: track.id,
        title: track.title,
        artist: track.artist,
        duration: track.duration,
        coverUrl: track.coverUrl,
        audioUrl: track.audioUrl,
        source: track.source || 'vk',
        position,
      },
    });
    
    // Обновляем время изменения плейлиста
    await prisma.playlist.update({
      where: { id: playlistId },
      data: { updatedAt: new Date() },
    });
    
    return NextResponse.json({ track: playlistTrack }, { status: 201 });
  } catch (error) {
    console.error('Error adding track to playlist:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// DELETE - удалить трек из плейлиста
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const playlistId = searchParams.get('playlistId');
  const trackId = searchParams.get('trackId');
  
  if (!playlistId || !trackId) {
    return NextResponse.json({ error: 'playlistId and trackId required' }, { status: 400 });
  }
  
  try {
    await prisma.playlistTrack.delete({
      where: {
        playlistId_trackId: {
          playlistId,
          trackId,
        },
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing track from playlist:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
