/**
 * 2D Canvas 包装组件
 * 使用正交相机实现 2D 消消乐效果
 */

'use client';

import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { GameScene } from './GameScene';

type FruitType = '🍇' | '🍋' | '🍉' | '🍊' | '🍎' | '🍒' | '🍓';

interface FruitMatchCanvasProps {
  grid: (FruitType | null)[][];
  selectedCell: { row: number; col: number } | null;
  matchedCells: Set<string>;
  onCellClick: (row: number, col: number) => void;
}

export function FruitMatchCanvas({
  grid,
  selectedCell,
  matchedCells,
  onCellClick,
}: FruitMatchCanvasProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <Canvas
      orthographic
      camera={{
        position: [0, 0, 10],
        zoom: 50,
        near: 0.1,
        far: 1000,
      }}
      gl={{
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
      }}
      dpr={[1, 2]}
      style={{
        background: 'transparent',
        width: '100%',
        height: '100%',
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0); // 完全透明
        console.log('Canvas 已创建');
      }}
      onPointerMissed={() => {
        console.log('点击未命中任何物体');
      }}
    >
      <GameScene
        grid={grid}
        selectedCell={selectedCell}
        matchedCells={matchedCells}
        onCellClick={onCellClick}
      />
    </Canvas>
  );
}
