/**
 * 看牌逻辑（供 API 与机器人共用）
 */

import { prisma } from '@/lib/prisma';
import { evaluateHand } from '@/lib/zjh/hand-evaluator';
import { HAND_TYPE_DISPLAY } from '@/lib/zjh/constants';
import type { Card, HandType } from '@/types/zjh';

export type ApplyLookResult =
  | { ok: true; hand: Card[]; handType: HandType; handTypeDisplay: string }
  | { ok: false; error: string };

export async function applyLook(userId: string, gameId: string): Promise<ApplyLookResult> {
  const gamePlayer = await prisma.zjhGamePlayer.findFirst({
    where: { gameId, userId },
    include: { game: true },
  });

  if (!gamePlayer) {
    return { ok: false, error: '你不在该游戏中' };
  }

  if (gamePlayer.game.status !== 'BETTING') {
    return { ok: false, error: '游戏不在下注阶段' };
  }

  if (gamePlayer.status === 'FOLDED' || gamePlayer.status === 'OUT') {
    return { ok: false, error: '你已退出本局' };
  }

  const hand = gamePlayer.hand as unknown as Card[];
  const evaluation = evaluateHand(hand);

  if (gamePlayer.hasLooked) {
    const handType = gamePlayer.handType as HandType;
    return {
      ok: true,
      hand,
      handType,
      handTypeDisplay: HAND_TYPE_DISPLAY[handType],
    };
  }

  await prisma.zjhGamePlayer.update({
    where: { id: gamePlayer.id },
    data: {
      hasLooked: true,
      status: 'LOOKED',
      handType: evaluation.handType,
      handRank: evaluation.handRank,
    },
  });

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

  return {
    ok: true,
    hand,
    handType: evaluation.handType,
    handTypeDisplay: HAND_TYPE_DISPLAY[evaluation.handType],
  };
}
