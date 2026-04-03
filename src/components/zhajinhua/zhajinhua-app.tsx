/**
 * 炸金花：大厅 → 房间 → 牌桌，对接 /api/zjh/*
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button, Dialog, Input, Toast } from 'antd-mobile';

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

export function ZhajinhuaApp() {
  const router = useRouter();
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
        Toast.show({ content: '初始化失败', position: 'bottom' });
      } finally {
        setIniting(false);
      }
    };
    void run();
  }, []);

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
        Toast.show({ content: res.error || '创建人机房间失败', position: 'bottom' });
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
        Toast.show({ content: res.error || '匹配失败', position: 'bottom' });
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
      Toast.show({ content: '请输入房间号', position: 'bottom' });
      return;
    }
    setBusy(true);
    try {
      const res = await zjhJoinRoom(userId, code);
      if (!res.success || !res.data) {
        Toast.show({ content: res.error || '加入失败', position: 'bottom' });
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
        Toast.show({ content: res.error || '操作失败', position: 'bottom' });
        return;
      }
      setRoomReady(!!res.data?.isReady);
      await refreshRoom();
      if (res.data?.allReady) {
        Toast.show({ content: '全员已准备，房主可开始', position: 'bottom' });
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
        Toast.show({ content: res.error || '无法开始', position: 'bottom' });
        return;
      }
      setGameId(res.data.gameId);
      settlementFetchedRef.current = false;
      setPhase('playing');
      setResult(null);
      Toast.show({ content: '游戏开始', position: 'bottom' });
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
        Toast.show({ content: res.error || '看牌失败', position: 'bottom' });
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
        Toast.show({ content: res.error || '操作失败', position: 'bottom' });
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
      Toast.show({ content: '金额超出范围', position: 'bottom' });
      return;
    }
    setRaiseOptionsOpen(false);
    setBusy(true);
    try {
      const res = await zjhAction(userId, gameId, 'RAISE', val);
      if (!res.success) {
        Toast.show({ content: res.error || '加注失败', position: 'bottom' });
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
        Toast.show({ content: res.error || '比牌失败', position: 'bottom' });
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
          phase === 'playing'
            ? 'linear-gradient(180deg, #12081f 0%, #1a0a2e 45%, #0d0618 100%)'
            : 'linear-gradient(to bottom, #1a0a2e, #2d1b4e)',
      }}
    >
      <header className="flex items-center gap-3 px-4 pt-[max(12px,env(safe-area-inset-top))] pb-3 shrink-0 z-10">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (phase === 'lobby') router.push('/');
              else {
                Dialog.confirm({
                  title: '离开房间？',
                  content: '进行中的对局将视为放弃（若可离开）',
                  onConfirm: () => void handleLeaveToLobby(),
                });
              }
            }}
            className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center active:scale-95 transition-transform touch-manipulation shrink-0"
            aria-label="返回"
          >
            <Image src="/images/back.png" alt="" width={24} height={24} />
          </button>
          <div className="relative h-9 min-w-0 flex-1 max-w-[140px]">
            <Image
              src={zjhAssets.gameLogoTitle}
              alt="炸金花"
              fill
              className="object-contain object-left"
              sizes="140px"
              unoptimized
            />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            ref={tourGuideBtnRef}
            type="button"
            onClick={() => setGuideOpen(true)}
            className="rounded-full border border-amber-400/45 bg-white/10 px-3 py-1.5 text-xs font-bold text-amber-100 touch-manipulation transition-transform active:scale-95"
          >
            玩法说明
          </button>
          <div
            className="rounded-full pl-2 pr-3 py-1.5 text-sm font-bold text-amber-200 flex items-center gap-1.5"
            style={{ background: 'rgba(0,0,0,0.35)' }}
          >
            <span className="relative w-7 h-7 shrink-0">
              <Image src={zjhAssets.chip1000} alt="" fill className="object-contain" unoptimized />
            </span>
            {chips}
          </div>
        </div>
      </header>

      {phase === 'lobby' && (
        <div className="relative flex-1 flex flex-col min-h-0">
          <Image
            src={zjhAssets.lobbyBg}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a2e]/75 via-[#1a0a2e]/45 to-[#0f0618]/80 pointer-events-none" />
          <div className="relative z-10 flex-1 flex flex-col px-4 pb-28 gap-6 overflow-y-auto">
          <div className="relative w-full max-w-[280px] mx-auto aspect-square rounded-3xl overflow-hidden shadow-2xl ring-2 ring-amber-400/30">
            <Image
              src="/images/games/zhajinhua-cover.png"
              alt="炸金花"
              fill
              className="object-cover"
              sizes="280px"
              priority
            />
          </div>
          <p className="text-center text-white/75 text-sm leading-relaxed">
            经典三张牌对战。人机模式无需等待真人；快速匹配可与在线玩家同桌。点击右上角「玩法说明」随时查看规则。
          </p>
          <Button
            color="primary"
            size="large"
            loading={busy}
            onClick={() => void handleHumanVsBot()}
            block
            style={{
              background: 'linear-gradient(90deg, #00bc7d, #00c950)',
              border: 'none',
            }}
          >
            人机对战（练习）
          </Button>
          <Button
            color="primary"
            size="large"
            loading={busy}
            onClick={() => void handleMatch()}
            block
            fill="outline"
            style={{
              borderColor: 'rgba(255,255,255,0.35)',
              color: '#fff',
            }}
          >
            快速匹配（真人）
          </Button>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="房间号"
              value={joinInput}
              onChange={setJoinInput}
              maxLength={8}
              className="flex-1"
            />
            <Button color="primary" fill="outline" loading={busy} onClick={() => void handleJoin()}>
              加入
            </Button>
          </div>
          </div>
        </div>
      )}

      {phase === 'room' && !roomInfo && (
        <div className="flex-1 flex items-center justify-center text-white/80">加载房间…</div>
      )}

      {phase === 'room' && roomInfo && (
        <div className="relative flex-1 flex flex-col min-h-0">
          <Image
            src={zjhAssets.lobbyBg}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/60 pointer-events-none" />
          <div className="relative z-10 flex-1 flex flex-col px-4 pb-28 gap-4 overflow-y-auto">
          <div
            className="rounded-2xl p-4 text-white backdrop-blur-[2px]"
            style={{ background: 'rgba(0,0,0,0.4)' }}
          >
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
                  Toast.show({ content: '已复制房间号', position: 'bottom' });
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
                className="flex items-center justify-between rounded-xl px-3 py-2 bg-white/10 text-white"
              >
                <span>
                  {shortName(p.userId, p.username)}
                  {p.userId === ownerId ? '（房主）' : ''}
                </span>
                <span className="text-amber-200 text-sm">{p.isReady ? '已准备' : '未准备'}</span>
              </div>
            ))}
          </div>

          <Button
            color="success"
            fill={roomReady ? 'outline' : 'solid'}
            loading={busy}
            onClick={() => void handleToggleReady()}
            block
            disabled={isOwner}
          >
            {isOwner ? '房主无需准备' : roomReady ? '取消准备' : '准备'}
          </Button>

          {isOwner && (
            <Button
              color="danger"
              loading={busy}
              onClick={() => void handleStartGame()}
              block
              disabled={roomInfo.currentPlayers < roomInfo.minPlayers}
            >
              开始游戏
            </Button>
          )}

          <Button fill="outline" onClick={() => void handleLeaveToLobby()} block>
            离开房间
          </Button>
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

          <div className="flex-1 flex flex-col min-h-0 px-1 pb-[calc(200px+env(safe-area-inset-bottom))] overflow-hidden">
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
              <div className="grid grid-cols-3 gap-2 pt-1">
                {(() => {
                  const { minBet, mid, maxBet, ante } = getRaiseAmounts();
                  return (
                    <>
                      <Button size="small" onClick={() => void handleRaiseAmount(minBet)}>
                        小 {minBet}
                      </Button>
                      <Button size="small" color="primary" onClick={() => void handleRaiseAmount(mid)}>
                        中 {mid}
                      </Button>
                      <Button size="small" color="warning" onClick={() => void handleRaiseAmount(maxBet)}>
                        大 {maxBet}
                      </Button>
                      <p className="col-span-3 text-center text-[11px] text-white/55">
                        当前底注 {ante}，点击档位加注
                      </p>
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
                className="w-full max-w-md rounded-t-2xl bg-[#2d1b4e] p-4 pb-[max(16px,env(safe-area-inset-bottom))] text-white"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-center font-bold mb-3">选择比牌对象</p>
                <div className="flex flex-col gap-2">
                  {gameState.players
                    .filter(
                      (p) =>
                        p.userId !== userId &&
                        p.status !== 'FOLDED' &&
                        p.status !== 'OUT'
                    )
                    .map((p) => (
                      <Button
                        key={p.userId}
                        color="primary"
                        fill="outline"
                        onClick={() => void runCompare(p.userId)}
                      >
                        {shortName(p.userId, p.username)}
                      </Button>
                    ))}
                </div>
                <Button className="mt-3" fill="none" block onClick={() => setCompareOpen(false)}>
                  取消
                </Button>
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
          <div
            className="w-full max-w-sm rounded-3xl p-6 text-white text-center space-y-3"
            style={{
              backgroundImage: `url(${zjhAssets.victoryPopupBg})`,
              backgroundSize: 'cover',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          >
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
                  <span className={p.isWinner ? 'text-green-300' : 'text-red-300'}>
                    {p.chipsChange != null ? (p.chipsChange >= 0 ? '+' : '') + p.chipsChange : ''}
                  </span>
                </div>
              ))}
            </div>
            <Button
              color="primary"
              block
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
            </Button>
            <Button fill="outline" block onClick={() => void handleLeaveToLobby()}>
              返回大厅
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
