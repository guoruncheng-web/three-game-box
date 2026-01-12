/**
 * 游戏统计 API
 * GET /api/game-records/stats?userId=xxx - 获取用户游戏统计
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少 userId 参数',
        },
        { status: 400 }
      );
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        gamesPlayed: true,
        totalScore: true,
        highestScore: true,
        totalPlayTime: true,
        level: true,
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

    // 获取游戏记录统计
    const stats = await prisma.gameRecord.aggregate({
      where: { userId },
      _avg: {
        score: true,
        playTime: true,
        maxCombo: true,
      },
      _max: {
        score: true,
        maxCombo: true,
      },
      _count: {
        id: true,
      },
    });

    // 获取胜率
    const wins = await prisma.gameRecord.count({
      where: {
        userId,
        isWon: true,
      },
    });

    const winRate = user.gamesPlayed > 0 ? (wins / user.gamesPlayed) * 100 : 0;

    // 获取最近游戏
    const recentGames = await prisma.gameRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        score: true,
        isWon: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          gamesPlayed: user.gamesPlayed,
          totalScore: user.totalScore,
          highestScore: user.highestScore,
          totalPlayTime: user.totalPlayTime,
          level: user.level,
          winRate: Math.round(winRate * 100) / 100,
        },
        averages: {
          avgScore: Math.round(stats._avg.score || 0),
          avgPlayTime: Math.round(stats._avg.playTime || 0),
          avgCombo: Math.round((stats._avg.maxCombo || 0) * 10) / 10,
        },
        records: {
          maxScore: stats._max.score || 0,
          maxCombo: stats._max.maxCombo || 0,
          totalGames: stats._count.id,
        },
        recentGames,
      },
    });
  } catch (error) {
    console.error('获取游戏统计失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取游戏统计失败',
      },
      { status: 500 }
    );
  }
}
