/**
 * 2D 游戏场景组件
 * 使用正交相机实现 2D 消消乐效果
 */

'use client';

import { Suspense } from 'react';
import { FruitGrid } from './FruitGrid';
import { FruitBackground } from './FruitBackground';

type FruitType = '🍇' | '🍋' | '🍉' | '🍊' | '🍎' | '🍒' | '🍓';

interface GameSceneProps {
  grid: (FruitType | null)[][];
  selectedCell: { row: number; col: number } | null;
  matchedCells: Set<string>;
  onCellClick: (row: number, col: number) => void;
}

export function GameScene({
  grid,
  selectedCell,
  matchedCells,
  onCellClick,
}: GameSceneProps) {
  return (
    <Suspense fallback={null}>
      {/* 背景面板 */}
      <FruitBackground />

      {/* 简单环境光 - 2D 不需要复杂光照 */}
      <ambientLight intensity={1} />

      {/* 水果网格 */}
      <FruitGrid
        grid={grid}
        selectedCell={selectedCell}
        matchedCells={matchedCells}
        onCellClick={onCellClick}
      />
    </Suspense>
  );
}
