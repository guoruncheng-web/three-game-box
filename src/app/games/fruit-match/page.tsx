/**
 * 水果消消乐游戏页面
 * 基于 Figma 设计实现
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AuthGuard } from '@/components/auth/AuthGuard';
import dynamic from 'next/dynamic';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';
import { useGameSounds } from '@/hooks/useGameSounds';
import {
  clearFruitMatchGame,
  loadFruitMatchGame,
  saveFruitMatchGame,
} from '@/utils/fruit-match-storage';

// 动态导入 Canvas 包装组件以避免 SSR 问题
const FruitMatchCanvas = dynamic(
  () => import('@/components/three/fruit-match/FruitMatchCanvas').then((mod) => mod.FruitMatchCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    ),
  }
);

// 图标路径
const iconBack = '/images/back.png';
const iconSound = '/images/voice.png';
const iconPause = '/images/restore.png';
const iconScore = '/images/fruit-match/icon-score.svg';
const iconTarget = '/images/fruit-match/icon-target.svg';
const iconMoves = '/images/fruit-match/icon-moves.svg';

// 普通水果类型
type NormalFruitType = '🍇' | '🍋' | '🍉' | '🍊' | '🍎' | '🍒' | '🍓';

// 特殊水果类型
type SpecialFruitType = '💣' | '🌈' | '🎃';

// 所有水果类型
type FruitType = NormalFruitType | SpecialFruitType;

const FRUITS: NormalFruitType[] = ['🍇', '🍋', '🍉', '🍊', '🍎', '🍒', '🍓'];

// 特殊水果配置
const SPECIAL_FRUITS = {
  BOMB: '💣' as SpecialFruitType,      // 炸弹：消除周围3x3区域
  RAINBOW: '🌈' as SpecialFruitType,   // 彩虹：消除所有同色水果
  PUMPKIN: '🎃' as SpecialFruitType,   // 南瓜：十字消除（横竖一排）
};

// 游戏配置
const GRID_SIZE = 8;
const TARGET_SCORE = 1000;
const INITIAL_MOVES = 30;

// 游戏状态
interface GameState {
  grid: (FruitType | null)[][];
  score: number;
  moves: number;
  selectedCell: { row: number; col: number } | null;
  isPaused: boolean;
  isSoundOn: boolean;
  gameOver: boolean;
  gameWon: boolean;
}

// 成就数据类型
interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  reward: number;
}

// 交换动画状态
interface SwapAnimationState {
  cell1: { row: number; col: number };
  cell2: { row: number; col: number };
}

// 匹配结果类型
interface MatchResult {
  cells: Set<string>;                    // 匹配的单元格
  specialFruit?: {                       // 要生成的特殊水果
    type: SpecialFruitType;
    position: { row: number; col: number };
  };
}

export default function FruitMatchPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>({
    grid: [],
    score: 0,
    moves: INITIAL_MOVES,
    selectedCell: null,
    isPaused: false,
    isSoundOn: true,
    gameOver: false,
    gameWon: false,
  });
  const [matchedCells, setMatchedCells] = useState<Set<string>>(new Set());
  const [swapAnimation, setSwapAnimation] = useState<SwapAnimationState | null>(null);

  // 用户和游戏统计
  const [userId, setUserId] = useState<string | null>(null);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [currentCombo, setCurrentCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [totalMatches, setTotalMatches] = useState<number>(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [showAchievementModal, setShowAchievementModal] = useState<boolean>(false);

  /** 开场「Let's go」已触发（首次交互后），用于 UI */
  const [introStarted, setIntroStarted] = useState(false);
  /** 开场结束后再播 BGM */
  const [introFinished, setIntroFinished] = useState(false);
  const introLockRef = useRef(false);
  const introTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameInitDoneRef = useRef(false);
  const isFirstSoundMountRef = useRef(true);

  // 音效系统
  const {
    playClickSound,
    playSwapSound,
    playMatchSound,
    playScoreSound,
    playWinSound,
    playLoseSound,
    playLetsGoSound,
  } = useGameSounds({ enabled: gameState.isSoundOn });

  // 音效：关闭时跳过开场；从关→开时重走开场。首次挂载不重置开场（避免覆盖本地存档恢复）
  useEffect(() => {
    if (isFirstSoundMountRef.current) {
      isFirstSoundMountRef.current = false;
      if (!gameState.isSoundOn) {
        setIntroStarted(true);
        setIntroFinished(true);
      }
      return;
    }
    if (!gameState.isSoundOn) {
      setIntroStarted(true);
      setIntroFinished(true);
    } else {
      setIntroStarted(false);
      setIntroFinished(false);
      introLockRef.current = false;
    }
  }, [gameState.isSoundOn]);

  // 网格就绪且开启音效：首次点击/按键后播放 Let's go，约 1.5s 后再播背景音乐（满足浏览器音频策略）
  useEffect(() => {
    if (!gameState.isSoundOn || gameState.grid.length === 0 || introLockRef.current) {
      return undefined;
    }

    const startIntro = () => {
      if (introLockRef.current) return;
      introLockRef.current = true;
      setIntroStarted(true);
      playLetsGoSound();
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('keydown', onInteract);
      introTimerRef.current = setTimeout(() => {
        setIntroFinished(true);
        introTimerRef.current = null;
      }, 1500);
    };

    const onInteract = () => {
      startIntro();
    };

    window.addEventListener('pointerdown', onInteract, { passive: true });
    window.addEventListener('keydown', onInteract);

    return () => {
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('keydown', onInteract);
      if (introTimerRef.current) {
        clearTimeout(introTimerRef.current);
        introTimerRef.current = null;
      }
    };
  }, [gameState.isSoundOn, gameState.grid.length, playLetsGoSound]);

  // 背景音乐：开场结束后与音效开关、暂停、结算状态联动
  const bgMusicEnabled =
    gameState.isSoundOn &&
    introFinished &&
    !gameState.isPaused &&
    !gameState.gameOver &&
    !gameState.gameWon;

  useBackgroundMusic({
    enabled: bgMusicEnabled,
    volume: 0.35,
    loop: true,
  });

  // 检查是否有匹配（3个或更多相同水果）- 增强版，支持特殊水果生成
  const findMatches = useCallback((grid: (FruitType | null)[][]): MatchResult => {
    const matches = new Set<string>();
    let specialFruit: MatchResult['specialFruit'] = undefined;

    // 检查水平匹配
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE - 2; col++) {
        const fruit = grid[row][col];
        if (fruit === null || Object.values(SPECIAL_FRUITS).includes(fruit as SpecialFruitType)) continue;

        // 检查是否有3个或更多相同的水果
        let matchCount = 1;
        for (let c = col + 1; c < GRID_SIZE; c++) {
          if (grid[row][c] === fruit) {
            matchCount++;
          } else {
            break;
          }
        }

        if (matchCount >= 3) {
          const matchCells: string[] = [];
          for (let c = col; c < col + matchCount; c++) {
            const cellKey = `${row}-${c}`;
            matches.add(cellKey);
            matchCells.push(cellKey);
          }

          // 生成特殊水果
          if (matchCount >= 5 && !specialFruit) {
            // 5连消或以上 → 彩虹水果（中间位置）
            const centerCol = col + Math.floor(matchCount / 2);
            specialFruit = {
              type: SPECIAL_FRUITS.RAINBOW,
              position: { row, col: centerCol },
            };
          } else if (matchCount === 4 && !specialFruit) {
            // 4连消 → 炸弹（中间位置）100%
            const centerCol = col + Math.floor(matchCount / 2);
            specialFruit = {
              type: SPECIAL_FRUITS.BOMB,
              position: { row, col: centerCol },
            };
          } else if (matchCount === 3 && !specialFruit) {
            // 3连消 → 60% 概率生成炸弹
            if (Math.random() < 0.6) {
              const centerCol = col + Math.floor(matchCount / 2);
              specialFruit = {
                type: SPECIAL_FRUITS.BOMB,
                position: { row, col: centerCol },
              };
              console.log('🎲 3连消幸运触发！生成炸弹');
            }
          }
        }
      }
    }

    // 检查垂直匹配
    for (let col = 0; col < GRID_SIZE; col++) {
      for (let row = 0; row < GRID_SIZE - 2; row++) {
        const fruit = grid[row][col];
        if (fruit === null || Object.values(SPECIAL_FRUITS).includes(fruit as SpecialFruitType)) continue;

        // 检查是否有3个或更多相同的水果
        let matchCount = 1;
        for (let r = row + 1; r < GRID_SIZE; r++) {
          if (grid[r][col] === fruit) {
            matchCount++;
          } else {
            break;
          }
        }

        if (matchCount >= 3) {
          const matchCells: string[] = [];
          for (let r = row; r < row + matchCount; r++) {
            const cellKey = `${r}-${col}`;
            matches.add(cellKey);
            matchCells.push(cellKey);
          }

          // 生成特殊水果
          if (matchCount >= 5 && !specialFruit) {
            // 5连消或以上 → 彩虹水果（中间位置）
            const centerRow = row + Math.floor(matchCount / 2);
            specialFruit = {
              type: SPECIAL_FRUITS.RAINBOW,
              position: { row: centerRow, col },
            };
          } else if (matchCount === 4 && !specialFruit) {
            // 4连消 → 炸弹（中间位置）100%
            const centerRow = row + Math.floor(matchCount / 2);
            specialFruit = {
              type: SPECIAL_FRUITS.BOMB,
              position: { row: centerRow, col },
            };
          } else if (matchCount === 3 && !specialFruit) {
            // 3连消 → 60% 概率生成炸弹
            if (Math.random() < 0.6) {
              const centerRow = row + Math.floor(matchCount / 2);
              specialFruit = {
                type: SPECIAL_FRUITS.BOMB,
                position: { row: centerRow, col },
              };
              console.log('🎲 3连消幸运触发！生成炸弹');
            }
          }
        }
      }
    }

    return { cells: matches, specialFruit };
  }, []);

  // 初始化游戏网格
  const initializeGrid = useCallback((): (FruitType | null)[][] => {
    const grid: (FruitType | null)[][] = [];
    let attempts = 0;
    const maxAttempts = 100;

    // 生成初始网格，确保没有匹配
    do {
      for (let row = 0; row < GRID_SIZE; row++) {
        grid[row] = [];
        for (let col = 0; col < GRID_SIZE; col++) {
          // 随机选择水果，但避免初始就有匹配
          let fruit: FruitType = FRUITS[0]; // 默认值
          let valid = false;
          let tries = 0;

          while (!valid && tries < 50) {
            const candidateFruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
            valid = true;

            // 检查水平匹配（左侧两个）
            if (col >= 2 && grid[row][col - 1] === candidateFruit && grid[row][col - 2] === candidateFruit) {
              valid = false;
            }
            // 检查垂直匹配（上方两个）
            if (row >= 2 && grid[row - 1]?.[col] === candidateFruit && grid[row - 2]?.[col] === candidateFruit) {
              valid = false;
            }

            if (valid) {
              fruit = candidateFruit;
            }

            tries++;
          }

          grid[row][col] = fruit;
        }
      }

      // 检查整个网格是否有匹配
      const matchResult = findMatches(grid);
      if (matchResult.cells.size === 0) {
        break;
      }

      attempts++;
    } while (attempts < maxAttempts);

    return grid;
  }, [findMatches]);

  // 初始化用户
  useEffect(() => {
    const initUser = async () => {
      try {
        // 从 localStorage 获取 userId
        let storedUserId = localStorage.getItem('userId');

        if (!storedUserId) {
          // 创建新的游客用户
          const response = await fetch('/api/users/guest', {
            method: 'POST',
          });

          if (response.ok) {
            const { data } = await response.json();
            storedUserId = data.userId;
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('guestToken', data.guestToken);
            console.log('✓ 创建新用户:', data.userId);
          } else {
            console.error('创建用户失败');
          }
        } else {
          console.log('✓ 使用已存在的用户:', storedUserId);
        }

        setUserId(storedUserId);
      } catch (error) {
        console.error('用户初始化失败:', error);
      }
    };

    initUser();
  }, []);

  // 初始化游戏：优先恢复本地存档（PWA/返回页面时保留进度）
  useEffect(() => {
    if (gameInitDoneRef.current) return;
    gameInitDoneRef.current = true;

    const saved = loadFruitMatchGame(GRID_SIZE);
    if (saved) {
      setGameState((prev) => ({
        ...prev,
        grid: saved.gameState.grid as (FruitType | null)[][],
        score: saved.gameState.score,
        moves: saved.gameState.moves,
        selectedCell: saved.gameState.selectedCell,
        isPaused: saved.gameState.isPaused,
        isSoundOn: saved.gameState.isSoundOn,
        gameOver: saved.gameState.gameOver,
        gameWon: saved.gameState.gameWon,
      }));
      setIntroStarted(saved.introStarted);
      setIntroFinished(saved.introFinished);
      introLockRef.current = saved.introLocked;
      setGameStartTime(saved.gameStartTime || Date.now());
      setMaxCombo(0);
      setTotalMatches(0);
      setCurrentCombo(0);
      console.log('🎮 已恢复本地游戏进度');
      return;
    }

    const initialGrid = initializeGrid();

    let hasSpecialFruit = false;
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const fruit = initialGrid[row][col];
        if (fruit && Object.values(SPECIAL_FRUITS).includes(fruit as SpecialFruitType)) {
          hasSpecialFruit = true;
          console.error('❌ 初始网格包含特殊水果！', fruit, '位置:', [row, col]);
        }
      }
    }

    if (!hasSpecialFruit) {
      console.log('✅ 初始网格验证通过：没有特殊水果');
    }

    setGameState((prev) => ({
      ...prev,
      grid: initialGrid,
    }));

    setGameStartTime(Date.now());
    setMaxCombo(0);
    setTotalMatches(0);
    setCurrentCombo(0);

    console.log('🎮 游戏初始化完成');
  }, [initializeGrid]);

  // 自动保存进度（防抖）
  useEffect(() => {
    if (gameState.grid.length === 0) return;
    const id = window.setTimeout(() => {
      saveFruitMatchGame({
        gameState: {
          grid: gameState.grid as (string | null)[][],
          score: gameState.score,
          moves: gameState.moves,
          selectedCell: gameState.selectedCell,
          isPaused: gameState.isPaused,
          isSoundOn: gameState.isSoundOn,
          gameOver: gameState.gameOver,
          gameWon: gameState.gameWon,
        },
        introStarted,
        introFinished,
        introLocked: introLockRef.current,
        gameStartTime,
      });
    }, 400);
    return () => clearTimeout(id);
  }, [gameState, introStarted, introFinished, gameStartTime]);

  // 调试：监听网格变化
  useEffect(() => {
    // 检查网格中是否有特殊水果
    const specialFruitsInGrid: Array<{ fruit: string; position: [number, number] }> = [];
    gameState.grid.forEach((row, rowIndex) => {
      row.forEach((fruit, colIndex) => {
        if (fruit && Object.values(SPECIAL_FRUITS).includes(fruit as SpecialFruitType)) {
          specialFruitsInGrid.push({ fruit, position: [rowIndex, colIndex] });
        }
      });
    });

    if (specialFruitsInGrid.length > 0) {
      console.log('🌟 网格中的特殊水果:', specialFruitsInGrid);
    }
  }, [gameState.grid]);

  // 提交游戏记录到后端
  const submitGameRecord = useCallback(async () => {
    if (!userId) {
      console.error('用户 ID 不存在，无法提交记录');
      return;
    }

    try {
      const playTime = Math.floor((Date.now() - gameStartTime) / 1000); // 转换为秒

      console.log('📤 提交游戏记录:', {
        userId,
        score: gameState.score,
        moves: gameState.moves,
        targetScore: TARGET_SCORE,
        isWon: gameState.gameWon,
        playTime,
        maxCombo,
        totalMatches,
      });

      const response = await fetch('/api/game-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          score: gameState.score,
          moves: gameState.moves,
          targetScore: TARGET_SCORE,
          isWon: gameState.gameWon,
          playTime,
          maxCombo,
          totalMatches,
          gameData: {
            gridSize: GRID_SIZE,
            fruitsUsed: FRUITS,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✓ 游戏记录已提交:', result.data);

        // 检查成就
        checkAchievements();
      } else {
        console.error('提交游戏记录失败:', response.statusText);
      }
    } catch (error) {
      console.error('提交游戏记录出错:', error);
    }
  }, [userId, gameState.score, gameState.moves, gameState.gameWon, gameStartTime, maxCombo, totalMatches]);

  // 检查并解锁成就
  const checkAchievements = useCallback(async () => {
    if (!userId) {
      return;
    }

    try {
      console.log('🏆 检查成就...');

      const response = await fetch('/api/achievements/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          gameData: {
            score: gameState.score,
            maxCombo,
            moves: gameState.moves,
            isWon: gameState.gameWon,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✓ 成就检查完成:', result.data);

        if (result.data.unlockedCount > 0) {
          // 提取成就信息
          const achievements = result.data.unlockedAchievements.map((ua: any) => ({
            id: ua.achievement.id,
            code: ua.achievement.code,
            name: ua.achievement.name,
            description: ua.achievement.description,
            icon: ua.achievement.icon,
            reward: ua.achievement.reward,
          }));

          setUnlockedAchievements(achievements);
          setShowAchievementModal(true);

          console.log(`🎉 解锁了 ${result.data.unlockedCount} 个成就!`, achievements);
        }
      } else {
        console.error('检查成就失败:', response.statusText);
      }
    } catch (error) {
      console.error('检查成就出错:', error);
    }
  }, [userId, gameState.score, maxCombo, gameState.moves, gameState.gameWon]);

  // 监听游戏胜利/失败，播放相应音效并提交记录
  useEffect(() => {
    if (gameState.gameWon || gameState.gameOver) {
      if (gameState.gameWon) {
        playWinSound();
      } else {
        playLoseSound();
      }
      // 背景音乐已禁用

      // 提交游戏记录
      submitGameRecord();
    }
  }, [gameState.gameWon, gameState.gameOver, playWinSound, playLoseSound, submitGameRecord]);

  // 处理特殊水果消除效果
  const activateSpecialFruit = useCallback((
    grid: (FruitType | null)[][],
    row: number,
    col: number,
    fruitType: SpecialFruitType,
    specifiedTargetFruit?: NormalFruitType  // 可选：指定要消除的目标水果（用于彩虹）
  ): Set<string> => {
    const cellsToRemove = new Set<string>();

    console.log(`🎆 激活特殊水果: ${fruitType} 在位置 [${row}, ${col}]`, specifiedTargetFruit ? `目标水果: ${specifiedTargetFruit}` : '');

    if (fruitType === SPECIAL_FRUITS.BOMB) {
      // 炸弹：消除周围3x3区域
      console.log('💣 炸弹效果：消除3x3区域');
      for (let r = Math.max(0, row - 1); r <= Math.min(GRID_SIZE - 1, row + 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(GRID_SIZE - 1, col + 1); c++) {
          cellsToRemove.add(`${r}-${c}`);
        }
      }
      console.log(`💣 炸弹将消除 ${cellsToRemove.size} 个单元格`);
    } else if (fruitType === SPECIAL_FRUITS.RAINBOW) {
      // 彩虹：消除所有同色水果
      let targetFruit: NormalFruitType | null = specifiedTargetFruit || null;

      // 如果没有指定目标水果，查找周围的普通水果
      if (!targetFruit) {
        console.log('🌈 彩虹效果：查找周围的普通水果');
        console.log('🔍 周围3x3区域的水果:');
        for (let r = Math.max(0, row - 1); r <= Math.min(GRID_SIZE - 1, row + 1); r++) {
          for (let c = Math.max(0, col - 1); c <= Math.min(GRID_SIZE - 1, col + 1); c++) {
            const fruit = grid[r][c];
            console.log(`  [${r},${c}]: ${fruit}`);
            if (fruit && FRUITS.includes(fruit as NormalFruitType)) {
              targetFruit = fruit as NormalFruitType;
              console.log(`✅ 找到目标水果: ${targetFruit} 在 [${r}, ${c}]`);
              break;
            }
          }
          if (targetFruit) break;
        }
      } else {
        console.log(`🌈 彩虹效果：使用指定的目标水果 ${targetFruit}`);
      }

      if (targetFruit) {
        console.log(`🎯 彩虹将消除所有 ${targetFruit}`);
        // 消除所有该颜色的水果
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] === targetFruit) {
              cellsToRemove.add(`${r}-${c}`);
            }
          }
        }
        console.log(`🌈 彩虹将消除 ${cellsToRemove.size} 个 ${targetFruit}`);
      } else {
        console.warn('⚠️ 彩虹周围没有找到普通水果！');
      }
      cellsToRemove.add(`${row}-${col}`); // 也消除彩虹本身
    } else if (fruitType === SPECIAL_FRUITS.PUMPKIN) {
      // 南瓜：十字消除（横竖一排）
      console.log('🎃 南瓜效果：十字消除（整行+整列）');
      // 消除整行
      for (let c = 0; c < GRID_SIZE; c++) {
        cellsToRemove.add(`${row}-${c}`);
      }
      // 消除整列
      for (let r = 0; r < GRID_SIZE; r++) {
        cellsToRemove.add(`${r}-${col}`);
      }
      console.log(`🎃 南瓜将消除 ${cellsToRemove.size} 个单元格（整行+整列）`);
    }

    console.log(`✅ 特殊水果激活完成，共标记 ${cellsToRemove.size} 个单元格待消除`);
    return cellsToRemove;
  }, []);

  // 消除匹配的水果
  const removeMatches = useCallback((grid: (FruitType | null)[][], matches: Set<string>): number => {
    let removedCount = 0;
    const specialFruitsToActivate: Array<{ row: number; col: number; type: SpecialFruitType }> = [];

    console.log('🔥 removeMatches 被调用，匹配数量:', matches.size);
    console.log('🔥 匹配的单元格:', Array.from(matches));

    // 先检查匹配中是否有普通水果（用于彩虹激活）
    let normalFruitInMatch: NormalFruitType | null = null;
    matches.forEach((key) => {
      const [row, col] = key.split('-').map(Number);
      const fruit = grid[row][col];
      console.log(`  检查单元格 [${row},${col}]: ${fruit}`);
      if (fruit && FRUITS.includes(fruit as NormalFruitType)) {
        normalFruitInMatch = fruit as NormalFruitType;
        console.log(`  ✓ 找到普通水果: ${fruit}`);
      }
    });

    // 检查是否有特殊水果需要激活
    matches.forEach((key) => {
      const [row, col] = key.split('-').map(Number);
      const fruit = grid[row][col];
      if (fruit && Object.values(SPECIAL_FRUITS).includes(fruit as SpecialFruitType)) {
        specialFruitsToActivate.push({ row, col, type: fruit as SpecialFruitType });
        console.log(`  ⭐ 发现特殊水果需要激活: ${fruit} 在 [${row}, ${col}]`);
      }
    });

    console.log(`🎯 共有 ${specialFruitsToActivate.length} 个特殊水果需要激活`);

    // 激活特殊水果
    specialFruitsToActivate.forEach(({ row, col, type }) => {
      // 如果是彩虹且匹配中有普通水果，传入该普通水果作为目标
      const targetFruit = (type === SPECIAL_FRUITS.RAINBOW && normalFruitInMatch)
        ? normalFruitInMatch
        : undefined;
      console.log(`🚀 正在激活特殊水果: ${type} 在 [${row}, ${col}]`, targetFruit ? `目标水果: ${targetFruit}` : '');
      const extraCells = activateSpecialFruit(grid, row, col, type, targetFruit);
      console.log(`💥 激活后额外标记了 ${extraCells.size} 个单元格`);
      extraCells.forEach((cell) => matches.add(cell));
    });

    // 移除所有匹配的水果
    matches.forEach((key) => {
      const [row, col] = key.split('-').map(Number);
      if (grid[row][col] !== null) {
        grid[row][col] = null;
        removedCount++;
      }
    });

    // 播放匹配音效
    if (removedCount > 0) {
      playMatchSound();
    }

    return removedCount;
  }, [playMatchSound, activateSpecialFruit]);

  // 让水果下落
  const dropFruits = useCallback((grid: (FruitType | null)[][]): void => {
    for (let col = 0; col < GRID_SIZE; col++) {
      // 从底部向上移动非空水果
      let writeIndex = GRID_SIZE - 1;
      for (let row = GRID_SIZE - 1; row >= 0; row--) {
        if (grid[row][col] !== null) {
          if (writeIndex !== row) {
            grid[writeIndex][col] = grid[row][col];
            grid[row][col] = null;
          }
          writeIndex--;
        }
      }

      // 填充顶部空位
      for (let row = writeIndex; row >= 0; row--) {
        grid[row][col] = FRUITS[Math.floor(Math.random() * FRUITS.length)];
      }
    }
  }, []);

  // 处理匹配和下落（递归，直到没有更多匹配）
  const processMatches = useCallback((grid: (FruitType | null)[][]): number => {
    let totalScore = 0;
    let hasMatches = true;
    let comboCount = 0;

    while (hasMatches) {
      const matchResult = findMatches(grid);
      if (matchResult.cells.size === 0) {
        hasMatches = false;
        setMatchedCells(new Set()); // 清除匹配高亮

        // 重置连击
        setCurrentCombo(0);
      } else {
        setMatchedCells(matchResult.cells); // 设置匹配高亮

        // 如果要生成特殊水果，先标记位置
        let specialFruitPosition: { row: number; col: number } | null = null;
        let specialFruitType: SpecialFruitType | null = null;

        if (matchResult.specialFruit) {
          specialFruitPosition = matchResult.specialFruit.position;
          specialFruitType = matchResult.specialFruit.type;
          // 从匹配列表中移除特殊水果生成位置（保留一个水果用于生成特殊水果）
          matchResult.cells.delete(`${specialFruitPosition.row}-${specialFruitPosition.col}`);
        }

        const removedCount = removeMatches(grid, matchResult.cells);
        totalScore += removedCount * 10; // 每个水果10分

        // 生成特殊水果
        if (specialFruitPosition && specialFruitType) {
          grid[specialFruitPosition.row][specialFruitPosition.col] = specialFruitType;
          console.log(`🎉 生成特殊水果: ${specialFruitType} 在 [${specialFruitPosition.row}, ${specialFruitPosition.col}]`);
        }

        // 更新连击和消除次数
        comboCount++;
        setCurrentCombo(comboCount);
        setMaxCombo((prev) => Math.max(prev, comboCount));
        setTotalMatches((prev) => prev + 1);

        // 播放得分音效
        if (removedCount > 0) {
          playScoreSound(removedCount);
        }

        dropFruits(grid);
      }
    }

    return totalScore;
  }, [findMatches, removeMatches, dropFruits, playScoreSound]);

  // 检查是否可以交换（交换后是否有匹配）
  const canSwap = useCallback(
    (grid: (FruitType | null)[][], row1: number, col1: number, row2: number, col2: number): boolean => {
      const fruit1 = grid[row1][col1];
      const fruit2 = grid[row2][col2];

      console.log('🔍 检查交换:', {
        fruit1,
        fruit2,
        position1: [row1, col1],
        position2: [row2, col2],
        specialFruits: Object.values(SPECIAL_FRUITS),
      });

      // 如果其中一个是特殊水果，允许交换
      const fruit1IsSpecial = fruit1 && Object.values(SPECIAL_FRUITS).includes(fruit1 as SpecialFruitType);
      const fruit2IsSpecial = fruit2 && Object.values(SPECIAL_FRUITS).includes(fruit2 as SpecialFruitType);

      console.log('🎯 特殊水果检查:', {
        fruit1IsSpecial,
        fruit2IsSpecial,
      });

      if (fruit1IsSpecial || fruit2IsSpecial) {
        console.log('✅ 允许交换（包含特殊水果）');
        return true;
      }

      // 创建临时网格
      const tempGrid = grid.map((row) => [...row]);

      // 交换
      const temp = tempGrid[row1][col1];
      tempGrid[row1][col1] = tempGrid[row2][col2];
      tempGrid[row2][col2] = temp;

      // 检查是否有匹配
      const matchResult = findMatches(tempGrid);
      const canSwapResult = matchResult.cells.size > 0;
      console.log('🔄 普通交换检查:', canSwapResult, '匹配数量:', matchResult.cells.size);
      return canSwapResult;
    },
    [findMatches]
  );

  // 执行带动画的交换
  const performSwap = useCallback(
    (row1: number, col1: number, row2: number, col2: number) => {
      // 检查是否可以交换
      const newGrid = gameState.grid.map((r) => [...r]);

      if (canSwap(newGrid, row1, col1, row2, col2)) {
        // 播放交换音效
        playSwapSound();

        // 设置交换动画状态
        setSwapAnimation({
          cell1: { row: row1, col: col1 },
          cell2: { row: row2, col: col2 },
        });

        // 获取交换前的水果类型
        const fruit1 = newGrid[row1][col1];
        const fruit2 = newGrid[row2][col2];

        // 交换网格数据
        const temp = newGrid[row1][col1];
        newGrid[row1][col1] = newGrid[row2][col2];
        newGrid[row2][col2] = temp;

        // 延迟处理匹配，等待动画完成
        setTimeout(() => {
          // 清除交换动画状态
          setSwapAnimation(null);

          let scoreGain = 0;

          // 检查是否有特殊水果被交换
          const fruit1IsSpecial = fruit1 && Object.values(SPECIAL_FRUITS).includes(fruit1 as SpecialFruitType);
          const fruit2IsSpecial = fruit2 && Object.values(SPECIAL_FRUITS).includes(fruit2 as SpecialFruitType);

          console.log('🔍 特殊水果交换检查:', {
            fruit1,
            fruit1IsSpecial,
            fruit1Position: [row1, col1],
            fruit1NewPosition: [row2, col2],
            fruit2,
            fruit2IsSpecial,
            fruit2Position: [row2, col2],
            fruit2NewPosition: [row1, col1],
          });

          if (fruit1IsSpecial || fruit2IsSpecial) {
            console.log('✨ 检测到特殊水果交换！开始激活效果...');
            // 如果有特殊水果，立即激活其效果
            const cellsToRemove = new Set<string>();

            if (fruit1IsSpecial) {
              console.log(`🎯 准备激活 fruit1: ${fruit1} (交换后在 [${row2}, ${col2}])`);
              // 如果 fruit1 是彩虹且 fruit2 是普通水果，传入 fruit2 作为目标
              const targetFruit = (fruit1 === SPECIAL_FRUITS.RAINBOW && fruit2 && FRUITS.includes(fruit2 as NormalFruitType))
                ? fruit2 as NormalFruitType
                : undefined;
              const extraCells = activateSpecialFruit(newGrid, row2, col2, fruit1 as SpecialFruitType, targetFruit);
              console.log(`📊 fruit1 激活返回了 ${extraCells.size} 个待消除单元格`);
              extraCells.forEach((cell) => cellsToRemove.add(cell));
            }

            if (fruit2IsSpecial) {
              console.log(`🎯 准备激活 fruit2: ${fruit2} (交换后在 [${row1}, ${col1}])`);
              // 如果 fruit2 是彩虹且 fruit1 是普通水果，传入 fruit1 作为目标
              const targetFruit = (fruit2 === SPECIAL_FRUITS.RAINBOW && fruit1 && FRUITS.includes(fruit1 as NormalFruitType))
                ? fruit1 as NormalFruitType
                : undefined;
              const extraCells = activateSpecialFruit(newGrid, row1, col1, fruit2 as SpecialFruitType, targetFruit);
              console.log(`📊 fruit2 激活返回了 ${extraCells.size} 个待消除单元格`);
              extraCells.forEach((cell) => cellsToRemove.add(cell));
            }

            console.log(`💥 总共收集了 ${cellsToRemove.size} 个待消除单元格:`, Array.from(cellsToRemove));

            // 移除激活的单元格
            console.log('🗑️ 调用 removeMatches...');
            const removedCount = removeMatches(newGrid, cellsToRemove);
            console.log(`✅ 实际移除了 ${removedCount} 个水果`);
            scoreGain += removedCount * 10;

            // 下落并继续处理匹配
            dropFruits(newGrid);
            scoreGain += processMatches(newGrid);
          } else {
            // 普通匹配处理
            scoreGain = processMatches(newGrid);
          }

          // 更新状态
          setGameState((prev) => {
            const newScore = prev.score + scoreGain;
            const newMoves = prev.moves - 1;
            const won = newScore >= TARGET_SCORE;
            const lost = newMoves <= 0 && newScore < TARGET_SCORE;

            return {
              ...prev,
              grid: newGrid,
              score: newScore,
              moves: newMoves,
              selectedCell: null,
              gameWon: won,
              gameOver: lost,
            };
          });
        }, 300); // 动画持续时间
      } else {
        // 不能交换，取消选择
        setGameState((prev) => ({
          ...prev,
          selectedCell: null,
        }));
      }
    },
    [gameState.grid, canSwap, processMatches, playSwapSound, activateSpecialFruit, removeMatches, dropFruits]
  );

  // 处理单元格点击
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      const clickedFruit = gameState.grid[row][col];
      console.log('🖱️ 点击了水果:', row, col, clickedFruit);
      console.log('🔍 特殊水果定义:', SPECIAL_FRUITS);
      console.log('🔍 是否为特殊水果:', Object.values(SPECIAL_FRUITS).includes(clickedFruit as SpecialFruitType));

      if (gameState.gameOver || gameState.gameWon || gameState.isPaused) return;
      if (gameState.grid[row][col] === null) return;

      // 播放点击音效
      playClickSound();

      if (gameState.selectedCell === null) {
        // 选择第一个单元格
        setGameState((prev) => ({
          ...prev,
          selectedCell: { row, col },
        }));
      } else {
        const { row: selectedRow, col: selectedCol } = gameState.selectedCell;

        // 检查是否是相邻单元格
        const isAdjacent =
          (Math.abs(row - selectedRow) === 1 && col === selectedCol) ||
          (Math.abs(col - selectedCol) === 1 && row === selectedRow);

        if (isAdjacent) {
          // 执行带动画的交换
          performSwap(selectedRow, selectedCol, row, col);
        } else {
          // 不是相邻单元格，重新选择
          setGameState((prev) => ({
            ...prev,
            selectedCell: { row, col },
          }));
        }
      }
    },
    [gameState, performSwap, playClickSound]
  );

  // 处理单元格滑动
  const handleCellSwipe = useCallback(
    (row: number, col: number, direction: 'up' | 'down' | 'left' | 'right') => {
      console.log('滑动水果:', row, col, direction);
      if (gameState.gameOver || gameState.gameWon || gameState.isPaused) return;
      if (gameState.grid[row][col] === null) return;

      // 根据滑动方向计算目标单元格
      let targetRow = row;
      let targetCol = col;

      switch (direction) {
        case 'up':
          targetRow = row - 1;
          break;
        case 'down':
          targetRow = row + 1;
          break;
        case 'left':
          targetCol = col - 1;
          break;
        case 'right':
          targetCol = col + 1;
          break;
      }

      // 检查目标单元格是否有效
      if (
        targetRow < 0 ||
        targetRow >= GRID_SIZE ||
        targetCol < 0 ||
        targetCol >= GRID_SIZE
      ) {
        return;
      }

      if (gameState.grid[targetRow][targetCol] === null) {
        return;
      }

      // 执行带动画的交换
      performSwap(row, col, targetRow, targetCol);
    },
    [gameState, performSwap]
  );

  // 处理返回：不用 router.back()，避免从直达/刷新/PWA 打开时没有历史记录导致无法离开
  const handleBack = () => {
    router.push('/');
  };

  // 处理暂停/继续
  const handlePause = () => {
    setGameState((prev) => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  };

  // 处理声音开关
  const handleSoundToggle = () => {
    setGameState((prev) => ({
      ...prev,
      isSoundOn: !prev.isSoundOn,
    }));
  };

  return (
    <AuthGuard>
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(to bottom, #f3e8ff, #ffedd4)',
      }}
    >
      <div className="max-w-md mx-auto">
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between px-4 pt-4 pb-4">
          <div
            onClick={handleBack}
            className="w-12 h-12 flex items-center justify-center hover:scale-110 active:scale-95 transition-all relative overflow-hidden"
          >
            <Image src={iconBack} alt="返回" fill className="object-contain p-2" />
          </div>

          <h1
            className="text-2xl font-black"
            style={{
              background: 'linear-gradient(90deg, #e60076 0%, #9810fa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            水果消消乐 🍓
          </h1>

          <div className="flex gap-2">
            <button
              onClick={handleSoundToggle}
              className="w-12 h-12 flex items-center justify-center hover:scale-110 active:scale-95 transition-all relative overflow-hidden"
            >
              <Image src={iconSound} alt="声音" fill className="object-contain p-2" />
            </button>
            <button
              onClick={handlePause}
              className="w-12 h-12 flex items-center justify-center hover:scale-110 active:scale-95 transition-all relative overflow-hidden"
            >
              <Image src={iconPause} alt="暂停" fill className="object-contain p-2" />
            </button>
          </div>
        </div>

        {/* 游戏统计 */}
        <div className="px-4 mb-4 flex gap-3">
          {/* 分数 */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg p-3">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Image src={iconScore} alt="分数" width={16} height={16} />
              <span className="text-xs font-bold text-[#4a5565]">分数</span>
            </div>
            <p className="text-2xl font-black text-center text-[#9810fa]">{gameState.score}</p>
          </div>

          {/* 目标 */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg p-3">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Image src={iconTarget} alt="目标" width={16} height={16} />
              <span className="text-xs font-bold text-[#4a5565]">目标</span>
            </div>
            <p className="text-2xl font-black text-center text-[#155dfc]">{TARGET_SCORE}</p>
          </div>

          {/* 移动 */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg p-3">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Image src={iconMoves} alt="移动" width={16} height={16} />
              <span className="text-xs font-bold text-[#4a5565]">移动</span>
            </div>
            <p className="text-2xl font-black text-center text-[#f54900]">{gameState.moves}</p>
          </div>
        </div>

        {/* 3D 游戏网格 */}
        <div className="px-4 mb-4">
          <div
            className="rounded-3xl shadow-2xl p-2 relative"
            style={{
              aspectRatio: '1 / 1',
              width: '100%',
              backgroundImage: 'url(/images/board.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1), 0 4px 20px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ position: 'absolute', inset: '8px' }}>
              <FruitMatchCanvas
                grid={gameState.grid}
                selectedCell={gameState.selectedCell}
                matchedCells={matchedCells}
                swapAnimation={swapAnimation}
                onCellClick={handleCellClick}
                onCellSwipe={handleCellSwipe}
              />
            </div>
            {/* 首次需触摸以解锁音频：提示轻触；事件由 window 监听 */}
            {gameState.isSoundOn &&
              gameState.grid.length > 0 &&
              !introStarted && (
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                  <p className="text-sm font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] bg-black/30 rounded-full px-4 py-2">
                    轻触屏幕开始 · Let&apos;s go
                  </p>
                </div>
              )}
          </div>
        </div>

        {/* 游戏提示 */}
        <div className="px-4 mb-4">
          <div
            className="rounded-2xl shadow-lg p-4"
            style={{
              background: 'linear-gradient(to right, #f3e8ff, #fce7f3)',
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #c27aff 0%, #fb64b6 100%)',
                }}
              >
                <span className="text-2xl">💡</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#364153] mb-1">游戏提示</p>
                <p className="text-xs text-[#4a5565] leading-relaxed">
                  点击相邻水果交换位置，匹配3个或更多相同水果即可消除！
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 成就解锁弹窗 */}
        {showAchievementModal && unlockedAchievements.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-8 mx-4 max-w-sm w-full">
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-black mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  解锁新成就！
                </h2>
                <div className="space-y-3 mb-6">
                  {unlockedAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{achievement.icon || '🏆'}</div>
                        <div className="flex-1 text-left">
                          <h3 className="font-black text-gray-800">{achievement.name}</h3>
                          <p className="text-xs text-gray-600">{achievement.description}</p>
                          <p className="text-xs font-bold text-purple-600 mt-1">
                            +{achievement.reward} 积分
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowAchievementModal(false)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  太棒了！
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 游戏结束/胜利弹窗 */}
        {(gameState.gameOver || gameState.gameWon) && !showAchievementModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-8 mx-4 max-w-sm w-full">
              <div className="text-center">
                <div className="text-6xl mb-4">{gameState.gameWon ? '🎉' : '😢'}</div>
                <h2 className="text-2xl font-black mb-2">
                  {gameState.gameWon ? '恭喜通关！' : '游戏结束'}
                </h2>
                <p className="text-gray-600 mb-6">
                  {gameState.gameWon
                    ? `你获得了 ${gameState.score} 分！`
                    : `最终得分：${gameState.score} 分`}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      clearFruitMatchGame();
                      setIntroStarted(false);
                      setIntroFinished(false);
                      introLockRef.current = false;
                      setGameState({
                        grid: initializeGrid(),
                        score: 0,
                        moves: INITIAL_MOVES,
                        selectedCell: null,
                        isPaused: false,
                        isSoundOn: gameState.isSoundOn,
                        gameOver: false,
                        gameWon: false,
                      });
                      setGameStartTime(Date.now());
                      setMaxCombo(0);
                      setTotalMatches(0);
                      setCurrentCombo(0);
                      setUnlockedAchievements([]);
                      setShowAchievementModal(false);
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all"
                  >
                    再来一局
                  </button>
                  <button
                    onClick={handleBack}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
                  >
                    返回
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 暂停弹窗 */}
        {gameState.isPaused && !gameState.gameOver && !gameState.gameWon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-8 mx-4 max-w-sm w-full">
              <div className="text-center">
                <div className="text-6xl mb-4">⏸️</div>
                <h2 className="text-2xl font-black mb-6">游戏已暂停</h2>
                <button
                  onClick={handlePause}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  继续游戏
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </AuthGuard>
  );
}
