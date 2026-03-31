/**
 * 比牌 API
 * POST /api/zjh/games/compare
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compareHands, evaluateHand } from '@/lib/zjh/hand-evaluator';
import { BET_MULTIPLIER, HAND_TYPE_DISPLAY } from '@/lib/zjh/constants';
import { settleGameInDb } from '@/lib/zjh/settle';
import type { CompareRequest, Card } from '@/types/zjh';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CompareRequest;
    const { userId, gameId, targetUserId } = body;

    if (!userId || !gameId || !targetUserId) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    if (userId === targetUserId) {
      return NextResponse.json(
        { success: false, error: '不能和自己比牌' },
        { status: 400 }
      );
    }

    // 查找游戏
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

    if (game.status !== 'BETTING') {
      return NextResponse.json(
        { success: false, error: '游戏不在下注阶段' },
        { status: 400 }
      );
    }

    if (game.currentTurn !== userId) {
      return NextResponse.json(
        { success: false, error: '不是你的回合' },
        { status: 400 }
      );
    }

    const initiator = game.players.find(p => p.userId === userId);
    const target = game.players.find(p => p.userId === targetUserId);

    if (!initiator || !target) {
      return NextResponse.json(
        { success: false, error: '玩家不在游戏中' },
        { status: 400 }
      );
    }

    // 发起者必须已看牌
    if (!initiator.hasLooked) {
      return NextResponse.json(
        { success: false, error: '未看牌不能主动发起比牌' },
        { status: 400 }
      );
    }

    // 目标玩家必须在游戏中
    if (target.status === 'FOLDED' || target.status === 'OUT') {
      return NextResponse.json(
        { success: false, error: '目标玩家已退出' },
        { status: 400 }
      );
    }

    // 比牌费用
    const cost = game.currentAnte * BET_MULTIPLIER.COMPARE_COST;

    // 获取发起者当前筹码
    const roomPlayer = await prisma.zjhRoomPlayer.findFirst({
      where: { roomId: game.roomId, userId, leftAt: null },
    });
    const currentChips = roomPlayer?.chips ?? 0;

    if (currentChips < cost) {
      return NextResponse.json(
        { success: false, error: '筹码不足以发起比牌' },
        { status: 400 }
      );
    }

    // 比较手牌
    const initiatorHand = initiator.hand as unknown as Card[];
    const targetHand = target.hand as unknown as Card[];
    const result = compareHands(initiatorHand, targetHand);

    const initiatorEval = evaluateHand(initiatorHand);
    const targetEval = evaluateHand(targetHand);

    const initiatorWins = result > 0;
    const winnerId = initiatorWins ? userId : targetUserId;
    const loserId = initiatorWins ? targetUserId : userId;

    const newPot = game.pot + cost;

    // 扣除比牌费用
    await prisma.zjhRoomPlayer.updateMany({
      where: { roomId: game.roomId, userId, leftAt: null },
      data: { chips: { decrement: cost } },
    });

    // 更新发起者下注和状态
    await prisma.zjhGamePlayer.update({
      where: { id: initiator.id },
      data: {
        totalBet: initiator.totalBet + cost,
        status: initiatorWins ? initiator.status : 'OUT',
      },
    });

    // 更新目标玩家状态（仅当目标是失败者时）
    if (initiatorWins) {
      await prisma.zjhGamePlayer.update({
        where: { id: target.id },
        data: { status: 'OUT' },
      });
    }

    // 记录比牌操作
    const actionCount = await prisma.zjhGameAction.count({
      where: { gameId, round: game.currentRound },
    });

    await prisma.zjhGameAction.create({
      data: {
        gameId,
        userId,
        round: game.currentRound,
        actionOrder: actionCount + 1,
        actionType: 'COMPARE',
        amount: cost,
        targetUserId,
        compareResult: initiatorWins,
      },
    });

    // 检查游戏是否结束
    const updatedPlayers = await prisma.zjhGamePlayer.findMany({
      where: { gameId },
      orderBy: { seatIndex: 'asc' },
    });

    const activePlayers = updatedPlayers.filter(
      p => p.status !== 'FOLDED' && p.status !== 'OUT'
    );

    const gameOver = activePlayers.length <= 1;
    let nextTurn: string | null = null;

    if (gameOver) {
      const finalWinnerId = activePlayers.length === 1 ? activePlayers[0].userId : winnerId;
      await settleGameInDb(gameId, game.roomId, finalWinnerId, newPot, game.currentRound);
    } else {
      // 找下一个行动玩家
      const playablePlayers = updatedPlayers.filter(
        p => p.status !== 'FOLDED' && p.status !== 'OUT' && p.status !== 'ALL_IN'
      );
      if (playablePlayers.length > 0) {
        const currentIdx = playablePlayers.findIndex(p => p.userId === userId);
        const nextIdx = (currentIdx + 1) % playablePlayers.length;
        nextTurn = playablePlayers[nextIdx].userId;
      }

      await prisma.zjhGame.update({
        where: { id: gameId },
        data: {
          pot: newPot,
          currentTurn: nextTurn,
        },
      });
    }

    // 比牌结果：仅返回牌型信息，不返回具体手牌（防止信息泄露）
    // 只有游戏结束（结算阶段）时才通过 result 接口展示所有手牌
    return NextResponse.json({
      success: true,
      data: {
        initiator: {
          userId,
          handType: initiatorEval.handType,
          handTypeDisplay: HAND_TYPE_DISPLAY[initiatorEval.handType],
        },
        target: {
          userId: targetUserId,
          handType: targetEval.handType,
          handTypeDisplay: HAND_TYPE_DISPLAY[targetEval.handType],
        },
        winnerId,
        loserId,
        cost,
        pot: newPot,
        currentTurn: gameOver ? null : nextTurn,
        gameOver,
      },
    });
  } catch (error) {
    console.error('比牌失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
