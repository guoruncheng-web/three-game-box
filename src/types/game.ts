/**
 * 游戏相关类型定义
 */

/** 游戏分类 */
export type GameCategory = 
  | 'action'    // 动作
  | 'puzzle'    // 益智
  | 'arcade'    // 街机
  | 'casual'    // 休闲
  | 'racing'    // 竞速
  | 'shooter'   // 射击
  | 'sports';   // 体育

/** 游戏难度 */
export type GameDifficulty = 'easy' | 'medium' | 'hard';

/** 游戏状态 */
export type GameState = 'idle' | 'loading' | 'playing' | 'paused' | 'gameover' | 'win';

/** 游戏信息 */
export interface Game {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  icon: string;
  category: GameCategory;
  difficulty: GameDifficulty;
  rating: number;
  playCount: number;
  isHot?: boolean;
  isNew?: boolean;
  createdAt: string;
  updatedAt: string;
}

/** 游戏配置 */
export interface GameConfig {
  id: string;
  name: string;
  maxLives: number;
  maxLevel: number;
  initialScore: number;
  settings: GameSettings;
}

/** 游戏设置 */
export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  vibrationEnabled: boolean;
  quality: 'low' | 'medium' | 'high';
}

/** 游戏分数记录 */
export interface GameScore {
  gameId: string;
  score: number;
  stars: number;
  level: number;
  playedAt: string;
  duration: number;
}

/** 游戏 HUD 属性 */
export interface GameHUDProps {
  score: number;
  lives: number;
  level: number;
  coins: number;
  time?: number;
  isPaused?: boolean;
  onPause?: () => void;
  onSettings?: () => void;
}

/** 游戏结束属性 */
export interface GameOverProps {
  score: number;
  bestScore: number;
  stars: number;
  coins: number;
  onRestart: () => void;
  onHome: () => void;
  onShare?: () => void;
}

/** 玩家位置（3D） */
export interface Position3D {
  x: number;
  y: number;
  z: number;
}

/** 玩家旋转（欧拉角） */
export interface Rotation3D {
  x: number;
  y: number;
  z: number;
}
