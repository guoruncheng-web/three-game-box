/**
 * 背景音乐 Hook
 * 管理游戏背景音乐的播放、暂停、音量控制
 */

'use client';

import { useRef, useCallback, useEffect } from 'react';

interface BackgroundMusicOptions {
  enabled: boolean;
  volume?: number;
  loop?: boolean;
}

const MUSIC_PATH = '/sounds/fruit-match/fruit-match-bg-music.wav';

export function useBackgroundMusic({ enabled, volume = 0.5, loop = true }: BackgroundMusicOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);

  // 初始化音频
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 创建音频元素
    const audio = new Audio(MUSIC_PATH);
    audio.loop = loop;
    audio.volume = volume;
    audio.preload = 'auto';

    // 处理音频加载
    audio.addEventListener('canplaythrough', () => {
      console.log('背景音乐加载完成');
    });

    audio.addEventListener('error', (error) => {
      console.warn('背景音乐加载失败，将使用静默模式:', error);
    });

    audioRef.current = audio;

    return () => {
      // 清理
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, [loop, volume]);

  // 更新音量
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // 播放背景音乐
  const play = useCallback(async () => {
    if (!enabled || !audioRef.current || isPlayingRef.current) return;

    try {
      await audioRef.current.play();
      isPlayingRef.current = true;
      console.log('背景音乐开始播放');
    } catch (error) {
      console.warn('播放背景音乐失败:', error);
      // 某些浏览器需要用户交互才能播放音频
      // 这里静默失败，不影响游戏体验
    }
  }, [enabled]);

  // 暂停背景音乐
  const pause = useCallback(() => {
    if (!audioRef.current || !isPlayingRef.current) return;

    try {
      audioRef.current.pause();
      isPlayingRef.current = false;
      console.log('背景音乐已暂停');
    } catch (error) {
      console.warn('暂停背景音乐失败:', error);
    }
  }, []);

  // 停止背景音乐（暂停并重置位置）
  const stop = useCallback(() => {
    if (!audioRef.current) return;

    try {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      isPlayingRef.current = false;
      console.log('背景音乐已停止');
    } catch (error) {
      console.warn('停止背景音乐失败:', error);
    }
  }, []);

  // 设置音量
  const setVolume = useCallback((newVolume: number) => {
    if (!audioRef.current) return;

    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    audioRef.current.volume = clampedVolume;
  }, []);

  // 根据 enabled 状态自动播放/暂停
  useEffect(() => {
    if (enabled && audioRef.current && !isPlayingRef.current) {
      play();
    } else if (!enabled && audioRef.current && isPlayingRef.current) {
      pause();
    }
  }, [enabled, play, pause]);

  return {
    play,
    pause,
    stop,
    setVolume,
    isPlaying: isPlayingRef.current,
  };
}
