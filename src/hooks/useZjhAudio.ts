/**
 * 炸金花音频 Hook
 * 管理背景音乐（BGM）切换和音效（SFX）播放
 * 中文：炸金花专用音效管理，支持 BGM 淡入淡出切换、SFX 即时播放
 */

'use client';

import { useCallback, useEffect, useRef } from 'react';

import { zjhAudioAssets } from '@/lib/zhajinhua/assets';

/* ------------------------------------------------------------------ */
/*  常量                                                                */
/* ------------------------------------------------------------------ */

const BGM_VOLUME = 0.35;
const SFX_VOLUME = 0.65;
const FADE_MS = 600;

/* ------------------------------------------------------------------ */
/*  类型                                                                */
/* ------------------------------------------------------------------ */

type BgmKey = 'lobby' | 'gameplay' | 'settlement';

const BGM_MAP: Record<BgmKey, string> = {
  lobby: zjhAudioAssets.bgmLobby,
  gameplay: zjhAudioAssets.bgmGameplay,
  settlement: zjhAudioAssets.bgmSettlement,
};

export type ZjhSfxKey =
  | 'gameStart'
  | 'victory'
  | 'defeat'
  | 'bigWin'
  | 'handTriple'
  | 'handStraightFlush'
  | 'hand235';

const SFX_MAP: Record<ZjhSfxKey, string> = {
  gameStart: zjhAudioAssets.sfxGameStart,
  victory: zjhAudioAssets.sfxVictory,
  defeat: zjhAudioAssets.sfxDefeat,
  bigWin: zjhAudioAssets.sfxBigWin,
  handTriple: zjhAudioAssets.sfxHandTriple,
  handStraightFlush: zjhAudioAssets.sfxHandStraightFlush,
  hand235: zjhAudioAssets.sfxHand235,
};

/* ------------------------------------------------------------------ */
/*  工具函数                                                             */
/* ------------------------------------------------------------------ */

/** 音量淡出后暂停 */
function fadeOut(audio: HTMLAudioElement, ms: number): Promise<void> {
  return new Promise((resolve) => {
    const start = audio.volume;
    if (start <= 0 || audio.paused) { resolve(); return; }
    const steps = 20;
    const interval = ms / steps;
    const delta = start / steps;
    let step = 0;
    const id = setInterval(() => {
      step++;
      audio.volume = Math.max(0, start - delta * step);
      if (step >= steps) {
        clearInterval(id);
        audio.pause();
        audio.volume = start;
        resolve();
      }
    }, interval);
  });
}

/** 淡入播放 */
function fadeIn(audio: HTMLAudioElement, targetVolume: number, ms: number) {
  audio.volume = 0;
  const play = audio.play().catch(() => { /* 自动播放限制 */ });
  const steps = 20;
  const interval = ms / steps;
  const delta = targetVolume / steps;
  let step = 0;
  const id = setInterval(() => {
    step++;
    audio.volume = Math.min(targetVolume, delta * step);
    if (step >= steps) clearInterval(id);
  }, interval);
  return play;
}

/* ------------------------------------------------------------------ */
/*  Hook                                                                */
/* ------------------------------------------------------------------ */

export function useZjhAudio(enabled: boolean) {
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const currentBgmKey = useRef<BgmKey | null>(null);
  const sfxPool = useRef<Map<string, HTMLAudioElement>>(new Map());
  const audioCtxRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  /** 懒创建 AudioContext（需在用户手势内首次调用） */
  function ensureAudioCtx(): AudioContext {
    if (!audioCtxRef.current) {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AC();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  }

  /* ---- 清理 ---- */
  useEffect(() => {
    return () => {
      bgmRef.current?.pause();
      bgmRef.current = null;
      sfxPool.current.forEach((a) => { a.pause(); a.src = ''; });
      sfxPool.current.clear();
      if (audioCtxRef.current) {
        void audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, []);

  /* ---- 自动播放解锁：首次用户交互后尝试恢复 BGM ---- */
  useEffect(() => {
    if (!enabled) return;
    const tryResume = () => {
      const audio = bgmRef.current;
      if (audio && audio.paused && currentBgmKey.current) {
        void audio.play().catch(() => {});
      }
    };
    window.addEventListener('pointerdown', tryResume, { passive: true, once: false });
    window.addEventListener('keydown', tryResume, { once: false });
    return () => {
      window.removeEventListener('pointerdown', tryResume);
      window.removeEventListener('keydown', tryResume);
    };
  }, [enabled]);

  /* ---- 切换 BGM（淡入淡出） ---- */
  const switchBgm = useCallback(async (key: BgmKey | null) => {
    if (key === currentBgmKey.current) return;

    // 淡出当前
    if (bgmRef.current) {
      await fadeOut(bgmRef.current, FADE_MS);
      bgmRef.current.src = '';
      bgmRef.current = null;
    }

    currentBgmKey.current = key;
    if (!key || !enabledRef.current) return;

    const audio = new Audio(BGM_MAP[key]);
    audio.loop = true;
    audio.preload = 'auto';
    bgmRef.current = audio;

    fadeIn(audio, BGM_VOLUME, FADE_MS);
  }, []);

  /* ---- 停止 BGM ---- */
  const stopBgm = useCallback(async () => {
    if (bgmRef.current) {
      await fadeOut(bgmRef.current, FADE_MS);
      bgmRef.current.src = '';
      bgmRef.current = null;
    }
    currentBgmKey.current = null;
  }, []);

  /* ---- 播放 SFX（可叠加） ---- */
  const playSfx = useCallback((key: ZjhSfxKey) => {
    if (!enabledRef.current) return;
    const src = SFX_MAP[key];
    if (!src) return;

    // 尝试复用已缓存的 Audio 实例（若已播完）
    const cached = sfxPool.current.get(key);
    if (cached && cached.paused) {
      cached.currentTime = 0;
      cached.volume = SFX_VOLUME;
      void cached.play().catch(() => {});
      return;
    }

    // 新建实例（允许同一音效重叠播放）
    const audio = new Audio(src);
    audio.volume = SFX_VOLUME;
    audio.preload = 'auto';
    void audio.play().catch(() => {});

    // 播放结束后缓存
    audio.addEventListener('ended', () => {
      sfxPool.current.set(key, audio);
    }, { once: true });
  }, []);

  /* ---- 按钮点击音效（Web Audio 合成金属质感短音） ---- */
  const playClick = useCallback(() => {
    if (!enabledRef.current || typeof window === 'undefined') return;
    try {
      const ctx = ensureAudioCtx();
      const t = ctx.currentTime;

      // 金属质感：高频正弦 + 短促衰减
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.06);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.start(t);
      osc.stop(t + 0.08);

      // 叠加一层噪声模拟金属碰撞
      const bufLen = Math.round(ctx.sampleRate * 0.04);
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
      const noise = ctx.createBufferSource();
      const noiseGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      noise.buffer = buf;
      noise.connect(filter);
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3500, t);
      filter.Q.setValueAtTime(2, t);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseGain.gain.setValueAtTime(0.08, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      noise.start(t);
      noise.stop(t + 0.04);
    } catch {
      /* 静默降级 */
    }
  }, []);

  /* ---- enabled 切换时静音/恢复 ---- */
  useEffect(() => {
    if (!enabled) {
      if (bgmRef.current && !bgmRef.current.paused) {
        bgmRef.current.pause();
      }
    } else if (bgmRef.current && bgmRef.current.paused && currentBgmKey.current) {
      void bgmRef.current.play().catch(() => {});
    }
  }, [enabled]);

  return { switchBgm, stopBgm, playSfx, playClick };
}
