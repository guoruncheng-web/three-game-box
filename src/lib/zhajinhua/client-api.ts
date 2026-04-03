/**
 * 炸金花前端 API 封装（对接 /api/zjh/*）
 */

import type {
  ApiResponse,
  Card,
  GameResultResponse,
  GameStateResponse,
  PlayerStatsResponse,
  RoomInfo,
} from '@/types/zjh';

async function parseJson<T>(res: Response): Promise<ApiResponse<T>> {
  const data = (await res.json()) as ApiResponse<T>;
  return data;
}

export async function zjhHumanVsBot(userId: string) {
  const res = await fetch('/api/zjh/rooms/human-vs-bot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  return parseJson<{
    roomId: string;
    roomCode: string;
    botUserId: string;
    isBotRoom: boolean;
  }>(res);
}

export async function zjhBotStep(gameId: string, userId: string) {
  const res = await fetch('/api/zjh/games/bot-step', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId, userId }),
  });
  return parseJson<{ done: boolean }>(res);
}

export async function zjhMatchRoom(userId: string) {
  const res = await fetch('/api/zjh/rooms/match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  return parseJson<{
    roomId: string;
    roomCode: string;
    isNewRoom: boolean;
    seatIndex: number;
  }>(res);
}

export async function zjhJoinRoom(userId: string, roomCode: string) {
  const res = await fetch('/api/zjh/rooms/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, roomCode }),
  });
  return parseJson<{
    roomId: string;
    seatIndex: number;
    players: Array<{
      userId: string;
      username: string | null;
      seatIndex: number;
      chips: number;
      isReady: boolean;
    }>;
  }>(res);
}

export async function zjhLeaveRoom(userId: string, roomId: string) {
  const res = await fetch('/api/zjh/rooms/leave', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, roomId }),
  });
  return parseJson<{ message: string; newOwnerId: string | null }>(res);
}

export async function zjhFetchRoom(roomId: string) {
  const res = await fetch(`/api/zjh/rooms/${roomId}`);
  return parseJson<RoomInfo>(res);
}

export async function zjhSetReady(userId: string, roomId: string, isReady: boolean) {
  const res = await fetch('/api/zjh/rooms/ready', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, roomId, isReady }),
  });
  return parseJson<{ isReady: boolean; allReady: boolean }>(res);
}

export async function zjhStartGame(userId: string, roomId: string) {
  const res = await fetch('/api/zjh/games/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, roomId }),
  });
  return parseJson<{
    gameId: string;
    gameIndex: number;
    dealerIndex: number;
    currentTurn: string;
    pot: number;
    currentAnte: number;
    players: Array<{
      userId: string;
      seatIndex: number;
      status: string;
      chips: number;
      hasLooked: boolean;
    }>;
  }>(res);
}

/** GET /api/zjh/games/:gameId 返回的 data 与 GameStateResponse 对齐 */
export async function zjhFetchGameState(gameId: string, userId: string) {
  const res = await fetch(
    `/api/zjh/games/${encodeURIComponent(gameId)}?userId=${encodeURIComponent(userId)}`
  );
  return parseJson<GameStateResponse>(res);
}

export async function zjhLook(userId: string, gameId: string) {
  const res = await fetch('/api/zjh/games/look', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, gameId }),
  });
  return parseJson<{
    hand: Card[];
    handType: string;
    handTypeDisplay: string;
  }>(res);
}

export async function zjhAction(
  userId: string,
  gameId: string,
  actionType: 'CALL' | 'RAISE' | 'ALL_IN' | 'FOLD',
  amount?: number
) {
  const res = await fetch('/api/zjh/games/action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, gameId, actionType, amount }),
  });
  return parseJson<{
    actionType: string;
    amount: number;
    pot: number;
    currentAnte: number;
    currentTurn: string | null;
    round: number;
    playerStatus: string;
    remainingChips: number;
    gameOver: boolean;
  }>(res);
}

export async function zjhCompare(userId: string, gameId: string, targetUserId: string) {
  const res = await fetch('/api/zjh/games/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, gameId, targetUserId }),
  });
  return parseJson<Record<string, unknown>>(res);
}

export async function zjhFetchGameResult(gameId: string) {
  const res = await fetch(`/api/zjh/games/${encodeURIComponent(gameId)}/result`);
  return parseJson<GameResultResponse>(res);
}

export async function zjhFetchStats(userId: string) {
  const res = await fetch(`/api/zjh/stats/${encodeURIComponent(userId)}`);
  return parseJson<PlayerStatsResponse>(res);
}
