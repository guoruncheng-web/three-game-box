/**
 * 游戏音效 Hook
 * 使用 Web Audio API 生成简单的游戏音效
 * Chinese: 游戏音效管理钩子，用于播放点击、匹配、得分等音效
 */

'use client';

import { useRef, useCallback, useEffect } from 'react';

interface GameSoundsOptions {
  enabled: boolean;
}

export function useGameSounds({ enabled }: GameSoundsOptions) {
  const audioContextRef = useRef<AudioContext | null>(null);

  // 初始化 AudioContext
  useEffect(() => {
    if (typeof window !== 'undefined' && enabled) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [enabled]);

  // 播放点击音效 - 短促清脆的音调
  const playClickSound = useCallback(() => {
    if (!enabled || !audioContextRef.current) return;

    try {
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);

      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } catch (error) {
      console.error('播放点击音效失败:', error);
    }
  }, [enabled]);

  // 播放交换音效 - 滑动音效
  const playSwapSound = useCallback(() => {
    if (!enabled || !audioContextRef.current) return;

    try {
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.15);

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch (error) {
      console.error('播放交换音效失败:', error);
    }
  }, [enabled]);

  // 播放匹配音效 - 上升音调
  const playMatchSound = useCallback(() => {
    if (!enabled || !audioContextRef.current) return;

    try {
      const ctx = audioContextRef.current;

      // 创建多个音符，形成和弦效果
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 和弦

      frequencies.forEach((freq, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

        const startTime = ctx.currentTime + index * 0.05;
        gainNode.gain.setValueAtTime(0.08, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
      });
    } catch (error) {
      console.error('播放匹配音效失败:', error);
    }
  }, [enabled]);

  // 播放得分音效 - 愉悦的上升音阶
  const playScoreSound = useCallback((matchCount: number = 3) => {
    if (!enabled || !audioContextRef.current) return;

    try {
      const ctx = audioContextRef.current;

      // 根据匹配数量调整音效的复杂度
      const noteCount = Math.min(matchCount, 7);
      const baseFreq = 440; // A4

      for (let i = 0; i < noteCount; i++) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        // 上升音阶
        const freq = baseFreq * Math.pow(2, i / 12);
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

        const startTime = ctx.currentTime + i * 0.08;
        gainNode.gain.setValueAtTime(0.1, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.2);
      }
    } catch (error) {
      console.error('播放得分音效失败:', error);
    }
  }, [enabled]);

  // 播放胜利音效 - 欢快的上升音阶
  const playWinSound = useCallback(() => {
    if (!enabled || !audioContextRef.current) return;

    try {
      const ctx = audioContextRef.current;

      // 胜利音效 - C大调主和弦分解 + 上行音阶
      const melody = [
        { freq: 523.25, duration: 0.15 }, // C5
        { freq: 659.25, duration: 0.15 }, // E5
        { freq: 783.99, duration: 0.15 }, // G5
        { freq: 1046.50, duration: 0.3 }, // C6
      ];

      melody.forEach(({ freq, duration }, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

        const startTime = ctx.currentTime + index * 0.15;
        gainNode.gain.setValueAtTime(0.15, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      });
    } catch (error) {
      console.error('播放胜利音效失败:', error);
    }
  }, [enabled]);

  // 播放失败音效 - 下降音调
  const playLoseSound = useCallback(() => {
    if (!enabled || !audioContextRef.current) return;

    try {
      const ctx = audioContextRef.current;

      // 失败音效 - 下降的音调
      const frequencies = [440, 392, 349.23]; // A4, G4, F4

      frequencies.forEach((freq, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

        const startTime = ctx.currentTime + index * 0.2;
        gainNode.gain.setValueAtTime(0.12, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.4);
      });
    } catch (error) {
      console.error('播放失败音效失败:', error);
    }
  }, [enabled]);

  return {
    playClickSound,
    playSwapSound,
    playMatchSound,
    playScoreSound,
    playWinSound,
    playLoseSound,
  };
}
