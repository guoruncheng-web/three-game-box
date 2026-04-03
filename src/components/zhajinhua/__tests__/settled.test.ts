import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

/**
 * 结算胜负图标逻辑
 * 与 zhajinhua-app.tsx 中的内联逻辑保持一致
 */
function getResultIcon(winnerId: string | null | undefined, userId: string): string {
  const isDraw = !winnerId;
  const isWinner = winnerId === userId;
  if (isDraw) return '🤝';
  if (isWinner) return '🏆';
  return '💔';
}

describe('结算胜负图标逻辑', () => {
  /**
   * 属性 5：结算胜负图标一致性
   * 验证：需求 6.2
   */
  it('属性 5：三种情况互斥且完备', () => {
    fc.assert(
      fc.property(
        fc.option(fc.string({ minLength: 1 }), { nil: null }),
        fc.string({ minLength: 1 }),
        (winnerId, userId) => {
          const icon = getResultIcon(winnerId, userId);
          if (!winnerId) {
            expect(icon).toBe('🤝');
          } else if (winnerId === userId) {
            expect(icon).toBe('🏆');
          } else {
            expect(icon).toBe('💔');
          }
          // 验证只返回三种值之一
          expect(['🏆', '💔', '🤝']).toContain(icon);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('winnerId 为 null 时返回 🤝', () => {
    expect(getResultIcon(null, 'user1')).toBe('🤝');
  });

  it('winnerId 等于 userId 时返回 🏆', () => {
    expect(getResultIcon('user1', 'user1')).toBe('🏆');
  });

  it('winnerId 不等于 userId 时返回 💔', () => {
    expect(getResultIcon('user2', 'user1')).toBe('💔');
  });
});
