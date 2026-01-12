/**
 * 用户详情 API
 * GET /api/users/[id] - 获取用户信息
 * PUT /api/users/[id] - 更新用户信息
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 获取用户信息
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        avatar: true,
        isGuest: true,
        totalScore: true,
        gamesPlayed: true,
        highestScore: true,
        totalPlayTime: true,
        level: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: '用户不存在',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取用户信息失败',
      },
      { status: 500 }
    );
  }
}

// 更新用户信息
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { username, avatar } = body;

    // 更新用户信息
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(username && { username }),
        ...(avatar && { avatar }),
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        isGuest: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '更新用户信息失败',
      },
      { status: 500 }
    );
  }
}
