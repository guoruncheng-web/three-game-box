/**
 * API 响应类型定义
 */

// ============ 通用响应类型 ============

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============ 用户相关类型 ============

export interface User {
  id: string;
  username?: string;
  email?: string;
  avatar?: string;
  isGuest: boolean;
  guestToken?: string;
  totalScore: number;
  gamesPlayed: number;
  highestScore: number;
  totalPlayTime: number;
  level: number;
  createdAt: Date;
}

export interface CreateGuestResponse {
  userId: string;
  guestToken: string;
  isGuest: boolean;
}

export interface UpdateUserRequest {
  username?: string;
  avatar?: string;
}

// ============ 游戏记录类型 ============

export interface GameRecord {
  id: string;
  userId: string;
  score: number;
  moves: number;
  targetScore: number;
  isWon: boolean;
  playTime: number;
  maxCombo: number;
  totalMatches: number;
  gameData?: GameData;
  createdAt: Date;
}

export interface GameData {
  gridSize: number;
  fruitsUsed: string[];
  moveHistory?: MoveHistory[];
  specialMoves?: {
    fourMatch?: number;
    fiveMatch?: number;
  };
}

export interface MoveHistory {
  from: [number, number];
  to: [number, number];
  score: number;
}

export interface SubmitGameRequest {
  userId: string;
  score: number;
  moves: number;
  targetScore?: number;
  isWon: boolean;
  playTime: number;
  maxCombo?: number;
  totalMatches?: number;
  gameData?: GameData;
}

export interface GameHistoryResponse {
  records: GameRecord[];
  total: number;
  limit: number;
  offset: number;
}

export interface GameStatsResponse {
  overview: {
    gamesPlayed: number;
    totalScore: number;
    highestScore: number;
    totalPlayTime: number;
    level: number;
    winRate: number;
  };
  averages: {
    avgScore: number;
    avgPlayTime: number;
    avgCombo: number;
  };
  records: {
    maxScore: number;
    maxCombo: number;
    totalGames: number;
  };
  recentGames: Array<{
    id: string;
    score: number;
    isWon: boolean;
    createdAt: Date;
  }>;
}

// ============ 排行榜类型 ============

export type LeaderboardType = 'ALL_TIME' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface LeaderboardEntry {
  id: string;
  userId: string;
  score: number;
  rank: number;
  user: {
    id: string;
    username?: string;
    avatar?: string;
    isGuest: boolean;
  };
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  userRank?: LeaderboardEntry;
  type: LeaderboardType;
  period: string;
}

// ============ 成就类型 ============

export type AchievementCategory = 'SCORE' | 'COMBO' | 'GAMES' | 'TIME' | 'SPECIAL';

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  condition: AchievementCondition;
  reward: number;
  isActive: boolean;
  createdAt: Date;
}

export interface AchievementCondition {
  type: string;
  target: number;
  operator?: 'gte' | 'lte' | 'eq';
  code?: string;
}

export interface UserAchievement extends Achievement {
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
}

export interface UserAchievementsResponse {
  achievements: UserAchievement[];
  stats: {
    total: number;
    unlocked: number;
    progress: number;
    totalReward: number;
  };
}

export interface CheckAchievementsRequest {
  userId: string;
  gameData: {
    score: number;
    maxCombo: number;
    moves: number;
    isWon: boolean;
  };
}

export interface CheckAchievementsResponse {
  unlockedCount: number;
  unlockedAchievements: Array<{
    id: string;
    userId: string;
    achievementId: string;
    progress: number;
    isUnlocked: boolean;
    unlockedAt: Date;
    achievement: {
      code: string;
      name: string;
      description: string;
      icon: string;
      reward: number;
    };
  }>;
}

// ============ 每日挑战类型 (预留) ============

export interface DailyChallenge {
  id: string;
  date: Date;
  name: string;
  description: string;
  targetScore: number;
  targetMoves: number;
  reward: number;
  config?: any;
  isActive: boolean;
}
