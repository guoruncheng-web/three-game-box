/**
 * PokerCard 属性测试
 * 使用 fast-check 验证渲染完整性、颜色正确性和背面不泄露牌面
 */

import { render } from '@testing-library/react';
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

import { PokerCard, SUIT_CHAR } from '../poker-card';
import type { Card } from '@/types/zjh';

const suits = ['spade', 'heart', 'club', 'diamond'] as const;
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;

const cardArb = fc.record({
  suit: fc.constantFrom(...suits),
  rank: fc.constantFrom(...ranks),
}) as fc.Arbitrary<Card>;

describe('PokerCard', () => {
  /**
   * 属性 1：PokerCard 正面渲染完整性
   * 验证：需求 3.2、3.3
   */
  it('属性 1：正面渲染包含点数和花色符号', () => {
    fc.assert(
      fc.property(cardArb, (card) => {
        const { container } = render(<PokerCard card={card} />);
        const text = container.textContent ?? '';
        expect(text).toContain(card.rank);
        expect(text).toContain(SUIT_CHAR[card.suit]);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 2：PokerCard 红黑花色颜色正确性
   * 验证：需求 3.4
   */
  it('属性 2：红色花色使用 text-red-600，黑色花色使用 text-zinc-900', () => {
    fc.assert(
      fc.property(cardArb, (card) => {
        const { container } = render(<PokerCard card={card} />);
        const isRed = card.suit === 'heart' || card.suit === 'diamond';
        const colorClass = isRed ? 'text-red-600' : 'text-zinc-900';
        expect(container.querySelector(`.${colorClass}`)).toBeTruthy();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 3：PokerCard 背面不渲染点数
   * 验证：需求 3.6
   */
  it('属性 3：faceDown=true 时不渲染点数或花色符号', () => {
    fc.assert(
      fc.property(cardArb, (card) => {
        const { container } = render(<PokerCard faceDown card={card} />);
        const text = container.textContent ?? '';
        expect(text).not.toContain(card.rank);
        // 验证花色符号也不出现
        const suitChar = SUIT_CHAR[card.suit];
        expect(text).not.toContain(suitChar);
      }),
      { numRuns: 100 }
    );
  });

  it('属性 3：card=undefined 时不渲染点数或花色符号', () => {
    fc.assert(
      fc.property(cardArb, (card) => {
        const { container } = render(<PokerCard card={undefined} />);
        const text = container.textContent ?? '';
        expect(text).not.toContain(card.rank);
      }),
      { numRuns: 100 }
    );
  });
});
