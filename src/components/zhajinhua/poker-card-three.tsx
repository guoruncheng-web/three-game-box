/**
 * 扑克牌 Three.js 版本：MeshStandard + 多光源营造层次，正面保留 DOM 文字便于测试与清晰排版
 */

'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

import { zjhAssets } from '@/lib/zhajinhua/assets';
import type { Card } from '@/types/zjh';

import { isRedSuit, SUIT_CHAR } from './poker-card-shared';
import type { PokerCardFlatProps } from './poker-card-flat';

const CARD_W = 1;
const CARD_H = 1.3846;

/** 主光 + 冷色轮廓光 + 暖色点光，静态渲染减轻多牌同屏压力 */
function CardLightingRig() {
  return (
    <>
      <ambientLight intensity={0.52} />
      <directionalLight position={[2.8, 5, 4]} intensity={1.35} color="#fffaf5" />
      <directionalLight position={[-4, 2.5, 2.5]} intensity={0.38} color="#c8ddff" />
      <pointLight position={[0.6, 1.2, 2.8]} intensity={0.55} distance={8} color="#ffe8c8" />
    </>
  );
}

function BackFaceMesh({ url }: { url: string }) {
  const texture = useTexture(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return (
    <mesh rotation={[0.1, -0.16, 0]} castShadow receiveShadow>
      <planeGeometry args={[CARD_W, CARD_H]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.42}
        metalness={0.08}
        envMapIntensity={0.9}
      />
    </mesh>
  );
}

function WhiteFaceMesh() {
  return (
    <mesh rotation={[0.1, -0.16, 0]} castShadow receiveShadow>
      <planeGeometry args={[CARD_W, CARD_H]} />
      <meshStandardMaterial
        color="#ffffff"
        roughness={0.48}
        metalness={0.02}
        envMapIntensity={0.85}
      />
    </mesh>
  );
}

function CardScene({ faceDown, card }: { faceDown: boolean; card?: Card }) {
  return (
    <>
      <color attach="background" args={['transparent']} />
      <CardLightingRig />
      <Suspense fallback={null}>
        {faceDown || !card ? (
          <BackFaceMesh url={zjhAssets.cardBack} />
        ) : (
          <WhiteFaceMesh />
        )}
      </Suspense>
    </>
  );
}

export function PokerCardThree({ faceDown, card, className = '' }: PokerCardFlatProps) {
  const red = card ? isRedSuit(card.suit) : false;
  const colorClass = red ? 'text-red-600' : 'text-zinc-900';
  const suitChar = card ? SUIT_CHAR[card.suit] : '';

  return (
    <div className={`relative shrink-0 overflow-hidden rounded-lg ${className}`}>
      <Canvas
        className="absolute inset-0 h-full w-full"
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
        camera={{ fov: 32, near: 0.1, far: 20, position: [0, 0, 3.45] }}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <CardScene faceDown={faceDown} card={card} />
      </Canvas>

      {!faceDown && card ? (
        <div
          className="pointer-events-none absolute inset-0 z-[1] flex flex-col"
          aria-hidden
          style={{
            backgroundColor: 'transparent',
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 9px, rgba(0,0,0,0.03) 9px, rgba(0,0,0,0.03) 10px), repeating-linear-gradient(90deg, transparent, transparent 9px, rgba(0,0,0,0.03) 9px, rgba(0,0,0,0.03) 10px)',
          }}
        >
          <div className={`absolute top-1 left-1.5 flex flex-col items-center leading-none ${colorClass}`}>
            <span className="text-[11px] font-black leading-none">{card.rank}</span>
            <span className="text-[10px] leading-none">{suitChar}</span>
          </div>
          <div className={`absolute inset-0 flex items-center justify-center ${colorClass}`}>
            <span className="text-[24px] leading-none">{suitChar}</span>
          </div>
          <div className={`absolute bottom-1 right-1.5 flex flex-col items-center leading-none rotate-180 ${colorClass}`}>
            <span className="text-[11px] font-black leading-none">{card.rank}</span>
            <span className="text-[10px] leading-none">{suitChar}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
