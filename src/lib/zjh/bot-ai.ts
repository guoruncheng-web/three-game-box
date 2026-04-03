/**
 * 炸金花机器人简单策略：基于牌型权重与随机性
 */

import { BET_MULTIPLIER, HAND_TYPE_WEIGHT } from '@/lib/zjh/constants';
import type { HandType } from '@/types/zjh';
import type { BettingActionType } from '@/lib/zjh/mutations/apply-betting-action';

export interface BotDecision {
  action: BettingActionType;
  amount?: number;
}

/**
 * @param handType 已看牌后的牌型
 * @param currentAnte 当前底注
 * @param currentChips 机器人剩余筹码
 * @param hasLooked 必须为 true 才会调用
 */
export function decideBotBetting(params: {
  handType: HandType;
  currentAnte: number;
  currentChips: number;
  hasLooked: boolean;
}): BotDecision {
  const { handType, currentAnte, currentChips, hasLooked } = params;
  if (!hasLooked) {
    return { action: 'CALL' };
  }

  const strength = HAND_TYPE_WEIGHT[handType];
  const minBet = currentAnte * 2;
  const maxBet = currentAnte * BET_MULTIPLIER.MAX_RAISE;
  const r = Math.random();

  /** 弱牌：偏高概率弃牌 */
  if (strength <= 2 && r < 0.32) {
    return { action: 'FOLD' };
  }

  /** 强牌：加注或全押 */
  if (strength >= 5) {
    if (r < 0.4 && currentChips >= minBet) {
      const amt = r < 0.2 ? maxBet : Math.min(maxBet, Math.max(minBet, Math.round((minBet + maxBet) / 2)));
      return { action: 'RAISE', amount: amt };
    }
    if (r < 0.12 && currentChips > 0) {
      return { action: 'ALL_IN' };
    }
  }

  if (strength >= 4 && r < 0.25 && currentChips >= minBet) {
    return {
      action: 'RAISE',
      amount: Math.min(maxBet, Math.max(minBet, minBet * 2)),
    };
  }

  const callCost = currentAnte * 2;
  if (currentChips < callCost) {
    if (currentChips <= 0) return { action: 'FOLD' };
    return { action: 'ALL_IN' };
  }

  return { action: 'CALL' };
}
