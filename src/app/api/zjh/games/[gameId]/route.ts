/**
 * 获取游戏状态 API
 * GET /api/zjh/games/:gameId
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { HAND_TYPE_DISPLAY } from '@/lib/zjh/constants';
import type { Card, HandType } from '@/types/zjh';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!gameId) {
      return NextResponse.json(
        { success: false, error: '缺少 gameId' },
        { status: 400 }
      );
    }

    const game = await prisma.zjhGame.findUnique({
      where: { id: gameId },
      include: {
        room: true,
        players: {
          orderBy: { seatIndex: 'asc' },
          include: {
            // 无法直接 include user，需要手动查找
          },
        },
        actions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!game) {
      return NextResponse.json(
        { success: false, error: '游戏不存在' },
        { status: 404 }
      );
    }

    // 获取玩家用户信息
    const userIds = game.players.map(p => p.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, avatar: true },
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    // 构建玩家信息（控制手牌可见性）
    const isSettled = game.status === 'SETTLEMENT' || game.status === 'SHOWDOWN';
    const players = game.players.map(p => {
      const user = userMap.get(p.userId);
      const isCurrentUser = p.userId === userId;
      // 只有本人已看牌或游戏已结算时才能看到手牌
      // TODO: userId 应从认证 session 获取，而非 query string，防止伪造
      const canSeeHand = (isCurrentUser && p.hasLooked) || isSettled;

      return {
        userId: p.userId,
        username: user?.username ?? null,
        avatar: user?.avatar ?? null,
        seatIndex: p.seatIndex,
        status: p.status,
        hasLooked: p.hasLooked,
        totalBet: p.totalBet,
        hand: canSeeHand ? (p.hand as unknown as Card[]) : null,
        handType: canSeeHand ? (p.handType as HandType | null) : null,
        handTypeDisplay: canSeeHand && p.handType
          ? HAND_TYPE_DISPLAY[p.handType as HandType]
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        gameId: game.id,
        roomId: game.roomId,
        status: game.status,
        pot: game.pot,
        currentAnte: game.currentAnte,
        currentRound: game.currentRound,
        currentTurn: game.currentTurn,
        dealerIndex: game.dealerIndex,
        maxRounds: game.room.maxRounds,
        players,
        recentActions: game.actions.map(a => ({
          userId: a.userId,
          actionType: a.actionType,
          amount: a.amount,
          round: a.round,
          createdAt: a.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error('获取游戏状态失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
