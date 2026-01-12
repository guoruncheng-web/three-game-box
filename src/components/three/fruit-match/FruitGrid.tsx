/**
 * 2D 水果网格组件
 */

'use client';

import { useMemo } from 'react';
import { FruitCell } from './FruitCell';
import * as THREE from 'three';

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

interface FruitGridProps {
  grid: (FruitType | null)[][];
  selectedCell: { row: number; col: number } | null;
  matchedCells: Set<string>;
  swapAnimation: SwapAnimationState | null;
  onCellClick: (row: number, col: number) => void;
  onCellSwipe?: (row: number, col: number, direction: 'up' | 'down' | 'left' | 'right') => void;
  gridSize?: number;
}

const GRID_SIZE = 8;
const CELL_SPACING = 1.2;

export function FruitGrid({
  grid,
  selectedCell,
  matchedCells,
  swapAnimation,
  onCellClick,
  onCellSwipe,
  gridSize = GRID_SIZE,
}: FruitGridProps) {
  // 计算网格中心位置，使网格居中
  const offset = useMemo(() => {
    return ((gridSize - 1) * CELL_SPACING) / 2;
  }, [gridSize]);

  // 根据交换动画状态计算单元格的目标位置
  const getCellPosition = (rowIndex: number, colIndex: number): [number, number, number] => {
    let targetRow = rowIndex;
    let targetCol = colIndex;

    // 如果正在进行交换动画，交换两个单元格的目标位置
    if (swapAnimation) {
      const { cell1, cell2 } = swapAnimation;

      if (rowIndex === cell1.row && colIndex === cell1.col) {
        // 这是 cell1，移动到 cell2 的位置
        targetRow = cell2.row;
        targetCol = cell2.col;
      } else if (rowIndex === cell2.row && colIndex === cell2.col) {
        // 这是 cell2，移动到 cell1 的位置
        targetRow = cell1.row;
        targetCol = cell1.col;
      }
    }

    const x = targetCol * CELL_SPACING - offset;
    const y = -targetRow * CELL_SPACING + offset;
    const z = 0;

    return [x, y, z];
  };

  return (
    <group>
      {/* 渲染水果单元格 */}
      {grid.map((row, rowIndex) =>
        row.map((fruit, colIndex) => {
          if (fruit === null) return null;

          const position = getCellPosition(rowIndex, colIndex);
          const cellKey = `${rowIndex}-${colIndex}`;
          const isSelected =
            selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
          const isMatched = matchedCells.has(cellKey);

          return (
            <FruitCell
              key={`${rowIndex}-${colIndex}-${fruit}`}
              fruit={fruit}
              position={position}
              row={rowIndex}
              col={colIndex}
              isSelected={isSelected}
              isMatched={isMatched}
              onClick={() => onCellClick(rowIndex, colIndex)}
              onSwipe={
                onCellSwipe
                  ? (direction) => onCellSwipe(rowIndex, colIndex, direction)
                  : undefined
              }
            />
          );
        })
      )}
    </group>
  );
}
