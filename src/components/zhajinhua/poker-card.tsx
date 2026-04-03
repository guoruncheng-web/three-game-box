/**
 * 单张扑克展示：默认 Three.js 光照层次；测试环境使用纯 DOM（poker-card-flat）
 */

import { PokerCardFlat } from './poker-card-flat';
import type { PokerCardFlatProps } from './poker-card-flat';
import { PokerCardThree } from './poker-card-three';

export { isRedSuit, SUIT_CHAR } from './poker-card-shared';
export type { PokerCardFlatProps as PokerCardProps };

/** Vitest 注入；Next/Webpack 浏览器包无 import.meta.env，勿用 import.meta.env.VITEST */
function isVitestEnv(): boolean {
  return typeof process !== 'undefined' && process.env.VITEST === 'true';
}

export function PokerCard(props: PokerCardFlatProps) {
  if (isVitestEnv()) {
    return <PokerCardFlat {...props} />;
  }
  return <PokerCardThree {...props} />;
}
