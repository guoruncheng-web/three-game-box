/**
 * 炸金花：大厅 → 房间 → 牌桌，对接 /api/zjh/*
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button, Dialog, Input } from 'antd-mobile';

import { useToast } from '@/components/toast';
import { BET_MULTIPLIER } from '@/lib/zjh/constants';
import { ZJH_BOT_USER_ID } from '@/lib/zjh/bot-constants';
import { zjhAssets } from '@/lib/zhajinhua/assets';
import {
  zjhAction,
  zjhBotStep,
  zjhCompare,
  zjhFetchGameResult,
  zjhFetchGameState,
  zjhFetchRoom,
  zjhFetchStats,
  zjhHumanVsBot,
  zjhJoinRoom,
  zjhLeaveRoom,
  zjhLook,
  zjhMatchRoom,
  zjhSetReady,
  zjhStartGame,
} from '@/lib/zhajinhua/client-api';
import type { GamePlayerInfo, GameResultResponse, GameStateResponse, RoomInfo } from '@/types/zjh';

import { ZhajinhuaDealerIntro, ZJH_DEALER_INTRO_STORAGE_KEY } from './zhajinhua-dealer-intro';
import { ZhajinhuaGuidePopup, ZJH_GUIDE_STORAGE_KEY } from './zhajinhua-guide';
import {
  ZhajinhuaPlayingTour,
  ZJH_PLAYING_TOUR_STORAGE_KEY,
  ZJH_PLAYING_TOUR_STEPS,
} from './zhajinhua-playing-tour';
import { ZhajinhuaTableBoard } from './zhajinhua-table-board';
import { ZjhImageButton } from './zjh-image-button';

type Phase = 'lobby' | 'room' | 'playing' | 'settled';

function shortName(userId: string, username: string | null | undefined) {
  if (username) return username;
  return `玩家${userId.slice(0, 4)}`;
}

/** 与 globals 中 `.zjh-adm-dialog-root` / `.zjh-adm-dialog-body` 配套的炸金花确认弹窗 */
function zjhDialogConfirmSurface() {
  return {
    className: 'zjh-adm-dialog-root',
    bodyClassName: 'zjh-adm-dialog-body',
  };
}

