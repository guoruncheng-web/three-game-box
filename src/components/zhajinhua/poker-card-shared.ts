/**
 * 扑克牌共享常量（供 flat / three 版本共用）
 */

import type { Card } from '@/types/zjh';

export const SUIT_CHAR: Record<Card['suit'], string> = {
  spade: '♠',
  heart: '♥',
  club: '♣',
  diamond: '♦',
};

export function isRedSuit(suit: Card['suit']) {
  return suit === 'heart' || suit === 'diamond';
}
