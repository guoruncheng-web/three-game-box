/**
 * 牌组管理
 * Fisher-Yates 洗牌算法、发牌逻辑
 */

import { randomInt } from 'crypto';
import type { Card, Suit, Rank } from '@/types/zjh';
import { SUITS, RANKS, HAND_SIZE } from './constants';

/**
 * 创建一副完整的 52 张扑克牌（去除大小王）
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit: suit as Suit, rank: rank as Rank });
    }
  }
  return deck;
}

/**
 * Fisher-Yates 洗牌算法
 * 使用加密安全的随机数生成器（crypto.randomInt）
 * 原地打乱牌组顺序，保证每种排列等概率
 * @param deck 牌组（会被原地修改）
 * @returns 打乱后的牌组
 */
export function shuffle(deck: Card[]): Card[] {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/**
 * 创建并洗好一副牌
 */
export function createShuffledDeck(): Card[] {
  return shuffle(createDeck());
}

/**
 * 发牌
 * 从牌组顶部给指定数量的玩家各发 HAND_SIZE 张牌
 * @param deck 洗好的牌组
 * @param playerCount 玩家数量
 * @returns 每个玩家的手牌数组
 */
export function dealCards(deck: Card[], playerCount: number): Card[][] {
  if (deck.length < playerCount * HAND_SIZE) {
    throw new Error(`牌组数量不足，需要 ${playerCount * HAND_SIZE} 张，但只有 ${deck.length} 张`);
  }

  const hands: Card[][] = [];
  for (let i = 0; i < playerCount; i++) {
    hands.push([]);
  }

  // 模拟真实发牌方式：每轮给每个玩家发一张
  for (let round = 0; round < HAND_SIZE; round++) {
    for (let player = 0; player < playerCount; player++) {
      const card = deck.shift();
      if (card) {
        hands[player].push(card);
      }
    }
  }

  return hands;
}
