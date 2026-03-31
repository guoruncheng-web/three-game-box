/**
 * 获取对局结果 API
 * GET /api/zjh/games/:gameId/result
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { HAND_TYPE_DISPLAY } from '@/lib/zjh/constants';
import type { Card, HandType } from '@/types/zjh';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;

    if (!gameId) {
      return NextResponse.json(
        { success: false, error: '缺少 gameId' },
        { status: 400 }
      );
    }

    const game = await prisma.zjhGame.findUnique({
      where: { id: gameId },
      include: {
        players: { orderBy: { seatIndex: 'asc' } },
      },
    });

    if (!game) {
      return NextResponse.json(
        { success: false, error: '游戏不存在' },
        { status: 404 }
      );
    }

    if (game.status !== 'SETTLEMENT') {
      return NextResponse.json(
        { success: false, error: '游戏尚未结束' },
        { status: 400 }
      );
    }

    // 获取玩家用户信息
    const userIds = game.players.map(p => p.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, avatar: true },
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    // 计算游戏时长
    const duration = game.endedAt && game.startedAt
      ? Math.floor((game.endedAt.getTime() - game.startedAt.getTime()) / 1000)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        gameId: game.id,
        winnerId: game.winnerId,
        winnerHand: game.winnerHand,
        pot: game.pot,
        players: game.players.map(p => {
          const user = userMap.get(p.userId);
          const handType = p.handType as HandType | null;
          return {
            userId: p.userId,
            username: user?.username ?? null,
            hand: p.hand as unknown as Card[],
            handType,
            handTypeDisplay: handType ? HAND_TYPE_DISPLAY[handType] : null,
            totalBet: p.totalBet,
            chipsChange: p.chipsChange,
            isWinner: p.isWinner,
            status: p.status,
          };
        }),
        totalRounds: game.currentRound,
        duration,
      },
    });
  } catch (error) {
    console.error('获取对局结果失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
