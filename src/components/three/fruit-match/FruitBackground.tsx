/**
 * 水果消消乐背景面板组件
 * 使用 board.jpg 作为背景图片
 */

'use client';

import { useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

export function FruitBackground() {
  const backgroundRef = useRef<THREE.Mesh>(null);
  const [backgroundTexture, setBackgroundTexture] = useState<THREE.Texture | null>(null);

  // 加载背景图片
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      '/images/board.jpg',
      (texture) => {
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.needsUpdate = true;
        setBackgroundTexture(texture);
        console.log('✓ 背景图片加载成功');
      },
      undefined,
      (error) => {
        console.error('✗ 背景图片加载失败:', error);
      }
    );

    return () => {
      if (backgroundTexture) {
        backgroundTexture.dispose();
      }
    };
  }, []);

  // 背景轻微呼吸效果
  useFrame((state) => {
    if (backgroundRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.2) * 0.01;
      backgroundRef.current.scale.set(scale, scale, 1);
    }
  });

  return (
    <group>
      {/* 主背景平面 */}
      <mesh ref={backgroundRef} position={[0, 0, -10]}>
        <planeGeometry args={[25, 25]} />
        <meshBasicMaterial
          map={backgroundTexture}
          color={backgroundTexture ? '#ffffff' : '#f5f5f5'}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
