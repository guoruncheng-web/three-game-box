/**
 * 2D 水果单元格组件
 * 使用图片纹理替代 emoji
 */

'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type FruitType = '🍇' | '🍋' | '🍉' | '🍊' | '🍎' | '🍒' | '🍓';

interface FruitCellProps {
  fruit: FruitType;
  position: [number, number, number];
  row: number;
  col: number;
  isSelected: boolean;
  isMatched: boolean;
  onClick: () => void;
  scale?: number;
}

// 水果类型到图片路径的映射
const fruitImages: Record<FruitType, string> = {
  '🍇': '/images/generated/fruid/Grape.png',
  '🍋': '/images/generated/fruid/lemon.png',
  '🍉': '/images/generated/fruid/Watermelon.png',
  '🍊': '/images/generated/fruid/Orange.png',
  '🍎': '/images/generated/fruid/RainbowCandy.png',
  '🍒': '/images/generated/fruid/VerticalStriped.png',
  '🍓': '/images/generated/fruid/Strawberry.png',
};

export function FruitCell({
  fruit,
  position,
  row,
  col,
  isSelected,
  isMatched,
  onClick,
  scale = 1,
}: FruitCellProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bgRef = useRef<THREE.Mesh>(null);
  const [fruitTexture, setFruitTexture] = useState<THREE.Texture | null>(null);

  // 掉落动画状态 - 基于行列计算延迟
  const dropDelay = useMemo(() => row * 0.05 + col * 0.02, [row, col]);
  const dropAnimationRef = useRef({
    isDropping: false, // 初始为 false，等待延迟后开始
    hasStarted: false,
    startTime: 0
  });
  const currentPositionRef = useRef(new THREE.Vector3(position[0], position[1] + 12, position[2]));
  const targetPositionRef = useRef(new THREE.Vector3(...position));

  // 加载水果图片纹理
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      fruitImages[fruit],
      (texture) => {
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.needsUpdate = true;
        setFruitTexture(texture);
        console.log(`✓ 水果图片加载成功: ${fruit}`);
      },
      undefined,
      (error) => {
        console.error(`✗ 水果图片加载失败: ${fruit}`, error);
      }
    );

    return () => {
      if (fruitTexture) {
        fruitTexture.dispose();
      }
    };
  }, [fruit]);

  // 初始化位置
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.copy(currentPositionRef.current);
    }
  }, []);

  // 当位置改变时，更新目标位置
  useEffect(() => {
    targetPositionRef.current.set(...position);
  }, [position]);

  // 创建圆形平面几何体
  const geometry = useMemo(() => new THREE.CircleGeometry(0.45, 32), []);
  const bgGeometry = useMemo(() => new THREE.CircleGeometry(0.5, 32), []);
  const highlightGeometry = useMemo(() => new THREE.CircleGeometry(0.2, 32), []);

  // 透明度动画状态
  const opacityRef = useRef(1);

  // 2D 动画效果
  useFrame((state) => {
    if (groupRef.current) {
      // 初始化掉落动画（带延迟）
      if (!dropAnimationRef.current.hasStarted) {
        if (dropAnimationRef.current.startTime === 0) {
          dropAnimationRef.current.startTime = state.clock.elapsedTime;
        }

        const elapsed = state.clock.elapsedTime - dropAnimationRef.current.startTime;
        if (elapsed >= dropDelay) {
          dropAnimationRef.current.hasStarted = true;
          dropAnimationRef.current.isDropping = true;
        }
      }

      // 掉落动画
      if (dropAnimationRef.current.isDropping) {
        // 使用 lerp 实现平滑掉落
        currentPositionRef.current.lerp(targetPositionRef.current, 0.12);
        groupRef.current.position.copy(currentPositionRef.current);

        // 检查是否已经到达目标位置
        const distance = currentPositionRef.current.distanceTo(targetPositionRef.current);
        if (distance < 0.01) {
          dropAnimationRef.current.isDropping = false;
          groupRef.current.position.copy(targetPositionRef.current);
        }
      }

      // 选中时的动画效果
      if (isSelected && !dropAnimationRef.current.isDropping) {
        // 轻微缩放动画
        const scaleValue = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.08;
        groupRef.current.scale.setScalar(scaleValue * scale);
      } else if (!isMatched && !dropAnimationRef.current.isDropping) {
        // 恢复原始大小
        groupRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.2);
      }

      // 匹配时消失动画
      if (isMatched) {
        groupRef.current.scale.lerp(new THREE.Vector3(0, 0, 0), 0.15);
        opacityRef.current = Math.max(0, opacityRef.current - 0.08);
      } else {
        opacityRef.current = 1;
      }
    }

    // 选中时背景发光效果
    if (bgRef.current && isSelected) {
      const bgMat = bgRef.current.material as THREE.MeshBasicMaterial;
      bgMat.color.setHex(0xfdc700);
      bgMat.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 背景圆形 - 只在选中时显示 */}
      {isSelected && (
        <mesh ref={bgRef} geometry={bgGeometry} position={[0, 0, -0.01]}>
          <meshBasicMaterial
            color="#fdc700"
            side={THREE.DoubleSide}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}

      {/* 主体圆形 - 水果图片 */}
      <mesh
        geometry={geometry}
        onPointerDown={(e) => {
          e.stopPropagation();
          console.log('水果被点击:', row, col, fruit);
          onClick();
        }}
        onClick={(e) => {
          e.stopPropagation();
          console.log('水果 onClick 事件:', row, col, fruit);
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <meshBasicMaterial
          map={fruitTexture}
          color={fruitTexture ? '#ffffff' : '#cccccc'}
          side={THREE.DoubleSide}
          transparent
          opacity={opacityRef.current}
        />
      </mesh>

      {/* 高光 - 在左上角 */}
      <mesh geometry={highlightGeometry} position={[-0.12, 0.12, 0.01]}>
        <meshBasicMaterial
          color="#ffffff"
          side={THREE.DoubleSide}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* 选中时的边框 */}
      {isSelected && !isMatched && (
        <mesh position={[0, 0, 0.02]}>
          <ringGeometry args={[0.46, 0.5, 32]} />
          <meshBasicMaterial
            color="#fdc700"
            side={THREE.DoubleSide}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
    </group>
  );
}
