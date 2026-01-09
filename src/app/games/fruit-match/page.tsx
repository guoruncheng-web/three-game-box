/**
 * 水果消消乐游戏页面
 * 基于 Figma 设计实现
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TabBar } from '@/components/layout/TabBar';
import type { TabItem } from '@/components/layout/TabBar';

// 图标路径
const iconBack = '/images/fruit-match/icon-back.svg';
const iconSound = '/images/fruit-match/icon-sound.svg';
const iconPause = '/images/fruit-match/icon-pause.svg';
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
          let fruit: FruitType = FRUITS[0]; // 给初始值
          let valid = false;
          let tries = 0;

          while (!valid && tries < 50) {
            fruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
            valid = true;

            // 检查水平匹配（左侧两个）
            if (col >= 2 && grid[row][col - 1] === fruit && grid[row][col - 2] === fruit) {
              valid = false;
            }
            // 检查垂直匹配（上方两个）
            if (row >= 2 && grid[row - 1]?.[col] === fruit && grid[row - 2]?.[col] === fruit) {
              valid = false;
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
    return removedCount;
  }, []);

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
      } else {
        const removedCount = removeMatches(grid, matches);
        totalScore += removedCount * 10; // 每个水果10分
        dropFruits(grid);
      }
    }

    return totalScore;
  }, [findMatches, removeMatches, dropFruits]);

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

  // 处理单元格点击
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (gameState.gameOver || gameState.gameWon || gameState.isPaused) return;
      if (gameState.grid[row][col] === null) return;

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
          // 检查是否可以交换
          const newGrid = gameState.grid.map((r) => [...r]);
          
          if (canSwap(newGrid, selectedRow, selectedCol, row, col)) {
            // 交换
            const temp = newGrid[selectedRow][selectedCol];
            newGrid[selectedRow][selectedCol] = newGrid[row][col];
            newGrid[row][col] = temp;

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
          } else {
            // 不能交换，取消选择
            setGameState((prev) => ({
              ...prev,
              selectedCell: null,
            }));
          }
        } else {
          // 不是相邻单元格，重新选择
          setGameState((prev) => ({
            ...prev,
            selectedCell: { row, col },
          }));
        }
      }
    },
    [gameState, canSwap, processMatches]
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

  // TabBar 配置
  const tabs: TabItem[] = [
    {
      key: 'home',
      label: '首页',
      icon: '/images/tabbar/icon-home.svg',
      activeIcon: '/images/tabbar/icon-home-active.svg',
      path: '/',
    },
    {
      key: 'mine',
      label: '我的',
      icon: '/images/tabbar/icon-profile.svg',
      activeIcon: '/images/tabbar/icon-profile-active.svg',
      path: '/mine',
    },
  ];

  return (
    <div
      className="min-h-screen pb-24"
      style={{
        background: 'linear-gradient(to bottom, #f3e8ff, #ffedd4)',
      }}
    >
      <div className="max-w-md mx-auto">
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between px-4 pt-4 pb-4">
          <button
            onClick={handleBack}
            className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
          >
            <Image src={iconBack} alt="返回" width={24} height={24} />
          </button>

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
              className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
            >
              <Image src={iconSound} alt="声音" width={20} height={20} />
            </button>
            <button
              onClick={handlePause}
              className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
            >
              <Image src={iconPause} alt="暂停" width={20} height={20} />
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

        {/* 游戏网格 */}
        <div className="px-4 mb-4">
          <div className="bg-white/80 rounded-3xl shadow-2xl p-4">
            <div className="grid grid-cols-8 gap-1">
              {gameState.grid.map((row, rowIndex) =>
                row.map((fruit, colIndex) => {
                  const isSelected =
                    gameState.selectedCell?.row === rowIndex &&
                    gameState.selectedCell?.col === colIndex;
                  const isEmpty = fruit === null;

                  return (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      disabled={isEmpty || gameState.gameOver || gameState.gameWon || gameState.isPaused}
                      className={`
                        aspect-square rounded-2xl flex items-center justify-center
                        text-3xl transition-all duration-200
                        ${isEmpty ? 'bg-transparent' : 'bg-gradient-to-br from-[#f3e8ff] to-[#fce7f3] shadow-md'}
                        ${isSelected ? 'ring-4 ring-[#fdc700] scale-110' : 'hover:scale-105 active:scale-95'}
                        ${isEmpty ? 'cursor-default' : 'cursor-pointer'}
                      `}
                      style={{
                        background: isEmpty
                          ? 'transparent'
                          : 'linear-gradient(135deg, rgb(243, 232, 255) 0%, rgb(252, 231, 243) 100%)',
                      }}
                    >
                      {fruit}
                    </button>
                  );
                })
              )}
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

        {/* 底部导航栏 */}
        <TabBar tabs={tabs} />
      </div>
    </div>
  );
}
