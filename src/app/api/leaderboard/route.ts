/**
 * 排行榜 API
 * GET /api/leaderboard?type=ALL_TIME&limit=100 - 获取排行榜
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get('type') || 'ALL_TIME') as 'ALL_TIME' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    const limit = parseInt(searchParams.get('limit') || '100');
    const userId = searchParams.get('userId');

    // 确定周期
    const period = getPeriod(type);

    // 获取排行榜数据
    const leaderboard = await prisma.leaderboard.findMany({
      where: {
        type,
        period,
      },
      orderBy: {
        score: 'desc',
      },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            isGuest: true,
          },
        },
      },
    });

    // 更新排名
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    // 如果提供了 userId，查找用户排名
    let userRank = null;
    if (userId) {
      const userEntry = await prisma.leaderboard.findUnique({
        where: {
          userId_type_period: {
            userId,
            type,
            period,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
              isGuest: true,
            },
          },
        },
      });

      if (userEntry) {
        // 计算用户排名
        const betterScores = await prisma.leaderboard.count({
          where: {
            type,
            period,
            score: {
              gt: userEntry.score,
            },
          },
        });

        userRank = {
          ...userEntry,
          rank: betterScores + 1,
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: rankedLeaderboard,
        userRank,
        type,
        period,
      },
    });
  } catch (error) {
    console.error('获取排行榜失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取排行榜失败',
      },
      { status: 500 }
    );
  }
}

// 根据类型获取周期
function getPeriod(type: string): string {
  const now = new Date();

  switch (type) {
    case 'ALL_TIME':
      return 'all';
    case 'DAILY':
      return now.toISOString().split('T')[0]; // YYYY-MM-DD
    case 'WEEKLY':
      const weekNumber = getWeekNumber(now);
      return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
    case 'MONTHLY':
      return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    default:
      return 'all';
  }
}

// 获取周数
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
