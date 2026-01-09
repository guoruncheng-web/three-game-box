/**
 * 游戏状态管理 - Redux Toolkit
 */

import { createSlice, configureStore, PayloadAction } from '@reduxjs/toolkit';
import type { Game, GameState, GameSettings } from '@/types/game';

/** 游戏 Slice 状态 */
interface GameSliceState {
  // 当前游戏
  currentGame: Game | null;
  gameState: GameState;
  
  // 游戏数据
  score: number;
  bestScore: number;
  lives: number;
  level: number;
  coins: number;
  
  // 游戏列表
  games: Game[];
  isLoading: boolean;
  error: string | null;
  
  // 设置
  settings: GameSettings;
}

const initialSettings: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  musicVolume: 0.7,
  sfxVolume: 1.0,
  vibrationEnabled: true,
  quality: 'high',
};

const initialState: GameSliceState = {
  currentGame: null,
  gameState: 'idle',
  score: 0,
  bestScore: 0,
  lives: 3,
  level: 1,
  coins: 0,
  games: [],
  isLoading: false,
  error: null,
  settings: initialSettings,
};

/** 游戏 Slice */
const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    // 设置当前游戏
    setCurrentGame: (state, action: PayloadAction<Game | null>) => {
      state.currentGame = action.payload;
    },
    
    // 设置游戏状态
    setGameState: (state, action: PayloadAction<GameState>) => {
      state.gameState = action.payload;
    },
    
    // 开始游戏
    startGame: (state) => {
      state.gameState = 'playing';
      state.score = 0;
      state.lives = 3;
      state.level = 1;
    },
    
    // 暂停游戏
    pauseGame: (state) => {
      if (state.gameState === 'playing') {
        state.gameState = 'paused';
      }
    },
    
    // 继续游戏
    resumeGame: (state) => {
      if (state.gameState === 'paused') {
        state.gameState = 'playing';
      }
    },
    
    // 游戏结束
    endGame: (state) => {
      state.gameState = 'gameover';
      if (state.score > state.bestScore) {
        state.bestScore = state.score;
      }
    },
    
    // 游戏胜利
    winGame: (state) => {
      state.gameState = 'win';
      if (state.score > state.bestScore) {
        state.bestScore = state.score;
      }
    },
    
    // 重置游戏
    resetGame: (state) => {
      state.gameState = 'idle';
      state.score = 0;
      state.lives = 3;
      state.level = 1;
    },
    
    // 更新分数
    updateScore: (state, action: PayloadAction<number>) => {
      state.score += action.payload;
    },
    
    // 设置分数
    setScore: (state, action: PayloadAction<number>) => {
      state.score = action.payload;
    },
    
    // 失去生命
    loseLife: (state) => {
      state.lives = Math.max(0, state.lives - 1);
      if (state.lives === 0) {
        state.gameState = 'gameover';
      }
    },
    
    // 获得生命
    gainLife: (state) => {
      state.lives = Math.min(5, state.lives + 1);
    },
    
    // 下一关
    nextLevel: (state) => {
      state.level += 1;
    },
    
    // 获得金币
    addCoins: (state, action: PayloadAction<number>) => {
      state.coins += action.payload;
    },
    
    // 设置游戏列表
    setGames: (state, action: PayloadAction<Game[]>) => {
      state.games = action.payload;
    },
    
    // 设置加载状态
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    // 设置错误
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // 更新设置
    updateSettings: (state, action: PayloadAction<Partial<GameSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
  },
});

// 导出 actions
export const {
  setCurrentGame,
  setGameState,
  startGame,
  pauseGame,
  resumeGame,
  endGame,
  winGame,
  resetGame,
  updateScore,
  setScore,
  loseLife,
  gainLife,
  nextLevel,
  addCoins,
  setGames,
  setLoading,
  setError,
  updateSettings,
} = gameSlice.actions;

import authReducer, { restoreAuth } from './authStore';

// 创建 store
export const store = configureStore({
  reducer: {
    game: gameSlice.reducer,
    auth: authReducer,
  },
});

// 立即从 localStorage 恢复认证状态（在浏览器环境）
if (typeof window !== 'undefined') {
  store.dispatch(restoreAuth());
}

// 类型定义
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;