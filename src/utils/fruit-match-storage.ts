/**
 * 水果消消乐本地存档（避免 PWA / 返回页面时仅内存状态丢失）
 */

const STORAGE_KEY = 'fruit-match-game-v1';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export interface FruitMatchGameStateSnapshot {
  grid: (string | null)[][];
  score: number;
  moves: number;
  selectedCell: { row: number; col: number } | null;
  isPaused: boolean;
  isSoundOn: boolean;
  gameOver: boolean;
  gameWon: boolean;
}

export interface FruitMatchPersistPayload {
  v: 1;
  savedAt: number;
  gameState: FruitMatchGameStateSnapshot;
  introStarted: boolean;
  introFinished: boolean;
  introLocked: boolean;
  gameStartTime: number;
}

function isValidGrid(grid: unknown, size: number): grid is (string | null)[][] {
  if (!Array.isArray(grid) || grid.length !== size) return false;
  return grid.every((row) => Array.isArray(row) && row.length === size);
}

/**
 * 读取存档；无效或过期则返回 null 并清除
 */
export function loadFruitMatchGame(gridSize: number): FruitMatchPersistPayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as FruitMatchPersistPayload;
    if (data.v !== 1 || !data.savedAt || !data.gameState) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    if (Date.now() - data.savedAt > MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    if (!isValidGrid(data.gameState.grid, gridSize)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function saveFruitMatchGame(payload: Omit<FruitMatchPersistPayload, 'v' | 'savedAt'> & { savedAt?: number }): void {
  if (typeof window === 'undefined') return;
  try {
    const full: FruitMatchPersistPayload = {
      v: 1,
      savedAt: payload.savedAt ?? Date.now(),
      gameState: payload.gameState,
      introStarted: payload.introStarted,
      introFinished: payload.introFinished,
      introLocked: payload.introLocked,
      gameStartTime: payload.gameStartTime,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
  } catch {
    /* 配额满等 */
  }
}

export function clearFruitMatchGame(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
