/**
 * 炸金花常量定义
 * 花色、点数、牌型等游戏核心常量
 */

import type { Suit, Rank, HandType } from '@/types/zjh';

/** 花色列表（从大到小：黑桃 > 红心 > 梅花 > 方块） */
export const SUITS: Suit[] = ['spade', 'heart', 'club', 'diamond'];

/** 花色权重映射（越大越好） */
export const SUIT_WEIGHT: Record<Suit, number> = {
  spade: 4,
  heart: 3,
  club: 2,
  diamond: 1,
};

/** 花色中文名称 */
export const SUIT_DISPLAY: Record<Suit, string> = {
  spade: '黑桃',
  heart: '红心',
  club: '梅花',
  diamond: '方块',
};

/** 所有点数（从大到小） */
export const RANKS: Rank[] = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

/** 点数权重映射（越大越好） */
export const RANK_WEIGHT: Record<Rank, number> = {
  'A': 14,
  'K': 13,
  'Q': 12,
  'J': 11,
  '10': 10,
  '9': 9,
  '8': 8,
  '7': 7,
  '6': 6,
  '5': 5,
  '4': 4,
  '3': 3,
  '2': 2,
};

/** 牌型权重（越大越好） */
export const HAND_TYPE_WEIGHT: Record<HandType, number> = {
  TRIPLE: 6,
  STRAIGHT_FLUSH: 5,
  FLUSH: 4,
  STRAIGHT: 3,
  PAIR: 2,
  HIGH_CARD: 1,
};

/** 牌型中文名称 */
export const HAND_TYPE_DISPLAY: Record<HandType, string> = {
  TRIPLE: '豹子',
  STRAIGHT_FLUSH: '顺金',
  FLUSH: '金花',
  STRAIGHT: '顺子',
  PAIR: '对子',
  HIGH_CARD: '散牌',
};

/** 每手牌的张数 */
export const HAND_SIZE = 3;

/** 一副牌的总张数（去除大小王） */
export const DECK_SIZE = 52;

/** 初始筹码 */
export const INITIAL_CHIPS = 10000;

/** 每日奖励筹码 */
export const DAILY_BONUS_CHIPS = 1000;

/** 默认房间配置 */
export const DEFAULT_ROOM_CONFIG = {
  minPlayers: 2,
  maxPlayers: 6,
  baseAnte: 10,
  maxRounds: 20,
  turnTimeout: 30,
  minChips: 100,
} as const;

/** 下注倍数限制 */
export const BET_MULTIPLIER = {
  /** 闷牌（未看牌）跟注倍数选项 */
  BLIND_CALL: [1, 2],
  /** 看牌后跟注倍数选项 */
  LOOKED_CALL: [2, 4],
  /** 比牌花费倍数（基于当前底注） */
  COMPARE_COST: 2,
  /** 最大加注倍数 */
  MAX_RAISE: 4,
} as const;
