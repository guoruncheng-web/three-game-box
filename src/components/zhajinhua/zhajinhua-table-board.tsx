/**
 * 炸金花牌桌视图：中央奖池 + 环形座位（非列表）
 */

'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react';

import { zjhAssets, zjhHandBannerUrl } from '@/lib/zhajinhua/assets';
import type { Card, GamePlayerInfo, GameStateResponse } from '@/types/zjh';

import { PokerCard } from './poker-card';

/** 牌桌操作引导锚点（与 ZhajinhuaPlayingTour 步骤顺序一致：座位 → 奖池 → 手牌） */
export interface ZhajinhuaTourAnchors {
  potRef: RefObject<HTMLDivElement | null>;
  selfSeatRef: RefObject<HTMLDivElement | null>;
  selfCardsRef: RefObject<HTMLDivElement | null>;
}

export interface ZhajinhuaTableBoardProps {
  gameState: GameStateResponse;
  userId: string;
  chipMap: Map<string, number>;
  shortName: (userId: string, username: string | null | undefined) => string;
  tourAnchors?: ZhajinhuaTourAnchors;
}

/** 把自己转到索引 0，座位按顺时针从「自己」开始排列，便于底部为本人视角 */
function rotatePlayersMeFirst(players: GamePlayerInfo[], myUserId: string): GamePlayerInfo[] {
  const sorted = [...players].sort((a, b) => a.seatIndex - b.seatIndex);
  const myIdx = sorted.findIndex((p) => p.userId === myUserId);
  if (myIdx <= 0) return sorted;
  return [...sorted.slice(myIdx), ...sorted.slice(0, myIdx)];
}

/**
 * 环形座位：索引 0 在正下方，其余逆时针均分圆（俯视牌桌）
 */
function seatPolarStyle(index: number, total: number): CSSProperties {
  const rPct = total <= 2 ? 36 : total <= 4 ? 38 : 40;
  const θ = Math.PI + (index * 2 * Math.PI) / total;
  return {
    position: 'absolute',
    left: `${50 + rPct * Math.sin(θ)}%`,
    top: `${50 - rPct * Math.cos(θ)}%`,
    transform: 'translate(-50%, -50%)',
    maxWidth: total > 4 ? 'min(28vw, 120px)' : 'min(42vw, 200px)',
    width: 'max-content',
  };
}

