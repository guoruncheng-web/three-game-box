/**
 * 2D 游戏场景组件
 * 使用正交相机实现 2D 消消乐效果
 */

'use client';

import { Suspense } from 'react';
import { FruitGrid } from './FruitGrid';

// 普通水果类型
type NormalFruitType = '🍇' | '🍋' | '🍉' | '🍊' | '🍎' | '🍒' | '🍓';

// 特殊水果类型
type SpecialFruitType = '💣' | '🌈' | '🎃';

// 所有水果类型
type FruitType = NormalFruitType | SpecialFruitType;

interface SwapAnimationState {
  cell1: { row: number; col: number };
  cell2: { row: number; col: number };
}

interface GameSceneProps {
  grid: (FruitType | null)[][];
  selectedCell: { row: number; col: number } | null;
  matchedCells: Set<string>;
  swapAnimation: SwapAnimationState | null;
  onCellClick: (row: number, col: number) => void;
  onCellSwipe?: (row: number, col: number, direction: 'up' | 'down' | 'left' | 'right') => void;
}

export function GameScene({
  grid,
  selectedCell,
  matchedCells,
  swapAnimation,
  onCellClick,
  onCellSwipe,
}: GameSceneProps) {
  return (
    <Suspense fallback={null}>
      {/* 水果网格 */}
      <FruitGrid
        grid={grid}
        selectedCell={selectedCell}
        matchedCells={matchedCells}
        swapAnimation={swapAnimation}
        onCellClick={onCellClick}
        onCellSwipe={onCellSwipe}
      />
    </Suspense>
  );
}
