/**
 * 游客用户 API
 * POST /api/users/guest - 创建游客用户
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // 生成游客标识
    const guestToken = randomUUID();

    // 创建游客用户
    const user = await prisma.user.create({
      data: {
        isGuest: true,
        guestToken,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          userId: user.id,
          guestToken: user.guestToken,
          isGuest: user.isGuest,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('创建游客用户失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '创建游客用户失败',
      },
      { status: 500 }
    );
  }
}
