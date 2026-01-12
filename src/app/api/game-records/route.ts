/**
 * 游戏记录 API
 * POST /api/game-records - 提交游戏记录
 * GET /api/game-records - 获取游戏历史
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 提交游戏记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      score,
      moves,
      targetScore = 1000,
      isWon,
      playTime,
      maxCombo = 0,
      totalMatches = 0,
      gameData,
    } = body;

    // 验证必需字段
    if (!userId || score === undefined || moves === undefined || isWon === undefined || !playTime) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必需字段',
        },
        { status: 400 }
      );
    }

    // 创建游戏记录
    const gameRecord = await prisma.gameRecord.create({
      data: {
        userId,
        score,
        moves,
        targetScore,
        isWon,
        playTime,
        maxCombo,
        totalMatches,
        gameData,
      },
    });

    // 更新用户统计
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          gamesPlayed: { increment: 1 },
          totalScore: { increment: score },
          highestScore: Math.max(user.highestScore, score),
          totalPlayTime: { increment: playTime },
        },
      });
    }

    // 更新排行榜（简化版，实际应该使用后台任务）
    await updateLeaderboard(userId, score);

    return NextResponse.json(
      {
        success: true,
        data: gameRecord,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('提交游戏记录失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '提交游戏记录失败',
      },
      { status: 500 }
    );
  }
}

// 获取游戏历史
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少 userId 参数',
        },
        { status: 400 }
      );
    }

    const [records, total] = await Promise.all([
      prisma.gameRecord.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          score: true,
          moves: true,
          targetScore: true,
          isWon: true,
          playTime: true,
          maxCombo: true,
          totalMatches: true,
          createdAt: true,
        },
      }),
      prisma.gameRecord.count({
        where: { userId },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        records,
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('获取游戏历史失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取游戏历史失败',
      },
      { status: 500 }
    );
  }
}

// 更新排行榜辅助函数
async function updateLeaderboard(userId: string, score: number) {
  const period = 'all';
  const type = 'ALL_TIME';

  // 查找现有记录
  const existing = await prisma.leaderboard.findUnique({
    where: {
      userId_type_period: {
        userId,
        type,
        period,
      },
    },
  });

  if (existing) {
    // 如果新分数更高，更新记录
    if (score > existing.score) {
      await prisma.leaderboard.update({
        where: { id: existing.id },
        data: { score },
      });
    }
  } else {
    // 创建新记录
    await prisma.leaderboard.create({
      data: {
        userId,
        type,
        score,
        rank: 0, // 将在批量更新排名时计算
        period,
      },
    });
  }

  // TODO: 批量更新排名（应该使用后台任务）
}
