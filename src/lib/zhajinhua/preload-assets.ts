/**
 * 炸金花进入游戏前需预加载的静态资源 URL
 * 优先使用 public/images/generated/zhajinhua/manifest.json，失败时回退到内置列表
 */

import { zjhAssets } from '@/lib/zhajinhua/assets';

const GENERATED_BASE = '/images/generated/zhajinhua';

/** 与 manifest 不同步时的回退（与 manifest.json items.file 一致） */
const FALLBACK_GENERATED_FILES = [
  'lobby-bg.png',
  'table.png',
  'card-back.png',
  'chip-10.png',
  'chip-100.png',
  'chip-1000.png',
  'avatar-frame.png',
  'avatar-frame-vip.png',
  'btn-call.png',
  'btn-raise.png',
  'btn-fold.png',
  'btn-look.png',
  'btn-compare.png',
  'btn-all-in.png',
  'hand-banner-triple.png',
  'hand-banner-straight-flush.png',
  'hand-banner-flush.png',
  'victory-popup-bg.png',
  'pot-display-frame.png',
  'countdown-hint-frame.png',
  'game-logo-title.png',
  'deal-card-motion.png',
  'seat-empty-waiting.png',
  'dealer-intro.png',
] as const;

const EXTRA_URLS = ['/images/games/zhajinhua-cover.png', '/images/back.png'] as const;

function fallbackUrls(): string[] {
  return [...EXTRA_URLS, ...FALLBACK_GENERATED_FILES.map((f) => `${GENERATED_BASE}/${f}`)];
}

/**
 * 解析本次需要预加载的全部图片 URL（封面、返回键、manifest 内生成图）
 */
export async function resolveZhajinhuaPreloadUrls(): Promise<string[]> {
  try {
    const res = await fetch('/images/generated/zhajinhua/manifest.json', { cache: 'force-cache' });
    if (!res.ok) return fallbackUrls();
    const manifest = (await res.json()) as {
      basePath?: string;
      items?: Array<{ file: string }>;
    };
    const base = manifest.basePath ?? GENERATED_BASE;
    const items = manifest.items ?? [];
    const generated = items.map((it) => `${base}/${it.file}`);
    return [...EXTRA_URLS, ...generated];
  } catch {
    return fallbackUrls();
  }
}

/**
 * 预加载单张图片（失败不抛错，避免缺图阻塞进入游戏）
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof Image === 'undefined') {
      resolve();
      return;
    }
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}

/**
 * 预加载荷官 glb：等待整文件下载完成（`useGLTF.preload` 无 Promise，故用 fetch）
 * 进入游戏后 `ZhajinhuaDealerModel` 内仍会 `useGLTF.preload`，解析可走 HTTP 缓存
 */
export async function preloadDealerModelGlb(url: string = zjhAssets.dealerModelGlb): Promise<void> {
  try {
    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) return;
    await res.arrayBuffer();
  } catch {
    /* 忽略 */
  }
}
