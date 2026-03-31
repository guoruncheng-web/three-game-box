/**
 * 看牌 API
 * POST /api/zjh/games/look
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { evaluateHand } from '@/lib/zjh/hand-evaluator';
import { HAND_TYPE_DISPLAY } from '@/lib/zjh/constants';
import type { LookRequest, Card, HandType } from '@/types/zjh';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LookRequest;
    const { userId, gameId } = body;

    if (!userId || !gameId) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 查找游戏和玩家
    const gamePlayer = await prisma.zjhGamePlayer.findFirst({
      where: { gameId, userId },
      include: { game: true },
    });

    if (!gamePlayer) {
      return NextResponse.json(
        { success: false, error: '你不在该游戏中' },
        { status: 404 }
      );
    }

    if (gamePlayer.game.status !== 'BETTING') {
      return NextResponse.json(
        { success: false, error: '游戏不在下注阶段' },
        { status: 400 }
      );
    }

    if (gamePlayer.status === 'FOLDED' || gamePlayer.status === 'OUT') {
      return NextResponse.json(
        { success: false, error: '你已退出本局' },
        { status: 400 }
      );
    }

    if (gamePlayer.hasLooked) {
      // 已看过牌，直接返回手牌信息
      const hand = gamePlayer.hand as unknown as Card[];
      const handType = gamePlayer.handType as HandType;
      return NextResponse.json({
        success: true,
        data: {
          hand,
          handType,
          handTypeDisplay: HAND_TYPE_DISPLAY[handType],
        },
      });
    }

    // 更新看牌状态
    const hand = gamePlayer.hand as unknown as Card[];
    const evaluation = evaluateHand(hand);

    await prisma.zjhGamePlayer.update({
      where: { id: gamePlayer.id },
      data: {
        hasLooked: true,
        status: 'LOOKED',
        handType: evaluation.handType,
        handRank: evaluation.handRank,
      },
    });

    // 记录看牌操作
    const actionCount = await prisma.zjhGameAction.count({
      where: { gameId, round: gamePlayer.game.currentRound },
    });

    await prisma.zjhGameAction.create({
      data: {
        gameId,
        userId,
        round: gamePlayer.game.currentRound,
        actionOrder: actionCount + 1,
        actionType: 'LOOK',
        amount: 0,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        hand,
        handType: evaluation.handType,
        handTypeDisplay: HAND_TYPE_DISPLAY[evaluation.handType],
      },
    });
  } catch (error) {
    console.error('看牌失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
