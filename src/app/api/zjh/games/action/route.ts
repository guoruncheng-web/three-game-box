/**
 * 玩家操作 API（跟注/加注/全押/弃牌）
 * POST /api/zjh/games/action
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compareHands } from '@/lib/zjh/hand-evaluator';
import { BET_MULTIPLIER } from '@/lib/zjh/constants';
import { settleGameInDb } from '@/lib/zjh/settle';
import type { ZjhPlayerStatus } from '@prisma/client';
import type { ActionRequest, Card } from '@/types/zjh';

/**
 * 获取下一个活跃玩家的 userId
 */
function getNextActivePlayer(
  players: { userId: string; seatIndex: number; status: string }[],
  currentUserId: string
): string | null {
  const activePlayers = players.filter(
    p => p.status !== 'FOLDED' && p.status !== 'OUT' && p.status !== 'ALL_IN'
  );
  if (activePlayers.length === 0) return null;

  const currentIndex = activePlayers.findIndex(p => p.userId === currentUserId);
  const nextIndex = (currentIndex + 1) % activePlayers.length;
  return activePlayers[nextIndex].userId;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ActionRequest;
    const { userId, gameId, actionType, amount } = body;

    if (!userId || !gameId || !actionType) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
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

    // 验证是否是当前行动玩家
    if (game.currentTurn !== userId) {
      return NextResponse.json(
        { success: false, error: '不是你的回合' },
        { status: 400 }
      );
    }

    const player = game.players.find(p => p.userId === userId);
    if (!player) {
      return NextResponse.json(
        { success: false, error: '你不在该游戏中' },
        { status: 400 }
      );
    }

    if (player.status === 'FOLDED' || player.status === 'OUT') {
      return NextResponse.json(
        { success: false, error: '你已退出本局' },
        { status: 400 }
      );
    }

    let betAmount = 0;
    let newStatus: string = player.status;
    let newAnte = game.currentAnte;

    // 计算房间玩家当前筹码
    const roomPlayer = await prisma.zjhRoomPlayer.findFirst({
      where: { roomId: game.roomId, userId, leftAt: null },
    });
    const currentChips = roomPlayer ? roomPlayer.chips : player.chipsBeforeGame - player.totalBet;

    switch (actionType) {
      case 'CALL': {
        betAmount = player.hasLooked ? game.currentAnte * 2 : game.currentAnte;
        if (currentChips < betAmount) {
          return NextResponse.json(
            { success: false, error: '筹码不足' },
            { status: 400 }
          );
        }
        break;
      }

      case 'RAISE': {
        if (!amount) {
          return NextResponse.json(
            { success: false, error: '加注必须指定金额' },
            { status: 400 }
          );
        }
        const minBet = player.hasLooked ? game.currentAnte * 2 : game.currentAnte;
        const maxBet = game.currentAnte * BET_MULTIPLIER.MAX_RAISE;
        if (amount < minBet || amount > maxBet) {
          return NextResponse.json(
            { success: false, error: `加注金额必须在 ${minBet} - ${maxBet} 之间` },
            { status: 400 }
          );
        }
        if (currentChips < amount) {
          return NextResponse.json(
            { success: false, error: '筹码不足' },
            { status: 400 }
          );
        }
        betAmount = amount;
        newAnte = amount;
        break;
      }

      case 'ALL_IN': {
        betAmount = currentChips;
        newStatus = 'ALL_IN';
        break;
      }

      case 'FOLD': {
        newStatus = 'FOLDED';
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: '无效操作类型' },
          { status: 400 }
        );
    }

    const newPot = game.pot + betAmount;
    const newTotalBet = player.totalBet + betAmount;

    // 记录操作
    const actionCount = await prisma.zjhGameAction.count({
      where: { gameId, round: game.currentRound },
    });

    await prisma.zjhGameAction.create({
      data: {
        gameId,
        userId,
        round: game.currentRound,
        actionOrder: actionCount + 1,
        actionType,
        amount: betAmount,
      },
    });

    // 更新玩家状态
    await prisma.zjhGamePlayer.update({
      where: { id: player.id },
      data: {
        status: newStatus as ZjhPlayerStatus,
        totalBet: newTotalBet,
      },
    });

    // 更新房间玩家筹码
    if (betAmount > 0) {
      await prisma.zjhRoomPlayer.updateMany({
        where: { roomId: game.roomId, userId, leftAt: null },
        data: { chips: { decrement: betAmount } },
      });
    }

    // 检查是否只剩一个活跃玩家
    const updatedPlayers = await prisma.zjhGamePlayer.findMany({
      where: { gameId },
      orderBy: { seatIndex: 'asc' },
    });

    const activePlayers = updatedPlayers.filter(
      p => p.status !== 'FOLDED' && p.status !== 'OUT'
    );

    let gameOver = false;
    let winnerId: string | undefined;

    if (activePlayers.length === 1) {
      gameOver = true;
      winnerId = activePlayers[0].userId;
    }

    // 检查封顶轮次
    const newRound = game.currentRound;
    if (!gameOver && newRound >= game.currentRound) {
      // 计算实际活跃（可操作）的玩家
      const playableCount = activePlayers.filter(p => p.status !== 'ALL_IN').length;
      if (playableCount <= 1 && activePlayers.length > 1) {
        // 所有人都 ALL_IN 或只剩一个可操作的人，强制比牌
        let bestPlayer = activePlayers[0];
        for (let i = 1; i < activePlayers.length; i++) {
          const bestHand = bestPlayer.hand as unknown as Card[];
          const currentHand = activePlayers[i].hand as unknown as Card[];
          const { compareHands } = await import('@/lib/zjh/hand-evaluator');
          if (compareHands(bestHand, currentHand) < 0) {
            bestPlayer = activePlayers[i];
          }
        }
        gameOver = true;
        winnerId = bestPlayer.userId;
      }
    }

    // 获取下一个行动玩家
    let nextTurn: string | null = null;
    if (!gameOver) {
      nextTurn = getNextActivePlayer(
        updatedPlayers.map(p => ({
          userId: p.userId,
          seatIndex: p.seatIndex,
          status: p.status,
        })),
        userId
      );

      // 检查新轮次
      let currentRound = game.currentRound;
      // 简单轮次判断：如果下一个玩家座位号 <= 当前玩家座位号，说明完成了一轮
      const currentSeat = player.seatIndex;
      const nextPlayer = updatedPlayers.find(p => p.userId === nextTurn);
      if (nextPlayer && nextPlayer.seatIndex <= currentSeat) {
        currentRound++;
      }

      // 检查是否达到封顶轮次
      if (currentRound > game.currentRound) {
        // 查找房间以获取 maxRounds
        const room = await prisma.zjhRoom.findUnique({ where: { id: game.roomId } });
        if (room && currentRound > room.maxRounds) {
          // 强制比牌
          let bestPlayer = activePlayers[0];
          for (let i = 1; i < activePlayers.length; i++) {
            const bestHand = bestPlayer.hand as unknown as Card[];
            const currentHand = activePlayers[i].hand as unknown as Card[];
            if (compareHands(bestHand, currentHand) < 0) {
              bestPlayer = activePlayers[i];
            }
          }
          gameOver = true;
          winnerId = bestPlayer.userId;
        } else {
          // 更新轮次
          await prisma.zjhGame.update({
            where: { id: gameId },
            data: { currentRound },
          });
        }
      }
    }

    if (gameOver && winnerId) {
      // 结算游戏
      await settleGameInDb(gameId, game.roomId, winnerId, newPot, game.currentRound);
    } else {
      // 更新游戏状态
      await prisma.zjhGame.update({
        where: { id: gameId },
        data: {
          pot: newPot,
          currentAnte: newAnte,
          currentTurn: nextTurn,
        },
      });
    }

    // 获取更新后的房间玩家信息
    const updatedRoomPlayer = await prisma.zjhRoomPlayer.findFirst({
      where: { roomId: game.roomId, userId, leftAt: null },
    });

    return NextResponse.json({
      success: true,
      data: {
        actionType,
        amount: betAmount,
        pot: newPot,
        currentAnte: newAnte,
        currentTurn: gameOver ? null : nextTurn,
        round: game.currentRound,
        playerStatus: newStatus,
        remainingChips: updatedRoomPlayer?.chips ?? 0,
        gameOver,
      },
    });
  } catch (error) {
    console.error('玩家操作失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
