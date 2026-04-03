/**
 * 执行机器人一回合：看牌（若未看）→ 决策 → 下注操作
 */

import { prisma } from '@/lib/prisma';
import { ZJH_BOT_USER_ID } from '@/lib/zjh/bot-constants';
import { applyLook } from '@/lib/zjh/mutations/apply-look';
import { applyBettingAction } from '@/lib/zjh/mutations/apply-betting-action';
import { decideBotBetting } from '@/lib/zjh/bot-ai';
import type { HandType } from '@/types/zjh';

/**
 * @param humanUserId 触发者（真实玩家），须在本局游戏中且非机器人
 */
export async function runZjhBotStep(
  gameId: string,
  humanUserId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (humanUserId === ZJH_BOT_USER_ID) {
    return { ok: false, error: '无效请求' };
  }

  const game = await prisma.zjhGame.findUnique({
    where: { id: gameId },
    include: {
      room: true,
      players: { orderBy: { seatIndex: 'asc' } },
    },
  });

  if (!game) {
    return { ok: false, error: '游戏不存在' };
  }

  if (game.status !== 'BETTING') {
    return { ok: false, error: '游戏不在下注阶段' };
  }

  if (game.currentTurn !== ZJH_BOT_USER_ID) {
    return { ok: false, error: '不是机器人回合' };
  }

  if (!game.players.some((p) => p.userId === humanUserId)) {
    return { ok: false, error: '你不在该对局中' };
  }

  if (!game.players.some((p) => p.userId === ZJH_BOT_USER_ID)) {
    return { ok: false, error: '本局无人机' };
  }

  const initialBot = game.players.find((p) => p.userId === ZJH_BOT_USER_ID);
  if (!initialBot) {
    return { ok: false, error: '机器人未参与' };
  }

  if (!initialBot.hasLooked) {
    const look = await applyLook(ZJH_BOT_USER_ID, gameId);
    if (!look.ok) {
      return { ok: false, error: look.error };
    }
  }

  const botPlayer = await prisma.zjhGamePlayer.findFirst({
    where: { gameId, userId: ZJH_BOT_USER_ID },
  });
  if (!botPlayer) {
    return { ok: false, error: '机器人数据异常' };
  }

  const gameFresh = await prisma.zjhGame.findUnique({ where: { id: gameId } });
  if (!gameFresh || gameFresh.currentTurn !== ZJH_BOT_USER_ID) {
    return { ok: false, error: '回合已变更' };
  }

  const roomPlayer = await prisma.zjhRoomPlayer.findFirst({
    where: { roomId: game.roomId, userId: ZJH_BOT_USER_ID, leftAt: null },
  });
  const currentChips = roomPlayer?.chips ?? 0;
  const handType = botPlayer.handType as HandType;

  const decision = decideBotBetting({
    handType,
    currentAnte: gameFresh.currentAnte,
    currentChips,
    hasLooked: true,
  });

  const callCost = botPlayer.hasLooked ? gameFresh.currentAnte * 2 : gameFresh.currentAnte;

  let finalDecision = decision;
  if (decision.action === 'CALL' && currentChips < callCost && currentChips > 0) {
    finalDecision = { action: 'ALL_IN' };
  }
  if (decision.action === 'CALL' && currentChips <= 0) {
    finalDecision = { action: 'FOLD' };
  }

  let bet = await applyBettingAction(
    ZJH_BOT_USER_ID,
    gameId,
    finalDecision.action,
    finalDecision.amount
  );

  if (bet.ok) {
    return { ok: true };
  }

  bet = await applyBettingAction(ZJH_BOT_USER_ID, gameId, 'CALL');
  if (bet.ok) {
    return { ok: true };
  }

  const fold = await applyBettingAction(ZJH_BOT_USER_ID, gameId, 'FOLD');
  if (fold.ok) {
    return { ok: true };
  }

  return { ok: false, error: '机器人操作失败' };
}
