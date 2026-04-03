/**
 * 炸金花荷官欢迎弹层：Three.js 展示 GLB 全身模型（透明 Canvas 叠在 UI 上）
 */

'use client';

import { Suspense, useEffect, useLayoutEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Center, useAnimations, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

import { zjhAssets } from '@/lib/zhajinhua/assets';

/**
 * 荷官模型朝向：按 GLB 绑定轴向微调。若仍不对，可改为 Math.PI、±Math.PI/2。
 * 当前为 0（上一版 Math.PI 与用户期望相反故撤销）。
 */
const DEALER_FACING_Y = 0;

/** 平视角色上半身：避免默认相机偏高造成「从头顶往下看」 */
/** 模型放大后略拉远，避免裁切 */
const CAMERA_POS: [number, number, number] = [0, 0.82, 3.32];
/** 与 group 的 Y 一起微调，视线落在胸肩附近 */
const LOOK_AT = new THREE.Vector3(0, 0.72, 0);

/** 模型整体在画面中的垂直偏移（越大越靠上；原 -0.95 易把脚裁出画外） */
const DEALER_GROUP_Y = 0.08;

/** 模型缩放（略大于 1 让荷官在弹层中更醒目） */
const DEALER_MODEL_SCALE = 1.22;

function DealerFaceCamera() {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.position.set(...CAMERA_POS);
    if ('fov' in camera) {
      (camera as THREE.PerspectiveCamera).fov = 36;
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    }
    camera.lookAt(LOOK_AT);
  }, [camera]);
  return null;
}

/** 与 GLB 内动画片段名匹配：命中则视为「招手」先播一遍 */
const WAVE_CLIP_RE = /wave|greet|hello|挥手|招手|欢迎|hi|bye|salute|waving|挥手致意/i;
/** 待机循环（挥手结束后衔接） */
const IDLE_CLIP_RE = /idle|stand|wait|待機|breathing|loop|默认|站立/i;

function DealerScene({ url }: { url: string }) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(url);
  const { actions, names, mixer } = useAnimations(animations, group);

  useEffect(() => {
    if (names.length === 0) return;

    const waveName = names.find((n) => WAVE_CLIP_RE.test(n));
    const idleName = names.find((n) => IDLE_CLIP_RE.test(n) && n !== waveName);
    const idleFallback = idleName ?? names.find((n) => n !== waveName) ?? names[0]!;

    const playIdle = () => {
      const a = actions[idleFallback];
      if (!a) return;
      a.reset();
      a.setLoop(THREE.LoopRepeat, Infinity);
      a.clampWhenFinished = false;
      a.fadeIn(0.4).play();
    };

    if (waveName && actions[waveName]) {
      const wave = actions[waveName]!;
      wave.reset();
      wave.setLoop(THREE.LoopOnce, 1);
      wave.clampWhenFinished = true;
      wave.fadeIn(0.35).play();

      const onFinished = (e: { action?: THREE.AnimationAction }) => {
        if (e.action !== wave) return;
        mixer.removeEventListener('finished', onFinished);
        wave.fadeOut(0.35);
        playIdle();
      };
      mixer.addEventListener('finished', onFinished);

      return () => {
        mixer.removeEventListener('finished', onFinished);
        wave.fadeOut(0.2);
        mixer.stopAllAction();
      };
    }

    const first = actions[names[0]!];
    if (first) {
      first.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.35).play();
    }
    return () => {
      first?.fadeOut(0.25);
    };
  }, [actions, names, mixer]);

  return (
    <group ref={group} position={[0, DEALER_GROUP_Y, 0]} rotation={[0, DEALER_FACING_Y, 0]}>
      <group scale={DEALER_MODEL_SCALE}>
        <Center top>
          <primitive object={scene} />
        </Center>
      </group>
    </group>
  );
}

export interface ZhajinhuaDealerModelProps {
  /** 默认使用素材库中的荷官 GLB */
  modelUrl?: string;
  className?: string;
}

/**
 * @param modelUrl - GLB 地址，默认 `zjhAssets.dealerModelGlb`
 */
export function ZhajinhuaDealerModel({
  modelUrl = zjhAssets.dealerModelGlb,
  className,
}: ZhajinhuaDealerModelProps) {
  useEffect(() => {
    useGLTF.preload(modelUrl);
  }, [modelUrl]);

  return (
    <div
      className={
        className ??
        'relative aspect-[9/16] h-[min(58vh,460px)] w-full max-w-[340px] drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]'
      }
    >
      <Canvas
        camera={{ position: CAMERA_POS, fov: 36, near: 0.1, far: 100 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 1.28;
        }}
        dpr={[1, 2]}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        <DealerFaceCamera />
        <hemisphereLight args={['#ffffff', '#6b6b70', 0.85]} />
        <ambientLight intensity={1.05} />
        <directionalLight position={[2.2, 5, 4.2]} intensity={1.55} color="#fff8f0" />
        <directionalLight position={[-3.5, 2.8, -2.5]} intensity={0.65} color="#ffe8d0" />
        <pointLight position={[0.8, 1.8, 2.4]} intensity={0.9} distance={12} color="#ffffff" />
        <Suspense fallback={null}>
          <DealerScene url={modelUrl} />
        </Suspense>
      </Canvas>
    </div>
  );
}
