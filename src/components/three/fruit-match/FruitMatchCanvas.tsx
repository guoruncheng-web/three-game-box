/**
 * 2D Canvas 包装组件
 * 使用正交相机实现 2D 消消乐效果，自动适配容器尺寸
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GameScene } from './GameScene';

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

interface FruitMatchCanvasProps {
  grid: (FruitType | null)[][];
  selectedCell: { row: number; col: number } | null;
  matchedCells: Set<string>;
  swapAnimation: SwapAnimationState | null;
  onCellClick: (row: number, col: number) => void;
  onCellSwipe?: (row: number, col: number, direction: 'up' | 'down' | 'left' | 'right') => void;
}

const GRID_SIZE = 8;
const CELL_SPACING = 1.2;
const FRUIT_RADIUS = 0.45;
const GRID_WORLD_SIZE = (GRID_SIZE - 1) * CELL_SPACING + FRUIT_RADIUS * 2;

export function FruitMatchCanvas({
  grid,
  selectedCell,
  matchedCells,
  swapAnimation,
  onCellClick,
  onCellSwipe,
}: FruitMatchCanvasProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [zoom, setZoom] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const calcZoom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { clientWidth, clientHeight } = el;
    const padding = 0.6;
    const neededW = GRID_WORLD_SIZE + padding;
    const neededH = GRID_WORLD_SIZE + padding;
    const zoomByW = clientWidth / neededW;
    const zoomByH = clientHeight / neededH;
    setZoom(Math.min(zoomByW, zoomByH));
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    calcZoom();
    const ro = new ResizeObserver(calcZoom);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [calcZoom]);

  if (!isMounted) {
    return (
      <div ref={containerRef} className="w-full h-full flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <Canvas
        orthographic
        camera={{
          position: [0, 0, 10],
          zoom,
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
          gl.setClearColor(0x000000, 0);
        }}
      >
        <CameraZoomUpdater zoom={zoom} />
        <GameScene
          grid={grid}
          selectedCell={selectedCell}
          matchedCells={matchedCells}
          swapAnimation={swapAnimation}
          onCellClick={onCellClick}
          onCellSwipe={onCellSwipe}
        />
      </Canvas>
    </div>
  );
}

/** 在 Canvas 内部同步更新正交相机 zoom */
function CameraZoomUpdater({ zoom }: { zoom: number }) {
  const camera = useThree((state) => state.camera) as THREE.OrthographicCamera;

  useEffect(() => {
    camera.zoom = zoom;
    camera.updateProjectionMatrix();
  }, [zoom, camera]);

  return null;
}
