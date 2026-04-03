/**
 * 下注阶段操作（跟注/加注/全押/弃牌），供 API 与机器人共用
 */

import { prisma } from '@/lib/prisma';
import { compareHands } from '@/lib/zjh/hand-evaluator';
import { BET_MULTIPLIER } from '@/lib/zjh/constants';
import { settleGameInDb } from '@/lib/zjh/settle';
import type { ZjhPlayerStatus } from '@prisma/client';
import type { Card } from '@/types/zjh';

function getNextActivePlayer(
  players: { userId: string; seatIndex: number; status: string }[],
  currentUserId: string
): string | null {
  const activePlayers = players.filter(
    (p) => p.status !== 'FOLDED' && p.status !== 'OUT' && p.status !== 'ALL_IN'
  );
  if (activePlayers.length === 0) return null;

  const currentIndex = activePlayers.findIndex((p) => p.userId === currentUserId);
  const nextIndex = (currentIndex + 1) % activePlayers.length;
  return activePlayers[nextIndex].userId;
}

export type BettingActionType = 'CALL' | 'RAISE' | 'ALL_IN' | 'FOLD';

export type ApplyBettingActionOk = {
  actionType: BettingActionType;
  amount: number;
  pot: number;
  currentAnte: number;
  currentTurn: string | null;
  round: number;
  playerStatus: string;
  remainingChips: number;
  gameOver: boolean;
};

export type ApplyBettingActionResult =
  | { ok: true; data: ApplyBettingActionOk }
  | { ok: false; error: string };

export async function applyBettingAction(
  userId: string,
  gameId: string,
  actionType: BettingActionType,
  amount?: number
): Promise<ApplyBettingActionResult> {
  const game = await prisma.zjhGame.findUnique({
    where: { id: gameId },
    include: {
      players: { orderBy: { seatIndex: 'asc' } },
    },
  });

  if (!game) {
    return { ok: false, error: '游戏不存在' };
  }

  if (game.status !== 'BETTING') {
    return { ok: false, error: '游戏不在下注阶段' };
  }

  if (game.currentTurn !== userId) {
    return { ok: false, error: '不是你的回合' };
  }

  const player = game.players.find((p) => p.userId === userId);
  if (!player) {
    return { ok: false, error: '你不在该游戏中' };
  }

  if (player.status === 'FOLDED' || player.status === 'OUT') {
    return { ok: false, error: '你已退出本局' };
  }

  let betAmount = 0;
  let newStatus: string = player.status;
  let newAnte = game.currentAnte;

  const roomPlayer = await prisma.zjhRoomPlayer.findFirst({
    where: { roomId: game.roomId, userId, leftAt: null },
  });
  const currentChips = roomPlayer ? roomPlayer.chips : player.chipsBeforeGame - player.totalBet;

  switch (actionType) {
    case 'CALL': {
      betAmount = player.hasLooked ? game.currentAnte * 2 : game.currentAnte;
      if (currentChips < betAmount) {
        return { ok: false, error: '筹码不足' };
      }
      break;
    }

    case 'RAISE': {
      if (amount == null) {
        return { ok: false, error: '加注必须指定金额' };
      }
      const minBet = player.hasLooked ? game.currentAnte * 2 : game.currentAnte;
      const maxBet = game.currentAnte * BET_MULTIPLIER.MAX_RAISE;
      if (amount < minBet || amount > maxBet) {
        return { ok: false, error: `加注金额必须在 ${minBet} - ${maxBet} 之间` };
      }
      if (currentChips < amount) {
        return { ok: false, error: '筹码不足' };
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
      return { ok: false, error: '无效操作类型' };
  }

  const newPot = game.pot + betAmount;
  const newTotalBet = player.totalBet + betAmount;

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

  await prisma.zjhGamePlayer.update({
    where: { id: player.id },
    data: {
      status: newStatus as ZjhPlayerStatus,
      totalBet: newTotalBet,
    },
  });

  if (betAmount > 0) {
    await prisma.zjhRoomPlayer.updateMany({
      where: { roomId: game.roomId, userId, leftAt: null },
      data: { chips: { decrement: betAmount } },
    });
  }

  const updatedPlayers = await prisma.zjhGamePlayer.findMany({
    where: { gameId },
    orderBy: { seatIndex: 'asc' },
  });

  const activePlayers = updatedPlayers.filter(
    (p) => p.status !== 'FOLDED' && p.status !== 'OUT'
  );

  let gameOver = false;
  let winnerId: string | undefined;

  if (activePlayers.length === 1) {
    gameOver = true;
    winnerId = activePlayers[0].userId;
  }

  const newRound = game.currentRound;
  if (!gameOver && newRound >= game.currentRound) {
    const playableCount = activePlayers.filter((p) => p.status !== 'ALL_IN').length;
    if (playableCount <= 1 && activePlayers.length > 1) {
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
    }
  }

  let nextTurn: string | null = null;
  if (!gameOver) {
    nextTurn = getNextActivePlayer(
      updatedPlayers.map((p) => ({
        userId: p.userId,
        seatIndex: p.seatIndex,
        status: p.status,
      })),
      userId
    );

    let currentRound = game.currentRound;
    const currentSeat = player.seatIndex;
    const nextPlayer = updatedPlayers.find((p) => p.userId === nextTurn);
    if (nextPlayer && nextPlayer.seatIndex <= currentSeat) {
      currentRound++;
    }

    if (currentRound > game.currentRound) {
      const room = await prisma.zjhRoom.findUnique({ where: { id: game.roomId } });
      if (room && currentRound > room.maxRounds) {
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
        await prisma.zjhGame.update({
          where: { id: gameId },
          data: { currentRound },
        });
      }
    }
  }

  if (gameOver && winnerId) {
    await settleGameInDb(gameId, game.roomId, winnerId, newPot, game.currentRound);
  } else {
    await prisma.zjhGame.update({
      where: { id: gameId },
      data: {
        pot: newPot,
        currentAnte: newAnte,
        currentTurn: nextTurn,
      },
    });
  }

  const updatedRoomPlayer = await prisma.zjhRoomPlayer.findFirst({
    where: { roomId: game.roomId, userId, leftAt: null },
  });

  return {
    ok: true,
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
  };
}
