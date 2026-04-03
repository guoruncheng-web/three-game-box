/**
 * 牌桌页步骤式操作引导：高亮目标区域 + 底部说明，引导「点哪里、下一步」
 */

'use client';

import { useLayoutEffect, useState, type RefObject } from 'react';

import { Button } from 'antd-mobile';

/** 完成或跳过后写入，不再自动进入引导 */
export const ZJH_PLAYING_TOUR_STORAGE_KEY = 'zhajinhua_playing_tour_done_v1';

export const ZJH_PLAYING_TOUR_STEPS = [
  {
    title: '你的座位',
    description:
      '这里显示你的昵称与「我」标记。下方数字为当前剩余筹码，以及本局已下注金额。对局过程中请留意这里的变化。',
  },
  {
    title: '中央奖池',
    description:
      '奖池汇总本局桌面上的筹码。底注与当前轮次也会显示在这里，方便判断局面。',
  },
  {
    title: '你的手牌',
    description:
      '三张牌即你的手牌。未看牌前为背面；需要查看时请点击底部「看牌」按钮（会按规则提高后续跟注倍数）。',
  },
  {
    title: '底部操作区',
    description:
      '轮到你行动时，这里会出现「跟注、加注、弃牌、全押」等按钮；未看牌时还可点「看牌」。看牌后若仍在本局内，可能出现「比牌」。',
  },
  {
    title: '玩法说明',
    description:
      '随时可点右上角「玩法说明」查看牌型大小、闷牌与看牌规则等完整文字说明。',
  },
] as const;

export interface ZhajinhuaPlayingTourProps {
  /** 当前步骤 0 .. STEPS-1，为 null 时不渲染 */
  stepIndex: number | null;
  /** 与 ZJH_PLAYING_TOUR_STEPS 顺序一致：座位、奖池、手牌、底部栏、玩法按钮 */
  anchorRefs: readonly RefObject<HTMLElement | null>[];
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

function useMeasuredRect(ref: RefObject<HTMLElement | null>, active: boolean) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    if (!active || !ref.current) {
      setRect(null);
      return;
    }
    const el = ref.current;
    const update = () => {
      setRect(el.getBoundingClientRect());
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [ref, active]);

  return rect;
}

function ZhajinhuaPlayingTourContent({
  stepIndex,
  anchorRefs,
  onNext,
  onPrev,
  onSkip,
}: ZhajinhuaPlayingTourProps & { stepIndex: number }) {
  const ref = anchorRefs[stepIndex] ?? { current: null };
  const rect = useMeasuredRect(ref, true);

  const step = ZJH_PLAYING_TOUR_STEPS[stepIndex];
  const total = ZJH_PLAYING_TOUR_STEPS.length;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === total - 1;
  const pad = 8;

  return (
    <div
      className="fixed inset-0 z-[260] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby="zjh-playing-tour-title"
    >
      {/* 全屏遮罩：拦截操作，避免引导中途误触牌桌 */}
      <div
        className="absolute inset-0 bg-black/72 backdrop-blur-[1px]"
        aria-hidden
        onPointerDown={(e) => e.preventDefault()}
      />

      {rect ? (
        <div
          className="pointer-events-none fixed z-[261] rounded-2xl border-[3px] border-amber-400/95 shadow-[0_0_28px_rgba(251,191,36,0.55)]"
          style={{
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
          }}
        />
      ) : (
        <div className="pointer-events-none fixed inset-0 z-[261] flex items-center justify-center text-sm text-white/70">
          定位中…
        </div>
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[262] flex justify-center px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-6">
        <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-amber-500/35 bg-[#2a1a45]/98 p-4 shadow-2xl backdrop-blur-md">
          <p className="text-center text-[11px] font-bold uppercase tracking-widest text-amber-400/90">
            操作引导 {stepIndex + 1} / {total}
          </p>
          <h3 id="zjh-playing-tour-title" className="mt-1 text-center text-base font-black text-amber-100">
            {step.title}
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-white/88">{step.description}</p>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <Button fill="none" size="small" onClick={onSkip} className="text-white/65">
              跳过引导
            </Button>
            <div className="flex gap-2">
              {!isFirst ? (
                <Button fill="outline" size="small" color="warning" onClick={onPrev}>
                  上一步
                </Button>
              ) : (
                <span className="w-[72px]" />
              )}
              <Button color="primary" size="small" onClick={isLast ? onSkip : onNext}>
                {isLast ? '完成' : '下一步'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ZhajinhuaPlayingTour(props: ZhajinhuaPlayingTourProps) {
  const { stepIndex } = props;
  if (stepIndex === null || stepIndex < 0 || stepIndex >= ZJH_PLAYING_TOUR_STEPS.length) {
    return null;
  }
  return <ZhajinhuaPlayingTourContent {...props} stepIndex={stepIndex} />;
}
