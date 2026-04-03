/**
 * 炸金花（Zhajinhua）类型定义
 * 包含所有游戏相关的 TypeScript 类型
 */

// ==================== 基础枚举类型 ====================

/** 花色 */
export type Suit = 'spade' | 'heart' | 'club' | 'diamond';

/** 点数 */
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

/** 牌型 */
export type HandType = 'TRIPLE' | 'STRAIGHT_FLUSH' | 'FLUSH' | 'STRAIGHT' | 'PAIR' | 'HIGH_CARD';

/** 操作类型 */
export type ActionType = 'LOOK' | 'CALL' | 'RAISE' | 'ALL_IN' | 'COMPARE' | 'FOLD';

/** 房间状态 */
export type RoomStatus = 'WAITING' | 'PLAYING' | 'CLOSED';

/** 游戏状态 */
export type GameStatus = 'DEALING' | 'BETTING' | 'SHOWDOWN' | 'SETTLEMENT';

/** 玩家游戏内状态 */
export type PlayerStatus = 'WAITING' | 'READY' | 'PLAYING' | 'LOOKED' | 'FOLDED' | 'ALL_IN' | 'OUT';

// ==================== 核心数据结构 ====================

/** 一张扑克牌 */
export interface Card {
  suit: Suit;
  rank: Rank;
}

/** 手牌评估结果 */
export interface HandEvaluation {
  handType: HandType;
  handRank: number; // 用于快速比较的排名值，越大越好
  cards: Card[]; // 排序后的手牌
}

/** 牌型显示名称映射 */
export const HAND_TYPE_DISPLAY: Record<HandType, string> = {
  TRIPLE: '豹子',
  STRAIGHT_FLUSH: '顺金',
  FLUSH: '金花',
  STRAIGHT: '顺子',
  PAIR: '对子',
  HIGH_CARD: '散牌',
};

// ==================== 房间相关类型 ====================

/** 创建房间请求 */
export interface CreateRoomRequest {
  userId: string;
  maxPlayers?: number;
  baseAnte?: number;
  maxRounds?: number;
  turnTimeout?: number;
  minChips?: number;
}

/** 加入房间请求 */
export interface JoinRoomRequest {
  userId: string;
  roomCode: string;
}

/** 离开房间请求 */
export interface LeaveRoomRequest {
  userId: string;
  roomId: string;
}

/** 快速匹配请求 */
export interface MatchRoomRequest {
  userId: string;
}

/** 玩家准备请求 */
export interface ReadyRequest {
  userId: string;
  roomId: string;
  isReady: boolean;
}

/** 房间玩家信息 */
export interface RoomPlayerInfo {
  userId: string;
  username: string | null;
  avatar: string | null;
  seatIndex: number;
  chips: number;
  isReady: boolean;
  isOnline: boolean;
}

/** 房间信息响应 */
export interface RoomInfo {
  roomId: string;
  roomCode: string;
  ownerId: string;
  status: RoomStatus;
  minPlayers: number;
  maxPlayers: number;
  baseAnte: number;
  maxRounds: number;
  turnTimeout: number;
  currentPlayers: number;
  players: RoomPlayerInfo[];
}

// ==================== 游戏相关类型 ====================

/** 开始游戏请求 */
export interface StartGameRequest {
  userId: string;
  roomId: string;
}

/** 看牌请求 */
export interface LookRequest {
  userId: string;
  gameId: string;
}

/** 玩家操作请求 */
export interface ActionRequest {
  userId: string;
  gameId: string;
  actionType: 'CALL' | 'RAISE' | 'ALL_IN' | 'FOLD';
  amount?: number;
}

/** 比牌请求 */
export interface CompareRequest {
  userId: string;
  gameId: string;
  targetUserId: string;
}

/** 游戏中玩家信息 */
export interface GamePlayerInfo {
  userId: string;
  username?: string | null;
  avatar?: string | null;
  seatIndex: number;
  status: PlayerStatus;
  hasLooked: boolean;
  totalBet: number;
  hand: Card[] | null; // 非本人且未亮牌时为 null
  handType: HandType | null;
  handTypeDisplay?: string | null;
  chips?: number;
  chipsChange?: number;
  isWinner?: boolean;
}

/** 游戏状态响应 */
export interface GameStateResponse {
  gameId: string;
  roomId: string;
  status: GameStatus;
  pot: number;
  currentAnte: number;
  currentRound: number;
  currentTurn: string | null;
  dealerIndex: number;
  maxRounds: number;
  players: GamePlayerInfo[];
  recentActions: GameActionInfo[];
}

/** 操作记录信息 */
export interface GameActionInfo {
  userId: string;
  actionType: ActionType;
  amount: number;
  round: number;
  createdAt: string;
}

/** 对局结果响应 */
export interface GameResultResponse {
  gameId: string;
  winnerId: string | null;
  winnerHand: HandType | null;
  pot: number;
  players: GamePlayerInfo[];
  totalRounds: number;
  duration: number; // 秒
}

// ==================== 玩家数据类型 ====================

/** 玩家战绩响应 */
export interface PlayerStatsResponse {
  userId: string;
  currentChips: number;
  totalGames: number;
  totalWins: number;
  winRate: number;
  totalChipsWon: number;
  totalChipsLost: number;
  netProfit: number;
  maxSingleWin: number;
  handStats: {
    triple: number;
    straightFlush: number;
    flush: number;
    straight: number;
    pair: number;
    highCard: number;
  };
}

/** 对局历史记录 */
export interface GameHistoryRecord {
  gameId: string;
  roomCode: string;
  handType: HandType | null;
  handTypeDisplay: string | null;
  chipsChange: number;
  isWinner: boolean;
  totalPlayers: number;
  createdAt: string;
}

/** 每日筹码领取请求 */
export interface DailyBonusRequest {
  userId: string;
}

// ==================== API 通用响应 ====================

/** 统一 API 响应格式 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
