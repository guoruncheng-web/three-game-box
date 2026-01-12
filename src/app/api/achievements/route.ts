/**
 * 成就 API
 * GET /api/achievements - 获取所有成就
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const achievements = await prisma.achievement.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { category: 'asc' },
        { reward: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: achievements,
    });
  } catch (error) {
    console.error('获取成就列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取成就列表失败',
      },
      { status: 500 }
    );
  }
}
