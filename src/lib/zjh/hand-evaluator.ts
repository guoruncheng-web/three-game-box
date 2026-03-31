/**
 * 牌型判定和比较
 * 6 种牌型判定、235 通杀、花色比较
 */

import type { Card, HandType, HandEvaluation } from '@/types/zjh';
import { RANK_WEIGHT, SUIT_WEIGHT, HAND_TYPE_WEIGHT } from './constants';

/**
 * 获取牌的点数权重
 */
function getRankWeight(card: Card): number {
  return RANK_WEIGHT[card.rank];
}

/**
 * 获取牌的花色权重
 */
function getSuitWeight(card: Card): number {
  return SUIT_WEIGHT[card.suit];
}

/**
 * 将手牌按点数从大到小排序，点数相同按花色排序
 */
function sortCards(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => {
    const rankDiff = getRankWeight(b) - getRankWeight(a);
    if (rankDiff !== 0) return rankDiff;
    return getSuitWeight(b) - getSuitWeight(a);
  });
}

/**
 * 检查三张牌是否为同花（花色相同）
 */
function isFlush(cards: Card[]): boolean {
  return cards[0].suit === cards[1].suit && cards[1].suit === cards[2].suit;
}

/**
 * 检查三张牌是否为顺子（点数连续）
 * 特殊规则：A-2-3 是最小顺子，Q-K-A 是最大顺子，K-A-2 不算顺子
 */
function isStraight(cards: Card[]): boolean {
  const sorted = sortCards(cards);
  const weights = sorted.map(getRankWeight);

  // 普通顺子：相邻差值都是 1
  if (weights[0] - weights[1] === 1 && weights[1] - weights[2] === 1) {
    return true;
  }

  // 特殊顺子：A-2-3（权重为 14, 3, 2）
  if (weights[0] === 14 && weights[1] === 3 && weights[2] === 2) {
    return true;
  }

  return false;
}

/**
 * 检查三张牌是否为豹子（三条，三张点数相同）
 */
function isTriple(cards: Card[]): boolean {
  return cards[0].rank === cards[1].rank && cards[1].rank === cards[2].rank;
}

/**
 * 检查是否有对子，返回对子点数权重和单牌权重
 * 返回 null 表示没有对子
 */
function getPairInfo(cards: Card[]): { pairWeight: number; pairMaxSuit: number; singleWeight: number; singleSuit: number } | null {
  const sorted = sortCards(cards);

  // 情况 1: 前两张是对子
  if (sorted[0].rank === sorted[1].rank) {
    return {
      pairWeight: getRankWeight(sorted[0]),
      pairMaxSuit: Math.max(getSuitWeight(sorted[0]), getSuitWeight(sorted[1])),
      singleWeight: getRankWeight(sorted[2]),
      singleSuit: getSuitWeight(sorted[2]),
    };
  }

  // 情况 2: 后两张是对子
  if (sorted[1].rank === sorted[2].rank) {
    return {
      pairWeight: getRankWeight(sorted[1]),
      pairMaxSuit: Math.max(getSuitWeight(sorted[1]), getSuitWeight(sorted[2])),
      singleWeight: getRankWeight(sorted[0]),
      singleSuit: getSuitWeight(sorted[0]),
    };
  }

  return null;
}

/**
 * 检查是否为 235 特殊散牌（不同花色的 2-3-5）
 * 235 散牌可以通杀豹子
 */
function is235(cards: Card[]): boolean {
  const ranks = cards.map(c => c.rank).sort();
  const isRank235 = ranks[0] === '2' && ranks[1] === '3' && ranks[2] === '5';
  // 必须不同花色（不能是同花）
  return isRank235 && !isFlush(cards);
}

/**
 * 计算手牌排名值（handRank）
 * 排名值越大表示牌越大，可直接用于数值比较
 *
 * 编码规则：
 * - 牌型权重 * 10^8
 * - 主要比较值 * 10^4 ~ 10^6
 * - 次要比较值 * 10^0 ~ 10^4
 *
 * 特殊：235 散牌标记为负值（在 compareHands 中特殊处理）
 */