export function ZhajinhuaApp() {
  const router = useRouter();
  const { showToast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [initing, setIniting] = useState(true);

  const [phase, setPhase] = useState<Phase>('lobby');
  const [chips, setChips] = useState<number>(0);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string>('');
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);

  const [gameId, setGameId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameStateResponse | null>(null);
  const [result, setResult] = useState<GameResultResponse | null>(null);
  const settlementFetchedRef = useRef(false);

  const [joinInput, setJoinInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [roomReady, setRoomReady] = useState(false);
  const [raiseOptionsOpen, setRaiseOptionsOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  /** 牌桌步骤引导：null 未进行，0..n 为当前步 */
  const [playingTourStep, setPlayingTourStep] = useState<number | null>(null);
  /** 荷官欢迎弹层（首次进入对局） */
  const [dealerIntroOpen, setDealerIntroOpen] = useState(false);
  /** 关闭荷官后递增，用于触发牌桌引导（与首次未写入 localStorage 的竞态解耦） */
  const [tourAfterDealerKick, setTourAfterDealerKick] = useState(0);

  const tourPotRef = useRef<HTMLDivElement>(null);
  const tourSelfSeatRef = useRef<HTMLDivElement>(null);
  const tourSelfCardsRef = useRef<HTMLDivElement>(null);
  const tourActionsRef = useRef<HTMLDivElement>(null);
  const tourGuideBtnRef = useRef<HTMLButtonElement>(null);

  const tourAnchors = useMemo(
    () => ({
      potRef: tourPotRef,
      selfSeatRef: tourSelfSeatRef,
      selfCardsRef: tourSelfCardsRef,
    }),
    []
  );

  const playingTourAnchorRefs = useMemo(
    () => [tourSelfSeatRef, tourPotRef, tourSelfCardsRef, tourActionsRef, tourGuideBtnRef] as const,
    []
  );

  const dismissGuide = useCallback(() => {
    setGuideOpen(false);
    try {
      localStorage.setItem(ZJH_GUIDE_STORAGE_KEY, '1');
    } catch {
      /* ignore quota / private mode */
    }
  }, []);

  /** 首次进入大厅时自动弹出玩法说明（已读过则不再弹出） */
  useEffect(() => {
    if (initing || !userId || phase !== 'lobby') return;
    try {
      if (localStorage.getItem(ZJH_GUIDE_STORAGE_KEY) === '1') return;
    } catch {
      /* 读失败则仍尝试展示 */
    }
    setGuideOpen(true);
  }, [initing, userId, phase]);

  /** 首次进入对局：延迟弹出荷官欢迎（已看过则不再） */
  useEffect(() => {
    if (phase !== 'playing' || !gameState) return;
    let cancelled = false;
    try {
      if (localStorage.getItem(ZJH_DEALER_INTRO_STORAGE_KEY) === '1') return;
    } catch {
      /* 读失败仍尝试展示 */
    }
    const id = window.setTimeout(() => {
      if (!cancelled) setDealerIntroOpen(true);
    }, 520);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [phase, gameState?.gameId]);

  /** 荷官欢迎结束后（或已看过）再自动开始牌桌步骤引导 */
  useEffect(() => {
    if (phase !== 'playing' || !gameState) return;
    try {
      if (localStorage.getItem(ZJH_PLAYING_TOUR_STORAGE_KEY) === '1') return;
    } catch {
      return;
    }
    try {
      if (localStorage.getItem(ZJH_DEALER_INTRO_STORAGE_KEY) !== '1') return;
    } catch {
      return;
    }
    const id = window.setTimeout(() => setPlayingTourStep(0), 500);
    return () => clearTimeout(id);
  }, [phase, gameState?.gameId, tourAfterDealerKick]);

  const closeDealerIntro = useCallback(() => {
    setDealerIntroOpen(false);
    try {
      localStorage.setItem(ZJH_DEALER_INTRO_STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
    setTourAfterDealerKick((k) => k + 1);
  }, []);

  /** 离开对局时关闭步骤引导与荷官弹层 */
  useEffect(() => {
    if (phase !== 'playing') {
      setPlayingTourStep(null);
      setDealerIntroOpen(false);
    }
  }, [phase]);

  const finishPlayingTour = useCallback(() => {
    setPlayingTourStep(null);
    try {
      localStorage.setItem(ZJH_PLAYING_TOUR_STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
  }, []);

  const handlePlayingTourNext = useCallback(() => {
    setPlayingTourStep((s) => {
      if (s === null) return null;
      return s < ZJH_PLAYING_TOUR_STEPS.length - 1 ? s + 1 : s;
    });
  }, []);

  const handlePlayingTourPrev = useCallback(() => {
    setPlayingTourStep((s) => (s !== null && s > 0 ? s - 1 : s));
  }, []);

  /** 初始化游客用户（与首页一致） */
  useEffect(() => {
    const run = async () => {
      try {
        let id = localStorage.getItem('userId');
        if (!id) {
          const res = await fetch('/api/users/guest', { method: 'POST' });
          if (res.ok) {
            const { data } = await res.json();
            id = data.userId;
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('guestToken', data.guestToken);
          }
        }
        setUserId(id);
        if (id) {
          const st = await zjhFetchStats(id);
          if (st.success && st.data) setChips(st.data.currentChips);
        }
      } catch {
        showToast('error', '初始化失败');
      } finally {
        setIniting(false);
      }
    };
    void run();
  }, [showToast]);

  const refreshStats = useCallback(async () => {
    if (!userId) return;
    const st = await zjhFetchStats(userId);
    if (st.success && st.data) setChips(st.data.currentChips);
  }, [userId]);

  const refreshRoom = useCallback(async () => {
    if (!roomId) return;
    const res = await zjhFetchRoom(roomId);
    if (res.success && res.data) {
      setRoomInfo(res.data);
      setRoomCode(res.data.roomCode);
      setOwnerId(res.data.ownerId);
      const me = res.data.players.find((p) => p.userId === userId);
      if (me) setRoomReady(me.isReady);
    }
  }, [roomId, userId]);

  const refreshGame = useCallback(async () => {
    if (!gameId || !userId) return;
    const res = await zjhFetchGameState(gameId, userId);
    if (res.success && res.data) {
      setGameState(res.data);
      if (
        (res.data.status === 'SETTLEMENT' || res.data.status === 'SHOWDOWN') &&
        !settlementFetchedRef.current
      ) {
        settlementFetchedRef.current = true;
        const r = await zjhFetchGameResult(gameId);
        if (r.success && r.data) {
          setResult(r.data);
          setPhase('settled');
          await refreshStats();
        }
      }
    }
  }, [gameId, userId, refreshStats]);

  /** 房间内轮询 */
  useEffect(() => {
    if (phase !== 'room' || !roomId) return;
    void refreshRoom();
    const t = setInterval(() => void refreshRoom(), 2000);
    return () => clearInterval(t);
  }, [phase, roomId, refreshRoom]);

  /** 对局中轮询游戏 + 房间（筹码） */
  useEffect(() => {
    if (phase !== 'playing' || !gameId || !roomId) return;
    void refreshGame();
    void refreshRoom();
    const t = setInterval(() => {
      void refreshGame();
      void refreshRoom();
    }, 1500);
    return () => clearInterval(t);
  }, [phase, gameId, roomId, refreshGame, refreshRoom]);

  /** 轮到机器人时由前端触发服务端走牌（无需真人） */
  const botBusyRef = useRef(false);
  useEffect(() => {
    if (phase !== 'playing' || !gameId || !userId || !gameState) return;
    if (gameState.status !== 'BETTING') return;
    if (gameState.currentTurn !== ZJH_BOT_USER_ID) return;
    if (botBusyRef.current) return;
    botBusyRef.current = true;
    void (async () => {
      try {
        const res = await zjhBotStep(gameId, userId);
        if (res.success) {
          await refreshGame();
          await refreshRoom();
        }
      } finally {
        botBusyRef.current = false;
      }
    })();
  }, [phase, gameId, userId, gameState?.currentTurn, gameState?.status, refreshGame, refreshRoom]);

  const isBotRoom = useMemo(
    () => roomInfo?.players.some((p) => p.userId === ZJH_BOT_USER_ID) ?? false,
    [roomInfo]
  );

  const chipMap = useMemo(() => {
    const m = new Map<string, number>();
    roomInfo?.players.forEach((p) => m.set(p.userId, p.chips));
    return m;
  }, [roomInfo]);

  const handleHumanVsBot = async () => {
    if (!userId) return;
    setBusy(true);
    try {
      const res = await zjhHumanVsBot(userId);
      if (!res.success || !res.data) {
        showToast('error', res.error || '创建人机房间失败');
        return;
      }
      setRoomId(res.data.roomId);
      setRoomCode(res.data.roomCode);
      setPhase('room');
      setGameId(null);
      setGameState(null);
      setResult(null);
      settlementFetchedRef.current = false;
      await refreshStats();
      await refreshRoom();
    } finally {
      setBusy(false);
    }
  };

  const handleMatch = async () => {
    if (!userId) return;
    setBusy(true);
    try {
      const res = await zjhMatchRoom(userId);
      if (!res.success || !res.data) {
        showToast('error', res.error || '匹配失败');
        return;
      }
      setRoomId(res.data.roomId);
      setRoomCode(res.data.roomCode);
      setPhase('room');
      setGameId(null);
      setGameState(null);
      setResult(null);
      settlementFetchedRef.current = false;
      await refreshStats();
      await refreshRoom();
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async () => {
    if (!userId) return;
    const code = joinInput.trim();
    if (code.length < 4) {
      showToast('warning', '请输入房间号');
      return;
    }
    setBusy(true);
    try {
      const res = await zjhJoinRoom(userId, code);
      if (!res.success || !res.data) {
        showToast('error', res.error || '加入失败');
        return;
      }
      setRoomId(res.data.roomId);
      setPhase('room');
      setGameId(null);
      setGameState(null);
      setResult(null);
      settlementFetchedRef.current = false;
      await refreshRoom();
    } finally {
      setBusy(false);
    }
  };

  const handleToggleReady = async () => {
    if (!userId || !roomId) return;
    setBusy(true);
    try {
      const res = await zjhSetReady(userId, roomId, !roomReady);
      if (!res.success) {
        showToast('error', res.error || '操作失败');
        return;
      }
      setRoomReady(!!res.data?.isReady);
      await refreshRoom();
      if (res.data?.allReady) {
        showToast('success', '全员已准备，房主可开始');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleStartGame = async () => {
    if (!userId || !roomId) return;
    setBusy(true);
    try {
      const res = await zjhStartGame(userId, roomId);
      if (!res.success || !res.data) {
        showToast('error', res.error || '无法开始');
        return;
      }
      setGameId(res.data.gameId);
      settlementFetchedRef.current = false;
      setPhase('playing');
      setResult(null);
      showToast('success', '游戏开始');
    } finally {
      setBusy(false);
    }
  };

  const handleLeaveToLobby = async () => {
    if (!userId || !roomId) return;
    setBusy(true);
    try {
      await zjhLeaveRoom(userId, roomId);
    } catch {
      /* 仍回到大厅 */
    } finally {
      setRoomId(null);
      setRoomInfo(null);
      setGameId(null);
      setGameState(null);
      setResult(null);
      setPhase('lobby');
      setRoomReady(false);
      setBusy(false);
      await refreshStats();
    }
  };

  const handleLook = async () => {
    if (!userId || !gameId) return;
    setBusy(true);
    try {
      const res = await zjhLook(userId, gameId);
      if (!res.success) {
        showToast('error', res.error || '看牌失败');
        return;
      }
      await refreshGame();
    } finally {
      setBusy(false);
    }
  };

  const handleAction = async (action: 'CALL' | 'FOLD' | 'ALL_IN') => {
    if (!userId || !gameId) return;
    setBusy(true);
    try {
      const res = await zjhAction(userId, gameId, action);
      if (!res.success) {
        showToast('error', res.error || '操作失败');
        return;
      }
      if (res.data?.gameOver) {
        await refreshGame();
        await refreshStats();
      } else {
        await refreshGame();
      }
    } finally {
      setBusy(false);
    }
  };

  const getRaiseAmounts = () => {
    if (!gameState || !userId) return { minBet: 0, mid: 0, maxBet: 0, ante: 0 };
    const me = gameState.players.find((p) => p.userId === userId);
    if (!me) return { minBet: 0, mid: 0, maxBet: 0, ante: 0 };
    const hasLooked = me.hasLooked;
    const ante = gameState.currentAnte;
    const minBet = hasLooked ? ante * 2 : ante;
    const maxBet = ante * BET_MULTIPLIER.MAX_RAISE;
    const mid = Math.round((minBet + maxBet) / 2);
    return { minBet, mid: Math.min(maxBet, Math.max(minBet, mid)), maxBet, ante };
  };

  const handleRaiseAmount = async (val: number) => {
    if (!userId || !gameId || !gameState) return;
    const { minBet, maxBet } = getRaiseAmounts();
    if (val < minBet || val > maxBet) {
      showToast('warning', '金额超出范围');
      return;
    }
    setRaiseOptionsOpen(false);
    setBusy(true);
    try {
      const res = await zjhAction(userId, gameId, 'RAISE', val);
      if (!res.success) {
        showToast('error', res.error || '加注失败');
        return;
      }
      await refreshGame();
    } finally {
      setBusy(false);
    }
  };

  const runCompare = async (targetUserId: string) => {
    if (!userId || !gameId) return;
    setCompareOpen(false);
    setBusy(true);
    try {
      const res = await zjhCompare(userId, gameId, targetUserId);
      if (!res.success) {
        showToast('error', res.error || '比牌失败');
        return;
      }
      await refreshGame();
      await refreshStats();
    } finally {
      setBusy(false);
    }
  };

  const myPlayer: GamePlayerInfo | undefined = useMemo(
    () => gameState?.players.find((p) => p.userId === userId),
    [gameState, userId]
  );
  const isMyTurn = gameState?.currentTurn === userId;
  const isOwner = userId === ownerId;

  useEffect(() => {
    if (!isMyTurn) setRaiseOptionsOpen(false);
  }, [isMyTurn]);

  if (initing || !userId) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#1a0a2e] text-white">
        加载中…
      </div>
    );
  }

  return (
    <div
      className="min-h-[100dvh] flex flex-col relative overflow-hidden"
      style={{
        background:
          phase === 'playing' || phase === 'lobby' || phase === 'room'
            ? 'transparent'
            : 'linear-gradient(to bottom, #1a0a2e, #2d1b4e)',
      }}
    >
      {/* 大厅 / 房间：大厅背景图铺满整个视口 */}
      {phase === 'lobby' || phase === 'room' ? (
        <div className="pointer-events-none fixed inset-0 z-0">
          <Image
            src={zjhAssets.lobbyBg}
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
            unoptimized
          />
          <div
            className={`absolute inset-0 ${
              phase === 'room' && roomInfo
                ? 'bg-gradient-to-b from-black/55 via-black/35 to-black/60'
                : 'bg-gradient-to-b from-[#1a0a2e]/75 via-[#1a0a2e]/45 to-[#0f0618]/80'
            }`}
          />
        </div>
      ) : null}

      {/* 对局中：牌桌图铺满整个屏幕（含安全区），操作区仍叠在上层 */}
      {phase === 'playing' && gameState ? (
        <div className="pointer-events-none fixed inset-0 z-0">
          <Image
            src={zjhAssets.tableBg}
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
        </div>
      ) : null}

      <header className="flex items-center gap-3 px-4 pt-[max(12px,env(safe-area-inset-top))] pb-3 shrink-0 z-10">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (phase === 'lobby') {
                Dialog.confirm({
                  title: '返回游戏首页？',
                  content: '将离开炸金花大厅，未加入房间无损失。',
                  ...zjhDialogConfirmSurface(),
                  onConfirm: () => void router.push('/'),
                });
              } else {
                Dialog.confirm({
                  title: '离开房间？',
                  content: '进行中的牌局将按规则处理，确定要离开吗？',
                  ...zjhDialogConfirmSurface(),
                  onConfirm: () => void handleLeaveToLobby(),
                });
              }
            }}
            className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl p-0 active:scale-95 touch-manipulation transition-transform"
            aria-label="返回"
          >
            <Image
              src={zjhAssets.backButton}
              alt=""
              width={56}
              height={56}
              className="h-full w-full object-contain"
              unoptimized
            />
          </button>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            ref={tourGuideBtnRef}
            type="button"
            onClick={() => setGuideOpen(true)}
            className="rounded-full border border-amber-400/50 bg-white/10 px-3 py-1.5 text-xs font-bold text-amber-100 touch-manipulation transition-transform active:scale-95"
          >
            玩法说明
          </button>
          <div
            className="rounded-full pl-2 pr-3 py-1.5 text-sm font-bold text-amber-200 flex items-center gap-1.5 border border-amber-400/40 tabular-nums"
            style={{ background: 'rgba(0,0,0,0.40)' }}
          >
            <span className="relative w-5 h-5 shrink-0">
              <Image src={zjhAssets.chip1000} alt="" fill className="object-contain" unoptimized />
            </span>
            {chips}
          </div>
        </div>
      </header>

      {phase === 'lobby' && (
        <div className="relative z-[1] flex-1 flex flex-col min-h-0">
          <div className="relative z-10 flex-1 flex flex-col px-4 pb-28 gap-3 overflow-y-auto">
          <div className="relative mx-auto w-full max-w-[min(68vw,252px)] aspect-square shrink-0 rounded-3xl overflow-hidden shadow-[0_0_36px_rgba(234,179,8,0.28)] ring-2 ring-amber-400/30">
            <Image
              src="/zhajinhua/logo.png"
              alt="炸金花"
              fill
              className="object-cover"
              sizes="(max-width: 430px) 68vw, 252px"
              priority
            />
          </div>
          <p className="text-center text-white/75 text-sm leading-relaxed">
            经典三张牌对战。人机模式无需等待真人；快速匹配可与在线玩家同桌。点击右上角「玩法说明」随时查看规则。
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleHumanVsBot()}
            className="w-full min-h-[52px] rounded-2xl font-bold text-white text-base bg-gradient-to-r from-amber-500 to-amber-600 active:scale-[0.97] transition-transform touch-manipulation flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(245,158,11,0.4)]"
          >
            {busy ? (
              <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : null}
            人机对战（练习）
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleMatch()}
            className="w-full min-h-[52px] rounded-2xl font-bold text-amber-100 text-base border border-amber-400/50 active:scale-[0.97] transition-transform touch-manipulation flex items-center justify-center gap-2"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            {busy ? (
              <span className="w-5 h-5 rounded-full border-2 border-amber-200/30 border-t-amber-200 animate-spin" />
            ) : null}
            快速匹配（真人）
          </button>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="输入房间号"
              value={joinInput}
              onChange={(e) => setJoinInput(e.target.value)}
              maxLength={8}
              className="flex-1 h-[52px] rounded-xl px-4 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-amber-400/60 border border-white/20"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleJoin()}
              className="h-[52px] px-5 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-amber-500 to-amber-600 active:scale-[0.97] transition-transform touch-manipulation shrink-0"
            >
              加入
            </button>
          </div>
          </div>
        </div>
      )}

      {phase === 'room' && !roomInfo && (
        <div className="relative z-[1] flex-1 flex items-center justify-center text-white/80">加载房间…</div>
      )}

      {phase === 'room' && roomInfo && (
        <div className="relative z-[1] flex-1 flex flex-col min-h-0">
          <div className="relative z-10 flex-1 flex flex-col px-4 pb-28 gap-4 overflow-y-auto">
          <div className="rounded-2xl p-4 text-white backdrop-blur-sm bg-black/40 border border-amber-400/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-amber-200 font-bold">
                房间 {roomInfo.roomCode}
                {isBotRoom ? (
                  <span className="ml-2 text-xs font-bold text-emerald-300">· 人机</span>
                ) : null}
              </span>
              <Button
                size="mini"
                color="warning"
                fill="outline"
                onClick={() => {
                  void navigator.clipboard.writeText(roomInfo.roomCode);
                  showToast('success', '已复制房间号');
                }}
              >
                复制
              </Button>
            </div>
            <p className="text-xs text-white/65">
              底注 {roomInfo.baseAnte} · 人数 {roomInfo.currentPlayers}/{roomInfo.maxPlayers} · 至少{' '}
              {roomInfo.minPlayers} 人开局
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-bold text-sm">玩家</h3>
            {roomInfo.players.map((p) => (
              <div
                key={p.userId}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 bg-white/8 border border-white/10 text-white"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${p.isReady ? 'bg-emerald-400' : 'bg-white/30'}`} />
                  <span>{shortName(p.userId, p.username)}</span>
                  {p.userId === ownerId && (
                    <span className="text-amber-300 text-xs font-bold ml-1">房主</span>
                  )}
                </div>
                <span className={`text-sm font-bold ${p.isReady ? 'text-emerald-300' : 'text-white/50'}`}>
                  {p.isReady ? '已准备' : '未准备'}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => void handleToggleReady()}
            disabled={busy || isOwner}
            className={`min-h-[52px] w-full rounded-2xl font-bold active:scale-[0.97] transition-transform touch-manipulation
              ${isOwner
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white opacity-50 cursor-not-allowed'
                : roomReady
                  ? 'bg-transparent border border-amber-400/50 text-amber-200'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
              }`}
          >
            {isOwner ? '房主无需准备' : roomReady ? '取消准备' : '准备'}
          </button>

          {isOwner && (
            <div>
              <button
                onClick={() => void handleStartGame()}
                disabled={busy || roomInfo.currentPlayers < roomInfo.minPlayers}
                className="w-full min-h-[52px] rounded-2xl font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 active:scale-[0.97] transition-transform touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
              >
                开始游戏
              </button>
              {roomInfo.currentPlayers < roomInfo.minPlayers && (
                <p className="text-center text-xs text-white/50 mt-1">人数不足</p>
              )}
            </div>
          )}

          <button
            onClick={() => void handleLeaveToLobby()}
            disabled={busy}
            className="w-full min-h-[44px] rounded-2xl font-bold text-white/70 border border-white/25 active:scale-[0.97] transition-transform touch-manipulation"
          >
            离开房间
          </button>
          </div>
        </div>
      )}

      {phase === 'playing' && gameState && (
        <>
          <ZhajinhuaDealerIntro
            visible={dealerIntroOpen}
            pot={gameState.pot}
            currentAnte={gameState.currentAnte}
            currentRound={gameState.currentRound}
            onClose={closeDealerIntro}
          />

          <div className="relative z-[1] flex-1 flex flex-col min-h-0 px-1 pb-[calc(200px+env(safe-area-inset-bottom))] overflow-hidden">
            <ZhajinhuaTableBoard
              gameState={gameState}
              userId={userId}
              chipMap={chipMap}
              shortName={shortName}
              tourAnchors={tourAnchors}
            />
          </div>

          <div
            ref={tourActionsRef}
            className="fixed left-0 right-0 bottom-0 z-20 px-3 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 space-y-2 animate-slide-up"
            style={{
              background: 'linear-gradient(180deg, transparent, rgba(26,10,46,0.98) 35%)',
            }}
          >
            {myPlayer && !myPlayer.hasLooked && gameState.status === 'BETTING' && (
              <ZjhImageButton
                src={zjhAssets.btnLook}
                label="看牌"
                loading={busy}
                onClick={() => void handleLook()}
              />
            )}

            {isMyTurn && gameState.status === 'BETTING' && (
              <div className="grid grid-cols-2 gap-2">
                <ZjhImageButton
                  src={zjhAssets.btnCall}
                  label="跟注"
                  loading={busy}
                  onClick={() => void handleAction('CALL')}
                />
                <ZjhImageButton
                  src={zjhAssets.btnRaise}
                  label="加注"
                  loading={busy}
                  onClick={() => setRaiseOptionsOpen((v) => !v)}
                />
                <ZjhImageButton
                  src={zjhAssets.btnFold}
                  label="弃牌"
                  loading={busy}
                  onClick={() => void handleAction('FOLD')}
                />
                <ZjhImageButton
                  src={zjhAssets.btnAllIn}
                  label="全押"
                  loading={busy}
                  onClick={() => void handleAction('ALL_IN')}
                />
              </div>
            )}

            {isMyTurn &&
              gameState.status === 'BETTING' &&
              myPlayer?.hasLooked &&
              myPlayer.status !== 'FOLDED' &&
              myPlayer.status !== 'OUT' && (
                <ZjhImageButton
                  src={zjhAssets.btnCompare}
                  label="比牌"
                  loading={busy}
                  onClick={() => setCompareOpen(true)}
                />
              )}

            {raiseOptionsOpen && isMyTurn && gameState.status === 'BETTING' && (
              <div className="rounded-2xl border border-amber-400/30 bg-black/60 backdrop-blur-md p-3 animate-slide-up">
                <p className="text-center text-sm font-bold text-amber-200 mb-2">选择加注金额</p>
                {(() => {
                  const { minBet, mid, maxBet, ante } = getRaiseAmounts();
                  return (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => void handleRaiseAmount(minBet)}
                          className="h-[44px] rounded-xl border border-white/30 text-white text-sm font-bold active:scale-[0.97] transition-transform touch-manipulation"
                        >
                          小 {minBet}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleRaiseAmount(mid)}
                          className="h-[44px] rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-bold active:scale-[0.97] transition-transform touch-manipulation"
                        >
                          中 {mid}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleRaiseAmount(maxBet)}
                          className="h-[44px] rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold active:scale-[0.97] transition-transform touch-manipulation"
                        >
                          大 {maxBet}
                        </button>
                      </div>
                      <p className="text-center text-[11px] text-white/55 mt-2">当前底注 {ante}，点击档位加注</p>
                    </>
                  );
                })()}
              </div>
            )}

          </div>

          <ZhajinhuaPlayingTour
            stepIndex={playingTourStep}
            anchorRefs={playingTourAnchorRefs}
            onNext={handlePlayingTourNext}
            onPrev={handlePlayingTourPrev}
            onSkip={finishPlayingTour}
          />

          {compareOpen && gameState && (
            <div
              className="fixed inset-0 z-[100] flex items-end justify-center bg-black/55"
              role="presentation"
              onClick={() => setCompareOpen(false)}
            >
              <div
                className="w-full max-w-md rounded-t-3xl p-4 pb-[max(16px,env(safe-area-inset-bottom))] text-white"
                style={{ background: 'linear-gradient(180deg, #3d2666 0%, #1a0f2e 100%)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mb-4" />
                <p className="text-center font-bold text-amber-200 mb-3">选择比牌对象</p>
                {(() => {
                  const candidates = gameState.players.filter(
                    (p) => p.userId !== userId && p.status !== 'FOLDED' && p.status !== 'OUT'
                  );
                  return candidates.length === 0 ? (
                    <p className="text-center text-white/50 text-sm py-4">暂无可比牌对象</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {candidates.map((p) => (
                        <button
                          key={p.userId}
                          type="button"
                          onClick={() => void runCompare(p.userId)}
                          className="h-[48px] rounded-xl border border-amber-400/50 text-amber-100 font-bold active:scale-[0.97] transition-transform touch-manipulation"
                        >
                          {shortName(p.userId, p.username)}
                        </button>
                      ))}
                    </div>
                  );
                })()}
                <button
                  type="button"
                  className="mt-3 w-full h-[44px] rounded-xl border border-white/20 text-white/70 active:scale-[0.97] transition-transform touch-manipulation"
                  onClick={() => setCompareOpen(false)}
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <ZhajinhuaGuidePopup
        visible={guideOpen}
        onClose={dismissGuide}
        onReplayPlayingTour={
          phase === 'playing'
            ? () => {
                dismissGuide();
                setPlayingTourStep(0);
              }
            : undefined
        }
      />

      {phase === 'settled' && result && (
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-24">
          {(() => {
            const isWinner = result.winnerId === userId;
            const isDraw = !result.winnerId;
            const resultIcon = isDraw ? '🤝' : isWinner ? '🏆' : '💔';
            return (
              <div
                className={`w-full max-w-sm rounded-3xl p-6 text-white text-center space-y-3 ${isWinner ? 'shadow-[0_0_60px_rgba(234,179,8,0.4)]' : ''}`}
                style={{
                  backgroundImage: `url(${zjhAssets.victoryPopupBg})`,
                  backgroundSize: 'cover',
                  backgroundColor: 'rgba(0,0,0,0.45)',
                }}
              >
                <div className="text-4xl">{resultIcon}</div>
                <h2 className="text-xl font-black text-amber-200">本局结束</h2>
                <p>
                  胜者：
                  {result.winnerId
                    ? shortName(
                        result.winnerId,
                        result.players.find((p) => p.userId === result.winnerId)?.username ?? null
                      )
                    : '平局'}
                </p>
                <p className="text-sm text-white/80">奖池 {result.pot}</p>
                <div className="text-left text-sm space-y-2 max-h-48 overflow-y-auto">
                  {result.players.map((p) => (
                    <div key={p.userId} className="flex justify-between">
                      <span>{shortName(p.userId, p.username)}</span>
                      <span className={p.isWinner ? 'text-emerald-300' : 'text-red-400'}>
                        {p.chipsChange != null ? (p.chipsChange >= 0 ? '+' : '') + p.chipsChange : ''}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="w-full min-h-[52px] rounded-2xl font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 active:scale-[0.97] transition-transform touch-manipulation"
                  onClick={() => {
                    settlementFetchedRef.current = false;
                    setPhase('room');
                    setGameId(null);
                    setGameState(null);
                    setResult(null);
                    void refreshRoom();
                    void refreshStats();
                  }}
                >
                  返回房间
                </button>
                <button
                  type="button"
                  className="w-full min-h-[44px] rounded-2xl font-bold text-white/70 border border-white/25 active:scale-[0.97] transition-transform touch-manipulation"
                  onClick={() => void handleLeaveToLobby()}
                >
                  返回大厅
                </button>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