export function ZhajinhuaTableBoard({
  gameState,
  userId,
  chipMap,
  shortName,
  tourAnchors,
}: ZhajinhuaTableBoardProps) {
  const ordered = useMemo(
    () => rotatePlayersMeFirst(gameState.players, userId),
    [gameState.players, userId]
  );
  const n = ordered.length;

  /** 奖池金额变化时触发一次性缩放，避免首帧误触 */
  const prevPotRef = useRef<number | null>(null);
  const [potBump, setPotBump] = useState(false);
  useEffect(() => {
    const pot = gameState.pot;
    if (prevPotRef.current !== null && prevPotRef.current !== pot) {
      setPotBump(true);
      const t = window.setTimeout(() => setPotBump(false), 700);
      prevPotRef.current = pot;
      return () => clearTimeout(t);
    }
    prevPotRef.current = pot;
  }, [gameState.pot]);

  const recentFeedKey = useMemo(() => {
    const list = gameState.recentActions ?? [];
    if (list.length === 0) return 'empty';
    return `${list[0]?.createdAt ?? ''}-${list.length}`;
  }, [gameState.recentActions]);

  return (
    <div className="flex-1 flex flex-col min-h-0 px-2 pb-2">
      {/* 牌桌区域：背景图为全屏层（见 zhajinhua-app），此处仅布局奖池与座位 */}
      <div className="relative flex-1 min-h-[min(72vh,520px)] w-full">
        {/* 中央奖池：透明磨砂底 + CSS 金边与内高光动效（不再使用黑底 pot-display-frame 整图铺底） */}
        <div
          ref={tourAnchors?.potRef}
          className="absolute left-1/2 top-1/2 z-[1] w-[min(72%,260px)] -translate-x-1/2 -translate-y-1/2"
        >
          <div className={`relative w-full ${potBump ? 'animate-zjh-pot-bump' : ''}`}>
            <div className="rounded-2xl bg-gradient-to-br from-amber-200/85 via-amber-500/65 to-amber-900/78 p-[2px] shadow-[0_0_28px_rgba(234,179,8,0.4)] animate-zjh-pot-ring-glow">
              <div className="relative overflow-hidden rounded-[14px] bg-gradient-to-b from-black/42 via-emerald-950/12 to-black/52 px-4 py-3 text-center backdrop-blur-md">
                <div
                  className="pointer-events-none absolute inset-0 rounded-[14px] bg-[radial-gradient(ellipse_95%_65%_at_50%_-5%,rgba(251,191,36,0.28),transparent_58%)] animate-zjh-pot-inner-glint"
                  aria-hidden
                />
                <div className="relative z-[1]">
                  <p className="text-[10px] font-bold tracking-widest text-amber-100/90">奖池</p>
                  <p className="text-xl font-black tabular-nums leading-tight text-amber-200 animate-zjh-pot-text-shimmer">
                    {gameState.pot}
                  </p>
                  <p className="mt-1 text-[11px] text-white/78">
                    底注 {gameState.currentAnte} · 第 {gameState.currentRound} 轮
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 座位 */}
        {ordered.map((p, i) => {
          const isDealer = p.seatIndex === gameState.dealerIndex;
          const isTurn = gameState.currentTurn === p.userId;
          const isSelf = p.userId === userId;
          const chipsLeft = chipMap.get(p.userId);

          return (
            <div
              key={p.userId}
              ref={isSelf ? tourAnchors?.selfSeatRef : undefined}
              className={`z-[2] flex flex-col items-center gap-1.5 ${isTurn ? 'animate-zjh-turn-breathe' : ''}`}
              style={seatPolarStyle(i, n)}
            >
              {/* 头像条：manifest 头像框 */}
              <div
                className="relative flex items-center justify-center gap-1 px-3 py-1.5 text-[11px] font-bold text-white whitespace-nowrap max-w-[min(44vw,220px)] min-h-[36px]"
                style={{
                  backgroundImage: `url(${zjhAssets.avatarFrame})`,
                  backgroundSize: '100% 100%',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                <span className="truncate max-w-[min(36vw,160px)] drop-shadow-sm">
                  {shortName(p.userId, p.username)}
                  {isSelf ? '（我）' : ''}
                </span>
                {isDealer ? <span className="shrink-0">🎰</span> : null}
              </div>

              {/* 三张牌：分张入场（仅在局/轮/手牌标识变化时重播） */}
              <div
                ref={isSelf ? tourAnchors?.selfCardsRef : undefined}
                key={`${gameState.gameId}-r${gameState.currentRound}-${p.userId}-${
                  p.hand?.length ? JSON.stringify(p.hand) : 'back'
                }`}
                className={`flex gap-0.5 justify-center ${
                  isSelf ? 'scale-105' : 'scale-95 opacity-95'
                }`}
              >
                {p.hand && p.hand.length > 0
                  ? (p.hand as Card[]).map((c, idx) => (
                      <div
                        key={idx}
                        className="animate-zjh-card-lift-in"
                        style={{ animationDelay: `${idx * 70}ms` }}
                      >
                        <PokerCard card={c} className="!w-[46px] !h-[64px] sm:!w-[52px] sm:!h-[72px]" />
                      </div>
                    ))
                  : [0, 1, 2].map((idx) => (
                      <div
                        key={idx}
                        className="animate-zjh-card-lift-in"
                        style={{ animationDelay: `${idx * 70}ms` }}
                      >
                        <PokerCard
                          faceDown
                          className="!w-[46px] !h-[64px] sm:!w-[52px] sm:!h-[72px]"
                        />
                      </div>
                    ))}
              </div>

              {p.handTypeDisplay ? (
                (() => {
                  const banner = zjhHandBannerUrl(p.handType ?? null);
                  return banner ? (
                    <div className="relative w-[min(72vw,200px)] h-8 mx-auto">
                      <Image
                        src={banner}
                        alt={p.handTypeDisplay}
                        fill
                        className="object-contain"
                        sizes="200px"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <p className="text-[10px] font-bold text-amber-200/95 text-center leading-tight max-w-[min(44vw,200px)] line-clamp-2 drop-shadow-md">
                      {p.handTypeDisplay}
                    </p>
                  );
                })()
              ) : null}

              <div className="text-[10px] text-amber-100/85 tabular-nums">
                {chipsLeft != null ? `${chipsLeft}` : '—'} 筹码 · 下注 {p.totalBet}
              </div>
            </div>
          );
        })}
      </div>

      {/* 最近操作：单行折叠条，不占牌桌主视觉 */}
      {(gameState.recentActions?.length ?? 0) > 0 && (
        <div
          className="shrink-0 mt-1 mb-1 relative min-h-[48px] flex items-center justify-center px-2"
          style={{
            backgroundImage: `url(${zjhAssets.countdownHintFrame})`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        >
          <div
            key={recentFeedKey}
            className="relative z-10 text-[10px] text-white/90 text-center line-clamp-2 px-2 animate-fade-in-up"
          >
            {(gameState.recentActions ?? [])
              .slice(0, 3)
              .map((a, i) => {
                const uname = gameState.players.find((pl) => pl.userId === a.userId)?.username;
                return (
                  <span key={i}>
                    {i > 0 ? ' · ' : ''}
                    {shortName(a.userId, uname)} {a.actionType}
                    {a.amount > 0 ? ` +${a.amount}` : ''}
                  </span>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