function calculateHandRank(handType: HandType, cards: Card[]): number {
  const sorted = sortCards(cards);
  const typeWeight = HAND_TYPE_WEIGHT[handType];
  const base = typeWeight * 100000000; // 牌型基础分

  switch (handType) {
    case 'TRIPLE': {
      // 豹子：比较点数，再比最大花色
      const rankW = getRankWeight(sorted[0]);
      const suitW = Math.max(...sorted.map(getSuitWeight));
      return base + rankW * 10000 + suitW;
    }

    case 'STRAIGHT_FLUSH':
    case 'STRAIGHT': {
      // 顺金/顺子：比较最大牌点数
      // 特殊处理 A-2-3 顺子（A 当最小）
      const weights = sorted.map(getRankWeight);
      let maxRank: number;
      if (weights[0] === 14 && weights[1] === 3 && weights[2] === 2) {
        // A-2-3 顺子，最大牌是 3
        maxRank = 3;
      } else {
        maxRank = weights[0];
      }
      // 花色比较：用最大牌的花色
      const suitW = getSuitWeight(sorted[0]);
      return base + maxRank * 10000 + suitW;
    }

    case 'FLUSH':
    case 'HIGH_CARD': {
      // 金花/散牌：依次比较最大、第二大、最小牌
      const w0 = getRankWeight(sorted[0]);
      const w1 = getRankWeight(sorted[1]);
      const w2 = getRankWeight(sorted[2]);
      const s0 = getSuitWeight(sorted[0]);
      return base + w0 * 1000000 + w1 * 10000 + w2 * 100 + s0;
    }

    case 'PAIR': {
      // 对子：先比对子点数，再比单牌
      const pairInfo = getPairInfo(sorted);
      if (!pairInfo) return base;
      return base + pairInfo.pairWeight * 1000000 + pairInfo.pairMaxSuit * 10000 + pairInfo.singleWeight * 100 + pairInfo.singleSuit;
    }

    default:
      return base;
  }
}

/**
 * 评估手牌牌型
 * @param cards 三张手牌
 * @returns 牌型评估结果
 */
export function evaluateHand(cards: Card[]): HandEvaluation {
  if (cards.length !== 3) {
    throw new Error(`手牌必须为 3 张，当前 ${cards.length} 张`);
  }

  const sorted = sortCards(cards);
  let handType: HandType;

  if (isTriple(sorted)) {
    handType = 'TRIPLE';
  } else if (isFlush(sorted) && isStraight(sorted)) {
    handType = 'STRAIGHT_FLUSH';
  } else if (isFlush(sorted)) {
    handType = 'FLUSH';
  } else if (isStraight(sorted)) {
    handType = 'STRAIGHT';
  } else if (getPairInfo(sorted) !== null) {
    handType = 'PAIR';
  } else {
    handType = 'HIGH_CARD';
  }

  const handRank = calculateHandRank(handType, sorted);

  return {
    handType,
    handRank,
    cards: sorted,
  };
}

/**
 * 比较两手牌的大小
 * @returns 正数表示 hand1 赢，负数表示 hand2 赢，0 表示平局
 */
export function compareHands(hand1: Card[], hand2: Card[]): number {
  const eval1 = evaluateHand(hand1);
  const eval2 = evaluateHand(hand2);

  // 特殊规则：235 通杀豹子
  const hand1Is235 = is235(hand1);
  const hand2Is235 = is235(hand2);

  // 235 vs 豹子：235 赢
  if (hand1Is235 && eval2.handType === 'TRIPLE') {
    return 1;
  }
  if (hand2Is235 && eval1.handType === 'TRIPLE') {
    return -1;
  }

  // 双方都是 235 的情况：按散牌规则比较（花色）
  // 其他情况：按正常 handRank 比较
  return eval1.handRank - eval2.handRank;
}
