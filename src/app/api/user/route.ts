/**
 * API для работы с пользователем
 * @module api/user
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET - получить или создать пользователя
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const vkId = searchParams.get('vkId');
  const yandexId = searchParams.get('yandexId');
  
  if (!vkId && !yandexId) {
    return NextResponse.json({ error: 'vkId or yandexId required' }, { status: 400 });
  }
  
  try {
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          vkId ? { vkId } : {},
          yandexId ? { yandexId } : {},
        ].filter(o => Object.keys(o).length > 0),
      },
    });
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST - создать или обновить пользователя
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vkId, yandexId, firstName, lastName, avatarUrl } = body;
    
    if (!vkId && !yandexId) {
      return NextResponse.json({ error: 'vkId or yandexId required' }, { status: 400 });
    }
    
    if (!firstName) {
      return NextResponse.json({ error: 'firstName required' }, { status: 400 });
    }
    
    // Ищем существующего пользователя
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          vkId ? { vkId } : {},
          yandexId ? { yandexId } : {},
        ].filter(o => Object.keys(o).length > 0),
      },
    });
    
    if (user) {
      // Обновляем
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName,
          lastName,
          avatarUrl,
          ...(vkId && { vkId }),
          ...(yandexId && { yandexId }),
        },
      });
    } else {
      // Создаём
      user = await prisma.user.create({
        data: {
          vkId,
          yandexId,
          firstName,
          lastName,
          avatarUrl,
        },
      });
    }
    
    return NextResponse.json({ user }, { status: user ? 200 : 201 });
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
