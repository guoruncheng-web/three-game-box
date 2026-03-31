/**
 * 获取玩家战绩 API
 * GET /api/zjh/stats/:userId
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_CHIPS } from '@/lib/zjh/constants';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少 userId' },
        { status: 400 }
      );
    }

    // 获取或创建玩家战绩
    let stats = await prisma.zjhPlayerStats.findUnique({
      where: { userId },
    });

    if (!stats) {
      // 检查用户是否存在
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return NextResponse.json(
          { success: false, error: '用户不存在' },
          { status: 404 }
        );
      }

      stats = await prisma.zjhPlayerStats.create({
        data: { userId, currentChips: INITIAL_CHIPS },
      });
    }

    const winRate = stats.totalGames > 0
      ? Number((stats.totalWins / stats.totalGames).toFixed(4))
      : 0;

    const netProfit = stats.totalChipsWon - stats.totalChipsLost;

    return NextResponse.json({
      success: true,
      data: {
        userId,
        currentChips: stats.currentChips,
        totalGames: stats.totalGames,
        totalWins: stats.totalWins,
        winRate,
        totalChipsWon: stats.totalChipsWon,
        totalChipsLost: stats.totalChipsLost,
        netProfit,
        maxSingleWin: stats.maxSingleWin,
        handStats: {
          triple: stats.tripleCount,
          straightFlush: stats.straightFlushCount,
          flush: stats.flushCount,
          straight: stats.straightCount,
          pair: stats.pairCount,
          highCard: stats.highCardCount,
        },
      },
    });
  } catch (error) {
    console.error('获取玩家战绩失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
