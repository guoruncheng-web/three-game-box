/**
 * 游戏结算逻辑（共享模块）
 * 从 action 和 compare 路由中提取的公共结算函数
 */

import { prisma } from '@/lib/prisma';
import { evaluateHand } from './hand-evaluator';
import type { Card, HandType } from '@/types/zjh';

/**
 * 结算游戏，更新数据库
 * 包含：更新游戏状态、计算筹码变化、更新玩家战绩
 *
 * @param gameId 游戏 ID
 * @param roomId 房间 ID
 * @param winnerId 获胜者 ID
 * @param pot 当前奖池
 * @param currentRound 当前轮次
 */
export async function settleGameInDb(
  gameId: string,
  roomId: string,
  winnerId: string,
  pot: number,
  currentRound: number
) {
  // 获取所有游戏玩家
  const gamePlayers = await prisma.zjhGamePlayer.findMany({
    where: { gameId },
  });

  const winner = gamePlayers.find(p => p.userId === winnerId);
  if (!winner) return;

  const winnerEval = evaluateHand(winner.hand as unknown as Card[]);

  // 更新游戏状态为结算
  await prisma.zjhGame.update({
    where: { id: gameId },
    data: {
      status: 'SETTLEMENT',
      winnerId,
      winnerHand: winnerEval.handType,
      currentRound,
      endedAt: new Date(),
    },
  });

  // 更新每个玩家的筹码变化
  for (const gp of gamePlayers) {
    const isWinner = gp.userId === winnerId;
    const chipsChange = isWinner ? pot - gp.totalBet : -gp.totalBet;
    const evaluation = evaluateHand(gp.hand as unknown as Card[]);
    const finalChips = gp.chipsBeforeGame + chipsChange;

    await prisma.zjhGamePlayer.update({
      where: { id: gp.id },
      data: {
        isWinner,
        chipsChange,
        handType: evaluation.handType,
        handRank: evaluation.handRank,
      },
    });

    // 更新房间玩家筹码
    await prisma.zjhRoomPlayer.updateMany({
      where: { roomId, userId: gp.userId, leftAt: null },
      data: { chips: Math.max(0, finalChips) },
    });

    // 更新玩家战绩
    const handType = evaluation.handType as HandType;
    const handCountField = {
      TRIPLE: 'tripleCount',
      STRAIGHT_FLUSH: 'straightFlushCount',
      FLUSH: 'flushCount',
      STRAIGHT: 'straightCount',
      PAIR: 'pairCount',
      HIGH_CARD: 'highCardCount',
    }[handType] as string;

    // 先读取现有战绩，正确比较 maxSingleWin
    const existingStats = await prisma.zjhPlayerStats.findUnique({
      where: { userId: gp.userId },
    });

    const currentMaxWin = existingStats?.maxSingleWin ?? 0;
    const newMaxWin = isWinner
      ? Math.max(currentMaxWin, Math.max(0, chipsChange))
      : currentMaxWin;

    await prisma.zjhPlayerStats.upsert({
      where: { userId: gp.userId },
      create: {
        userId: gp.userId,
        totalGames: 1,
        totalWins: isWinner ? 1 : 0,
        totalChipsWon: isWinner ? Math.max(0, chipsChange) : 0,
        totalChipsLost: !isWinner ? Math.abs(chipsChange) : 0,
        maxSingleWin: isWinner ? Math.max(0, chipsChange) : 0,
        currentChips: Math.max(0, finalChips),
        [handCountField]: 1,
      },
      update: {
        totalGames: { increment: 1 },
        totalWins: isWinner ? { increment: 1 } : undefined,
        totalChipsWon: isWinner ? { increment: Math.max(0, chipsChange) } : undefined,
        totalChipsLost: !isWinner ? { increment: Math.abs(chipsChange) } : undefined,
        maxSingleWin: newMaxWin,
        currentChips: Math.max(0, finalChips),
        [handCountField]: { increment: 1 },
      },
    });
  }

  // 更新房间状态为等待
  await prisma.zjhRoom.update({
    where: { id: roomId },
    data: { status: 'WAITING' },
  });
}
