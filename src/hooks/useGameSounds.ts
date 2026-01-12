/**
 * 游戏音效 Hook
 * 优先使用音频文件，如果文件不存在则回退到动态生成
 * Chinese: 游戏音效管理钩子，用于播放点击、匹配、得分等音效
 */

'use client';

import { useRef, useCallback, useEffect, useState } from 'react';

interface GameSoundsOptions {
  enabled: boolean;
}

// 音效文件路径
const SOUND_PATHS = {
  click: '/sounds/fruit-match/fruit-match-click.wav',
  swap: '/sounds/fruit-match/fruit-match-swap.wav',
  match: '/sounds/fruit-match/fruit-match-match.wav',
  score: '/sounds/fruit-match/fruit-match-score.wav',
  win: '/sounds/fruit-match/fruit-match-win.wav',
  lose: '/sounds/fruit-match/fruit-match-lose.wav',
};

export function useGameSounds({ enabled }: GameSoundsOptions) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const [audioFilesLoaded, setAudioFilesLoaded] = useState(false);

  // 初始化 AudioContext 和预加载音频文件
  useEffect(() => {
    if (typeof window === 'undefined' || !enabled) return;

    // 初始化 AudioContext（用于动态生成音效的回退方案）
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

    // 预加载音频文件
    const loadAudioFiles = async () => {
      const audioPromises = Object.entries(SOUND_PATHS).map(async ([key, path]) => {
        try {
          const audio = new Audio(path);
          audio.preload = 'auto';
          audio.volume = 0.7; // 设置默认音量
          
          // 等待音频加载
          await new Promise((resolve, reject) => {
            audio.addEventListener('canplaythrough', resolve, { once: true });
            audio.addEventListener('error', reject, { once: true });
            // 如果加载超时，也继续（使用回退方案）
            setTimeout(resolve, 2000);
          });
          
          audioRefs.current[key] = audio;
          return true;
        } catch (error) {
          console.warn(`音效文件加载失败: ${path}，将使用动态生成`, error);
          return false;
        }
      });

      const results = await Promise.all(audioPromises);
      const allLoaded = results.every(Boolean);
      setAudioFilesLoaded(allLoaded);
    };

    loadAudioFiles();

    return () => {
      // 清理音频资源
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause();
        audio.src = '';
      });
      audioRefs.current = {};
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [enabled]);

  // 播放音频文件（如果可用）或回退到动态生成
  const playAudioFile = useCallback((key: string, fallbackFn: () => void) => {
    if (!enabled) return;

    const audio = audioRefs.current[key];
    if (audio) {
      try {
        // 重置播放位置并播放
        audio.currentTime = 0;
        audio.play().catch((error) => {
          console.warn(`播放音效文件失败: ${key}，使用回退方案`, error);
          fallbackFn();
        });
      } catch (error) {
        console.warn(`播放音效文件失败: ${key}，使用回退方案`, error);
        fallbackFn();
      }
    } else {
      // 文件未加载，使用回退方案
      fallbackFn();
    }
  }, [enabled]);

  // 播放点击音效 - 短促清脆的音调
  const playClickSound = useCallback(() => {
    if (!enabled) return;

    const fallback = () => {
      if (!audioContextRef.current) return;
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
    };

    playAudioFile('click', fallback);
  }, [enabled, playAudioFile]);

  // 播放交换音效 - 滑动音效
  const playSwapSound = useCallback(() => {
    if (!enabled) return;

    const fallback = () => {
      if (!audioContextRef.current) return;
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
    };

    playAudioFile('swap', fallback);
  }, [enabled, playAudioFile]);

  // 播放匹配音效 - 上升音调
  const playMatchSound = useCallback(() => {
    if (!enabled) return;

    const fallback = () => {
      if (!audioContextRef.current) return;
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
    };

    playAudioFile('match', fallback);
  }, [enabled, playAudioFile]);

  // 播放得分音效 - 愉悦的上升音阶
  const playScoreSound = useCallback((matchCount: number = 3) => {
    if (!enabled) return;

    const fallback = () => {
      if (!audioContextRef.current) return;
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
    };

    // 得分音效使用文件，但也可以根据匹配数量调整音量
    playAudioFile('score', fallback);
  }, [enabled, playAudioFile]);

  // 播放胜利音效 - 欢快的上升音阶
  const playWinSound = useCallback(() => {
    if (!enabled) return;

    const fallback = () => {
      if (!audioContextRef.current) return;
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
    };

    playAudioFile('win', fallback);
  }, [enabled, playAudioFile]);

  // 播放失败音效 - 下降音调
  const playLoseSound = useCallback(() => {
    if (!enabled) return;

    const fallback = () => {
      if (!audioContextRef.current) return;
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
    };

    playAudioFile('lose', fallback);
  }, [enabled, playAudioFile]);

  return {
    playClickSound,
    playSwapSound,
    playMatchSound,
    playScoreSound,
    playWinSound,
    playLoseSound,
  };
}
