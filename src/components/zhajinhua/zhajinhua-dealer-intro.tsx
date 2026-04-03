/**
 * 对局开始后荷官欢迎弹层：自下跳出 + 口播奖池信息（荷官 GLB 模型 + 文案）
 */

'use client';

import dynamic from 'next/dynamic';
import { Button } from 'antd-mobile';

import { zjhAssets } from '@/lib/zhajinhua/assets';

const ZhajinhuaDealerModel = dynamic(
  () => import('./zhajinhua-dealer-model').then((m) => m.ZhajinhuaDealerModel),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(58vh,460px)] w-full max-w-[340px] items-center justify-center rounded-lg bg-black/15 text-[13px] text-amber-100/80">
        荷官模型加载中…
      </div>
    ),
  }
);

/** 已看过荷官欢迎则不再自动弹出 */
export const ZJH_DEALER_INTRO_STORAGE_KEY = 'zhajinhua_dealer_intro_seen_v1';

export interface ZhajinhuaDealerIntroProps {
  visible: boolean;
  pot: number;
  currentAnte: number;
  currentRound: number;
  onClose: () => void;
}

export function ZhajinhuaDealerIntro({
  visible,
  pot,
  currentAnte,
  currentRound,
  onClose,
}: ZhajinhuaDealerIntroProps) {
  if (!visible) return null;

  return (
    <div
      className="animate-zjh-dealer-backdrop-in fixed inset-0 z-[280] flex flex-col justify-end bg-black/62 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="zjh-dealer-intro-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="关闭背景"
        onClick={onClose}
      />

      <div className="relative z-[1] mx-auto flex w-full max-w-md flex-col items-center px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-2">
        {/* 口播气泡在上，角色自下跳出 */}
        <div className="animate-zjh-dealer-bubble-in relative z-[2] mb-2 w-full rounded-2xl border border-amber-300/50 bg-gradient-to-b from-[#fffdf8] to-[#f5efe6] px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
          <p
            id="zjh-dealer-intro-title"
            className="relative z-[1] text-center text-[15px] font-bold leading-snug text-[#2d1a18]"
          >
            欢迎来到本桌！
          </p>
          <p className="relative z-[1] mt-2 text-center text-[13px] leading-relaxed text-[#4a372f]">
            中央<strong className="text-amber-800">奖池</strong>目前已累积{' '}
            <strong className="tabular-nums text-amber-700">{pot}</strong> 筹码；本局底注{' '}
            <strong className="tabular-nums text-amber-700">{currentAnte}</strong>，当前第{' '}
            <strong className="tabular-nums text-amber-700">{currentRound}</strong> 轮。祝您好运！
          </p>
        </div>

        <div className="animate-zjh-dealer-pop-in relative z-[1] flex w-[min(92vw,340px)] justify-center">
          <ZhajinhuaDealerModel modelUrl={zjhAssets.dealerModelGlb} />
        </div>

        <div className="relative z-[2] mt-2 w-full max-w-xs">
          <Button color="primary" block size="large" onClick={onClose}>
            知道了，开始游戏
          </Button>
        </div>
      </div>
    </div>
  );
}
