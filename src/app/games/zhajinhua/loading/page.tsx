/**
 * 炸金花资源预加载页：全部资源就绪后再进入主游戏页
 */

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { preloadImage, resolveZhajinhuaPreloadUrls } from '@/lib/zhajinhua/preload-assets';

const MIN_LOADING_MS = 400;

export default function ZhajinhuaLoadingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('准备资源…');

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const urls = await resolveZhajinhuaPreloadUrls();
      const total = urls.length;
      let loaded = 0;

      const tickProgress = () => {
        if (cancelled) return;
        const pct = total === 0 ? 100 : Math.round((loaded / total) * 100);
        setProgress(pct);
      };

      const start = Date.now();

      await Promise.all(
        urls.map(async (url) => {
          await preloadImage(url);
          loaded += 1;
          tickProgress();
          setStatusText(`加载素材 ${loaded}/${total}`);
        })
      );

      const elapsed = Date.now() - start;
      if (elapsed < MIN_LOADING_MS) {
        await new Promise((r) => setTimeout(r, MIN_LOADING_MS - elapsed));
      }

      if (!cancelled) {
        setProgress(100);
        setStatusText('进入游戏…');
        router.replace('/games/zhajinhua');
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center px-6 pb-[max(24px,env(safe-area-inset-bottom))]"
      style={{
        background: 'linear-gradient(165deg, #1a0a2e 0%, #2d1b4e 45%, #1a1030 100%)',
      }}
    >
      <div className="relative w-36 h-36 mb-8 rounded-3xl overflow-hidden shadow-2xl ring-2 ring-amber-400/40 animate-pulse">
        <Image
          src="/images/games/zhajinhua-cover.png"
          alt=""
          fill
          className="object-cover"
          sizes="144px"
          priority
        />
      </div>

      <h1
        className="text-2xl font-black tracking-wide mb-2"
        style={{
          background: 'linear-gradient(90deg, #fde68a, #fbbf24, #f59e0b)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        炸金花
      </h1>
      <p className="text-sm text-white/65 mb-8 text-center">{statusText}</p>

      <div className="w-full max-w-xs">
        <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-300 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #ad46ff, #f6339a)',
            }}
          />
        </div>
        <p className="text-center text-xs text-white/45 mt-3 tabular-nums">{progress}%</p>
      </div>
    </div>
  );
}
