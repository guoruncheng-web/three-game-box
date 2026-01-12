/**
 * 2D 水果单元格组件
 * 使用图片纹理替代 emoji
 */

'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 普通水果类型
type NormalFruitType = '🍇' | '🍋' | '🍉' | '🍊' | '🍎' | '🍒' | '🍓';

// 特殊水果类型
type SpecialFruitType = '💣' | '🌈' | '🍈';

// 所有水果类型
type FruitType = NormalFruitType | SpecialFruitType;

interface FruitCellProps {
  fruit: FruitType;
  position: [number, number, number];
  row: number;
  col: number;
  isSelected: boolean;
  isMatched: boolean;
  onClick: () => void;
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  scale?: number;
}

// 水果类型到图片路径的映射
const fruitImages: Record<FruitType, string> = {
  // 普通水果
  '🍇': '/images/generated/fruid/Grape.png',
  '🍋': '/images/generated/fruid/lemon.png',
  '🍉': '/images/generated/fruid/Watermelon.png',
  '🍊': '/images/generated/fruid/Orange.png',
  '🍎': '/images/generated/fruid/RainbowCandy.png',
  '🍒': '/images/generated/fruid/VerticalStriped.png',
  '🍓': '/images/generated/fruid/Strawberry.png',
  // 特殊水果 - 暂时使用现有图片作为占位符
  '💣': '/images/generated/fruid/Banana.png',         // 炸弹 - 使用香蕉图片（黄色爆炸效果）
  '🌈': '/images/generated/fruid/RainbowCandy.png',   // 彩虹 - 使用彩虹糖果
  '🍈': '/images/generated/fruid/Watermelon.png',     // 特殊西瓜
};

// 判断是否为特殊水果
const isSpecialFruit = (fruit: FruitType): boolean => {
  return fruit === '💣' || fruit === '🌈' || fruit === '🍈';
};

