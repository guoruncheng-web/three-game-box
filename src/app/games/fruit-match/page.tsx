/**
 * 水果消消乐游戏页面
 * 基于 Figma 设计实现
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useGameSounds } from '@/hooks/useGameSounds';

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

// 水果类型
type FruitType = '🍇' | '🍋' | '🍉' | '🍊' | '🍎' | '🍒' | '🍓';

const FRUITS: FruitType[] = ['🍇', '🍋', '🍉', '🍊', '🍎', '🍒', '🍓'];

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

// 交换动画状态
interface SwapAnimationState {
  cell1: { row: number; col: number };
  cell2: { row: number; col: number };
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

  // 音效系统
  const {
    playClickSound,
    playSwapSound,
    playMatchSound,
    playScoreSound,
    playWinSound,
    playLoseSound,
  } = useGameSounds({ enabled: gameState.isSoundOn });

  // 检查是否有匹配（3个或更多相同水果）
  const findMatches = useCallback((grid: (FruitType | null)[][]): Set<string> => {
    const matches = new Set<string>();

    // 检查水平匹配
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE - 2; col++) {
        const fruit = grid[row][col];
        if (fruit === null) continue;

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
          for (let c = col; c < col + matchCount; c++) {
            matches.add(`${row}-${c}`);
          }
        }
      }
    }

    // 检查垂直匹配
    for (let col = 0; col < GRID_SIZE; col++) {
      for (let row = 0; row < GRID_SIZE - 2; row++) {
        const fruit = grid[row][col];
        if (fruit === null) continue;

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
          for (let r = row; r < row + matchCount; r++) {
            matches.add(`${r}-${col}`);
          }
        }
      }
    }

    return matches;
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
      const matches = findMatches(grid);
      if (matches.size === 0) {
        break;
      }

      attempts++;
    } while (attempts < maxAttempts);

    return grid;
  }, [findMatches]);

  // 初始化游戏
  useEffect(() => {
    const initialGrid = initializeGrid();
    setGameState((prev) => ({
      ...prev,
      grid: initialGrid,
    }));
  }, [initializeGrid]);

  // 监听游戏胜利/失败，播放相应音效
  useEffect(() => {
    if (gameState.gameWon) {
      playWinSound();
    } else if (gameState.gameOver) {
      playLoseSound();
    }
  }, [gameState.gameWon, gameState.gameOver, playWinSound, playLoseSound]);

  // 消除匹配的水果
  const removeMatches = useCallback((grid: (FruitType | null)[][], matches: Set<string>): number => {
    let removedCount = 0;
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
  }, [playMatchSound]);

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

    while (hasMatches) {
      const matches = findMatches(grid);
      if (matches.size === 0) {
        hasMatches = false;
        setMatchedCells(new Set()); // 清除匹配高亮
      } else {
        setMatchedCells(matches); // 设置匹配高亮
        const removedCount = removeMatches(grid, matches);
        totalScore += removedCount * 10; // 每个水果10分

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
      // 创建临时网格
      const tempGrid = grid.map((row) => [...row]);

      // 交换
      const temp = tempGrid[row1][col1];
      tempGrid[row1][col1] = tempGrid[row2][col2];
      tempGrid[row2][col2] = temp;

      // 检查是否有匹配
      const matches = findMatches(tempGrid);
      return matches.size > 0;
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

        // 交换网格数据
        const temp = newGrid[row1][col1];
        newGrid[row1][col1] = newGrid[row2][col2];
        newGrid[row2][col2] = temp;

        // 延迟处理匹配，等待动画完成
        setTimeout(() => {
          // 清除交换动画状态
          setSwapAnimation(null);

          // 处理匹配
          const scoreGain = processMatches(newGrid);

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
    [gameState.grid, canSwap, processMatches, playSwapSound]
  );

  // 处理单元格点击
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      console.log('点击了水果:', row, col, gameState.grid[row][col]);
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

  // 处理返回
  const handleBack = () => {
    router.back();
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
            className="rounded-3xl shadow-2xl p-4"
            style={{
              height: '400px',
              backgroundImage: 'url(/images/board.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1), 0 4px 20px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <FruitMatchCanvas
                grid={gameState.grid}
                selectedCell={gameState.selectedCell}
                matchedCells={matchedCells}
                swapAnimation={swapAnimation}
                onCellClick={handleCellClick}
                onCellSwipe={handleCellSwipe}
              />
            </div>
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

        {/* 游戏结束/胜利弹窗 */}
        {(gameState.gameOver || gameState.gameWon) && (
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
  );
}
