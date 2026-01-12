/**
 * 2D 水果网格组件
 */

'use client';

import { useMemo } from 'react';
import { FruitCell } from './FruitCell';
import * as THREE from 'three';

type FruitType = '🍇' | '🍋' | '🍉' | '🍊' | '🍎' | '🍒' | '🍓';

interface FruitGridProps {
  grid: (FruitType | null)[][];
  selectedCell: { row: number; col: number } | null;
  matchedCells: Set<string>;
  onCellClick: (row: number, col: number) => void;
  gridSize?: number;
}

const GRID_SIZE = 8;
const CELL_SPACING = 1.2;

export function FruitGrid({
  grid,
  selectedCell,
  matchedCells,
  onCellClick,
  gridSize = GRID_SIZE,
}: FruitGridProps) {
  // 计算网格中心位置，使网格居中
  const offset = useMemo(() => {
    return ((gridSize - 1) * CELL_SPACING) / 2;
  }, [gridSize]);

  return (
    <group>
      {/* 网格背景板 */}
      <mesh position={[0, 0, -0.5]}>
        <planeGeometry args={[gridSize * CELL_SPACING + 0.5, gridSize * CELL_SPACING + 0.5]} />
        <meshBasicMaterial
          color="#f8f9fa"
          side={THREE.DoubleSide}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* 渲染水果单元格 */}
      {grid.map((row, rowIndex) =>
        row.map((fruit, colIndex) => {
          if (fruit === null) return null;

          const x = colIndex * CELL_SPACING - offset;
          const y = -rowIndex * CELL_SPACING + offset;
          const z = 0;

          const cellKey = `${rowIndex}-${colIndex}`;
          const isSelected =
            selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
          const isMatched = matchedCells.has(cellKey);

          return (
            <FruitCell
              key={`${rowIndex}-${colIndex}-${fruit}`}
              fruit={fruit}
              position={[x, y, z]}
              isSelected={isSelected}
              isMatched={isMatched}
              onClick={() => onCellClick(rowIndex, colIndex)}
            />
          );
        })
      )}
    </group>
  );
}