export function FruitCell({
  fruit,
  position,
  row,
  col,
  isSelected,
  isMatched,
  onClick,
  onSwipe,
  scale = 1,
}: FruitCellProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bgRef = useRef<THREE.Mesh>(null);
  const [fruitTexture, setFruitTexture] = useState<THREE.Texture | null>(null);
  
  // 滑动检测状态
  const swipeStateRef = useRef<{
    isDragging: boolean;
    startX: number;
    startY: number;
    startTime: number;
    startPoint: THREE.Vector3 | null;
    hasMoved: boolean;
  }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    startTime: 0,
    startPoint: null,
    hasMoved: false,
  });

  const MIN_SWIPE_DISTANCE = 0.15; // 最小滑动距离（3D空间单位，降低阈值以提高灵敏度）
  const MAX_SWIPE_TIME = 800; // 最大滑动时间（毫秒，增加时间窗口）
  const MIN_MOVE_DISTANCE = 0.05; // 判断是否移动的最小距离

  // 掉落动画状态 - 基于行列计算延迟
  const dropDelay = useMemo(() => row * 0.05 + col * 0.02, [row, col]);
  const dropAnimationRef = useRef({
    isDropping: false, // 初始为 false，等待延迟后开始
    hasStarted: false,
    startTime: 0
  });

  // 位置动画状态
  const isInitialMount = useRef(true);
  const currentPositionRef = useRef(new THREE.Vector3(position[0], position[1] + 12, position[2]));
  const targetPositionRef = useRef(new THREE.Vector3(...position));
  const isSwapping = useRef(false); // 是否正在交换动画中
  const swapStartTime = useRef(0); // 交换动画开始时间
  const swapStartPosition = useRef(new THREE.Vector3()); // 交换动画起始位置

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

  // 当位置改变时，更新目标位置并触发交换动画
  useEffect(() => {
    const newTargetPosition = new THREE.Vector3(...position);

    // 如果不是初始挂载，并且位置发生了实际变化
    if (!isInitialMount.current) {
      const hasPositionChanged = !targetPositionRef.current.equals(newTargetPosition);

      if (hasPositionChanged) {
        // 检查是否是水平或垂直移动（交换动画）
        const isHorizontalMove = Math.abs(newTargetPosition.x - targetPositionRef.current.x) > 0.1;
        const isVerticalMove = Math.abs(newTargetPosition.y - targetPositionRef.current.y) > 0.1;

        if ((isHorizontalMove || isVerticalMove) && dropAnimationRef.current.hasStarted) {
          // 这是一个交换动画
          isSwapping.current = true;
          swapStartTime.current = performance.now();
          swapStartPosition.current.copy(currentPositionRef.current);
          console.log(`水果 ${fruit} 开始交换动画:`, {
            from: currentPositionRef.current.toArray(),
            to: newTargetPosition.toArray()
          });
        }
      }
    } else {
      isInitialMount.current = false;
    }

    targetPositionRef.current.copy(newTargetPosition);
  }, [position, fruit]);

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

      // 交换动画（在掉落动画完成后）
      if (isSwapping.current && dropAnimationRef.current.hasStarted && !dropAnimationRef.current.isDropping) {
        const swapDuration = 300; // 交换动画持续时间（毫秒）
        const elapsed = performance.now() - swapStartTime.current;
        const progress = Math.min(elapsed / swapDuration, 1);

        // 使用 easeOutBack 缓动函数，产生轻微的回弹效果
        const easeOutBack = (t: number): number => {
          const c1 = 1.70158;
          const c3 = c1 + 1;
          return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        };

        const easedProgress = easeOutBack(progress);

        // 根据缓动进度插值位置
        currentPositionRef.current.lerpVectors(
          swapStartPosition.current,
          targetPositionRef.current,
          easedProgress
        );
        groupRef.current.position.copy(currentPositionRef.current);

        // 动画完成
        if (progress >= 1) {
          isSwapping.current = false;
          groupRef.current.position.copy(targetPositionRef.current);
          currentPositionRef.current.copy(targetPositionRef.current);
          console.log(`水果 ${fruit} 交换动画完成`);
        }
      }

      // 选中时的动画效果
      if (isSelected && !dropAnimationRef.current.isDropping && !isSwapping.current) {
        // 轻微缩放动画
        const scaleValue = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.08;
        groupRef.current.scale.setScalar(scaleValue * scale);
      } else if (!isMatched && !dropAnimationRef.current.isDropping && !isSwapping.current) {
        // 恢复原始大小
        groupRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.2);
      }

      // 交换时添加轻微的弹性缩放效果
      if (isSwapping.current) {
        const swapDuration = 300;
        const elapsed = performance.now() - swapStartTime.current;
        const progress = Math.min(elapsed / swapDuration, 1);

        // 在交换过程中先放大后缩小，产生弹跳效果
        const scaleValue = 1 + Math.sin(progress * Math.PI) * 0.2;
        groupRef.current.scale.setScalar(scaleValue * scale);
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

      {/* 特殊水果发光效果 */}
      {isSpecialFruit(fruit) && !isMatched && (
        <mesh geometry={bgGeometry} position={[0, 0, -0.01]}>
          <meshBasicMaterial
            color={
              fruit === '💣' ? '#ff6b00' :   // 炸弹 - 橙色
              fruit === '🌈' ? '#ff00ff' :   // 彩虹 - 品红色
              '#00ff00'                       // 西瓜 - 绿色
            }
            side={THREE.DoubleSide}
            transparent
            opacity={0.4}
          />
        </mesh>
      )}

      {/* 主体圆形 - 水果图片 */}
      <mesh
        geometry={geometry}
        onPointerDown={(e) => {
          e.stopPropagation();
          const point = e.point.clone();
          swipeStateRef.current = {
            isDragging: true,
            startX: point.x,
            startY: point.y,
            startTime: Date.now(),
            startPoint: point,
            hasMoved: false,
          };
          // 阻止默认行为，避免页面滚动
          if (e.nativeEvent && 'preventDefault' in e.nativeEvent) {
            e.nativeEvent.preventDefault();
          }
        }}
        onPointerMove={(e) => {
          if (!swipeStateRef.current.isDragging) return;
          e.stopPropagation();

          // 检测是否有移动
          const point = e.point;
          const { startX, startY } = swipeStateRef.current;
          const deltaX = point.x - startX;
          const deltaY = point.y - startY;
          const moveDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

          if (moveDistance > MIN_MOVE_DISTANCE) {
            swipeStateRef.current.hasMoved = true;
          }
        }}
        onPointerUp={(e) => {
          e.stopPropagation();

          const wasDragging = swipeStateRef.current.isDragging;

          if (!wasDragging) {
            return;
          }

          const point = e.point;
          const { startX, startY, startTime, hasMoved } = swipeStateRef.current;

          const deltaX = point.x - startX;
          const deltaY = point.y - startY;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          const time = Date.now() - startTime;

          console.log('滑动结束:', { deltaX, deltaY, distance, time, hasMoved });

          // 重置拖动状态
          swipeStateRef.current.isDragging = false;
          swipeStateRef.current.startPoint = null;
          swipeStateRef.current.hasMoved = false;

          // 检查是否是有效的滑动
          if (distance >= MIN_SWIPE_DISTANCE && time <= MAX_SWIPE_TIME && onSwipe) {
            // 确定滑动方向
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);

            if (absX > absY) {
              // 水平滑动
              if (deltaX > 0) {
                console.log('向右滑动');
                onSwipe('right');
              } else {
                console.log('向左滑动');
                onSwipe('left');
              }
            } else {
              // 垂直滑动
              if (deltaY > 0) {
                console.log('向上滑动');
                onSwipe('up');
              } else {
                console.log('向下滑动');
                onSwipe('down');
              }
            }
          } else if (!hasMoved) {
            // 如果没有移动过，视为点击
            console.log('视为点击');
            onClick();
          } else {
            // 有移动但距离不够，不触发任何操作
            console.log('移动距离不够，忽略');
          }
        }}
        onPointerCancel={(e) => {
          e.stopPropagation();
          swipeStateRef.current.isDragging = false;
          swipeStateRef.current.startPoint = null;
          swipeStateRef.current.hasMoved = false;
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
          swipeStateRef.current.isDragging = false;
          swipeStateRef.current.startPoint = null;
          swipeStateRef.current.hasMoved = false;
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
