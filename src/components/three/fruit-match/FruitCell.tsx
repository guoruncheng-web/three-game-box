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
  isSelected,
  isMatched,
  onClick,
  scale = 1,
}: FruitCellProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bgRef = useRef<THREE.Mesh>(null);
  const [fruitTexture, setFruitTexture] = useState<THREE.Texture | null>(null);

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

  // 创建圆形平面几何体（2D 圆形）
  const geometry = useMemo(() => new THREE.CircleGeometry(0.45, 32), []);
  const bgGeometry = useMemo(() => new THREE.CircleGeometry(0.5, 32), []);

  // 透明度动画状态
  const opacityRef = useRef(1);

  // 2D 动画效果
  useFrame((state) => {
    if (groupRef.current) {
      // 选中时的动画效果
      if (isSelected) {
        // 轻微缩放动画
        const scaleValue = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.08;
        groupRef.current.scale.setScalar(scaleValue * scale);
      } else {
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
    if (bgRef.current) {
      const bgMat = bgRef.current.material as THREE.MeshBasicMaterial;
      if (isSelected) {
        bgMat.color.setHex(0xfdc700);
        bgMat.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
      } else {
        bgMat.color.setHex(0xffffff);
        bgMat.opacity = 0.3;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* 背景圆形 */}
      <mesh ref={bgRef} geometry={bgGeometry} position={[0, 0, -0.01]}>
        <meshBasicMaterial
          color="#ffffff"
          side={THREE.DoubleSide}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* 主体圆形 - 水果图片 */}
      <mesh
        geometry={geometry}
        onClick={(e) => {
          e.stopPropagation();
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

      {/* 选中时的边框 */}
      {isSelected && !isMatched && (
        <mesh position={[0, 0, 0.01]}>
          <ringGeometry args={[0.48, 0.54, 32]} />
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
