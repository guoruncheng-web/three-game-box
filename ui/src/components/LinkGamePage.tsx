import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Star, Timer, Lightbulb, Shuffle, Trophy, RotateCcw, Pause, Play, Volume2, VolumeX, Zap } from 'lucide-react';

interface LinkGamePageProps {
  onBack: () => void;
}

type ItemEmoji = '🍎' | '🍊' | '🍋' | '🍇' | '🍓' | '🍒' | '🥝' | '🍑' | '🍌' | '🥭';

interface Cell {
  id: number;
  emoji: ItemEmoji | null;
  isSelected: boolean;
  isMatched: boolean;
}

interface Point {
  row: number;
  col: number;
}

const emojis: ItemEmoji[] = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🥝', '🍑', '🍌', '🥭'];
const ROWS = 8;
const COLS = 10;
const TIME_LIMIT = 300; // 5分钟

export function LinkGamePage({ onBack }: LinkGamePageProps) {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [selectedCell, setSelectedCell] = useState<Point | null>(null);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(TIME_LIMIT);
  const [hints, setHints] = useState(3);
  const [shuffles, setShuffles] = useState(2);
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'won' | 'lost'>('playing');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [combo, setCombo] = useState(0);
  const [linkPath, setLinkPath] = useState<Point[]>([]);

  // 初始化游戏网格
  const initializeGrid = useCallback(() => {
    const newGrid: Cell[][] = [];
    const items: (ItemEmoji | null)[] = [];
    let id = 0;

    // 创建成对的emoji（每种emoji出现偶数次）
    for (let i = 0; i < (ROWS * COLS) / 2; i++) {
      const emoji = emojis[i % emojis.length];
      items.push(emoji, emoji);
    }

    // 洗牌
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }

    // 填充网格
    for (let row = 0; row < ROWS; row++) {
      newGrid[row] = [];
      for (let col = 0; col < COLS; col++) {
        newGrid[row][col] = {
          id: id++,
          emoji: items[row * COLS + col],
          isSelected: false,
          isMatched: false,
        };
      }
    }

    return newGrid;
  }, []);

  // 检查两点之间是否可以连接（最多2个转折点）
  const canConnect = useCallback((p1: Point, p2: Point, currentGrid: Cell[][]): Point[] | null => {
    if (p1.row === p2.row && p1.col === p2.col) return null;
    
    // 检查直线连接（0个转折点）
    const straightPath = checkStraightLine(p1, p2, currentGrid);
    if (straightPath) return straightPath;

    // 检查一个转折点
    const oneCornerPath = checkOneCorner(p1, p2, currentGrid);
    if (oneCornerPath) return oneCornerPath;

    // 检查两个转折点
    const twoCornerPath = checkTwoCorners(p1, p2, currentGrid);
    if (twoCornerPath) return twoCornerPath;

    return null;
  }, []);

  // 检查直线路径
  const checkStraightLine = (p1: Point, p2: Point, currentGrid: Cell[][]): Point[] | null => {
    if (p1.row === p2.row) {
      // 横向
      const minCol = Math.min(p1.col, p2.col);
      const maxCol = Math.max(p1.col, p2.col);
      for (let col = minCol + 1; col < maxCol; col++) {
        if (currentGrid[p1.row][col].emoji !== null) return null;
      }
      return [p1, p2];
    } else if (p1.col === p2.col) {
      // 纵向
      const minRow = Math.min(p1.row, p2.row);
      const maxRow = Math.max(p1.row, p2.row);
      for (let row = minRow + 1; row < maxRow; row++) {
        if (currentGrid[row][p1.col].emoji !== null) return null;
      }
      return [p1, p2];
    }
    return null;
  };

  // 检查一个转折点的路径
  const checkOneCorner = (p1: Point, p2: Point, currentGrid: Cell[][]): Point[] | null => {
    // 转折点1: (p1.row, p2.col)
    const corner1 = { row: p1.row, col: p2.col };
    if (currentGrid[corner1.row][corner1.col].emoji === null) {
      const path1 = checkStraightLine(p1, corner1, currentGrid);
      const path2 = checkStraightLine(corner1, p2, currentGrid);
      if (path1 && path2) return [p1, corner1, p2];
    }

    // 转折点2: (p2.row, p1.col)
    const corner2 = { row: p2.row, col: p1.col };
    if (currentGrid[corner2.row][corner2.col].emoji === null) {
      const path1 = checkStraightLine(p1, corner2, currentGrid);
      const path2 = checkStraightLine(corner2, p2, currentGrid);
      if (path1 && path2) return [p1, corner2, p2];
    }

    return null;
  };

  // 检查两个转折点的路径
  const checkTwoCorners = (p1: Point, p2: Point, currentGrid: Cell[][]): Point[] | null => {
    // 尝试横向延伸
    for (let col = 0; col < COLS; col++) {
      if (col === p1.col || col === p2.col) continue;
      
      const mid1 = { row: p1.row, col };
      const mid2 = { row: p2.row, col };
      
      if (currentGrid[mid1.row][mid1.col].emoji === null && 
          currentGrid[mid2.row][mid2.col].emoji === null) {
        const path1 = checkStraightLine(p1, mid1, currentGrid);
        const path2 = checkStraightLine(mid1, mid2, currentGrid);
        const path3 = checkStraightLine(mid2, p2, currentGrid);
        if (path1 && path2 && path3) return [p1, mid1, mid2, p2];
      }
    }

    // 尝试纵向延伸
    for (let row = 0; row < ROWS; row++) {
      if (row === p1.row || row === p2.row) continue;
      
      const mid1 = { row, col: p1.col };
      const mid2 = { row, col: p2.col };
      
      if (currentGrid[mid1.row][mid1.col].emoji === null && 
          currentGrid[mid2.row][mid2.col].emoji === null) {
        const path1 = checkStraightLine(p1, mid1, currentGrid);
        const path2 = checkStraightLine(mid1, mid2, currentGrid);
        const path3 = checkStraightLine(mid2, p2, currentGrid);
        if (path1 && path2 && path3) return [p1, mid1, mid2, p2];
      }
    }

    return null;
  };

  // 处理单元格点击
  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState !== 'playing') return;
    if (grid[row][col].emoji === null || grid[row][col].isMatched) return;

    if (selectedCell === null) {
      // 选择第一个
      setSelectedCell({ row, col });
      setGrid(prev =>
        prev.map((r, rIdx) =>
          r.map((cell, cIdx) =>
            rIdx === row && cIdx === col
              ? { ...cell, isSelected: true }
              : { ...cell, isSelected: false }
          )
        )
      );
    } else {
      // 选择第二个
      if (selectedCell.row === row && selectedCell.col === col) {
        // 取消选择
        setSelectedCell(null);
        setGrid(prev =>
          prev.map(r => r.map(cell => ({ ...cell, isSelected: false })))
        );
        return;
      }

      const emoji1 = grid[selectedCell.row][selectedCell.col].emoji;
      const emoji2 = grid[row][col].emoji;

      if (emoji1 === emoji2) {
        // 检查是否可以连接
        const path = canConnect(selectedCell, { row, col }, grid);
        
        if (path) {
          // 可以连接，显示路径
          setLinkPath(path);
          
          setTimeout(() => {
            // 消除
            setGrid(prev =>
              prev.map((r, rIdx) =>
                r.map((cell, cIdx) =>
                  (rIdx === selectedCell.row && cIdx === selectedCell.col) ||
                  (rIdx === row && cIdx === col)
                    ? { ...cell, emoji: null, isMatched: true, isSelected: false }
                    : { ...cell, isSelected: false }
                )
              )
            );
            setScore(prev => prev + 100 * Math.max(1, combo));
            setCombo(prev => prev + 1);
            setSelectedCell(null);
            setLinkPath([]);
            
            setTimeout(() => setCombo(0), 1000);
          }, 500);
        } else {
          // 不能连接
          setGrid(prev =>
            prev.map(r => r.map(cell => ({ ...cell, isSelected: false })))
          );
          setSelectedCell(null);
          setCombo(0);
        }
      } else {
        // emoji不同
        setGrid(prev =>
          prev.map(r => r.map(cell => ({ ...cell, isSelected: false })))
        );
        setSelectedCell(null);
        setCombo(0);
      }
    }
  }, [selectedCell, grid, gameState, canConnect, combo]);

  // 提示功能
  const handleHint = useCallback(() => {
    if (hints <= 0 || gameState !== 'playing') return;

    // 查找可以连接的一对
    for (let r1 = 0; r1 < ROWS; r1++) {
      for (let c1 = 0; c1 < COLS; c1++) {
        if (grid[r1][c1].emoji === null) continue;
        
        for (let r2 = 0; r2 < ROWS; r2++) {
          for (let c2 = 0; c2 < COLS; c2++) {
            if (r1 === r2 && c1 === c2) continue;
            if (grid[r2][c2].emoji === null) continue;
            if (grid[r1][c1].emoji !== grid[r2][c2].emoji) continue;
            
            const path = canConnect({ row: r1, col: c1 }, { row: r2, col: c2 }, grid);
            if (path) {
              // 显示提示
              setGrid(prev =>
                prev.map((r, rIdx) =>
                  r.map((cell, cIdx) =>
                    (rIdx === r1 && cIdx === c1) || (rIdx === r2 && cIdx === c2)
                      ? { ...cell, isSelected: true }
                      : { ...cell, isSelected: false }
                  )
                )
              );
              setHints(prev => prev - 1);
              
              setTimeout(() => {
                setGrid(prev =>
                  prev.map(r => r.map(cell => ({ ...cell, isSelected: false })))
                );
              }, 1500);
              
              return;
            }
          }
        }
      }
    }
  }, [grid, hints, gameState, canConnect]);

  // 重新排列
  const handleShuffle = useCallback(() => {
    if (shuffles <= 0 || gameState !== 'playing') return;

    const remainingEmojis: ItemEmoji[] = [];
    grid.forEach(row => {
      row.forEach(cell => {
        if (cell.emoji !== null && !cell.isMatched) {
          remainingEmojis.push(cell.emoji);
        }
      });
    });

    // 洗牌
    for (let i = remainingEmojis.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remainingEmojis[i], remainingEmojis[j]] = [remainingEmojis[j], remainingEmojis[i]];
    }

    let emojiIndex = 0;
    setGrid(prev =>
      prev.map(row =>
        row.map(cell =>
          cell.emoji === null || cell.isMatched
            ? cell
            : { ...cell, emoji: remainingEmojis[emojiIndex++] }
        )
      )
    );

    setShuffles(prev => prev - 1);
    setSelectedCell(null);
  }, [grid, shuffles, gameState]);

  // 计时器
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing' && time > 0) {
      interval = setInterval(() => {
        setTime(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, time]);

  // 初始化
  useEffect(() => {
    setGrid(initializeGrid());
  }, [initializeGrid]);

  // 检查游戏结束
  useEffect(() => {
    if (gameState === 'playing') {
      const allMatched = grid.every(row => row.every(cell => cell.emoji === null));
      if (allMatched && grid.length > 0) {
        setGameState('won');
      } else if (time <= 0) {
        setGameState('lost');
      }
    }
  }, [grid, time, gameState]);

  // 重置游戏
  const resetGame = () => {
    setGrid(initializeGrid());
    setScore(0);
    setTime(TIME_LIMIT);
    setHints(3);
    setShuffles(2);
    setGameState('playing');
    setCombo(0);
    setSelectedCell(null);
    setLinkPath([]);
  };

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-200 via-teal-200 to-cyan-200 pb-6">
      <div className="max-w-4xl mx-auto px-4 pt-4">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-4 animate-slide-down">
          <button
            onClick={onBack}
            className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600">
            连连看 🎲
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300"
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-teal-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-400" />
              )}
            </button>
            <button
              onClick={() => setGameState(gameState === 'paused' ? 'playing' : 'paused')}
              className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300"
            >
              {gameState === 'paused' ? (
                <Play className="w-5 h-5 text-green-600" />
              ) : (
                <Pause className="w-5 h-5 text-orange-600" />
              )}
            </button>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4 animate-fade-in-up delay-100">
          <div className="bg-white rounded-2xl p-3 shadow-lg text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
              <p className="text-xs font-bold text-gray-600">分数</p>
            </div>
            <p className="text-xl font-black text-yellow-600">{score}</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-lg text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Timer className="w-4 h-4 text-blue-500" />
              <p className="text-xs font-bold text-gray-600">时间</p>
            </div>
            <p className={`text-xl font-black ${time <= 30 ? 'text-red-600' : 'text-blue-600'}`}>
              {formatTime(time)}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-lg">
            <button
              onClick={handleHint}
              disabled={hints <= 0 || gameState !== 'playing'}
              className={`w-full flex flex-col items-center ${hints > 0 ? 'hover:scale-105 active:scale-95' : 'opacity-50 cursor-not-allowed'} transition-all`}
            >
              <div className="flex items-center gap-1 mb-1">
                <Lightbulb className="w-4 h-4 text-orange-500" />
                <p className="text-xs font-bold text-gray-600">提示</p>
              </div>
              <p className="text-xl font-black text-orange-600">{hints}</p>
            </button>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-lg">
            <button
              onClick={handleShuffle}
              disabled={shuffles <= 0 || gameState !== 'playing'}
              className={`w-full flex flex-col items-center ${shuffles > 0 ? 'hover:scale-105 active:scale-95' : 'opacity-50 cursor-not-allowed'} transition-all`}
            >
              <div className="flex items-center gap-1 mb-1">
                <Shuffle className="w-4 h-4 text-purple-500" />
                <p className="text-xs font-bold text-gray-600">重排</p>
              </div>
              <p className="text-xl font-black text-purple-600">{shuffles}</p>
            </button>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-lg text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-4 h-4 text-pink-500" fill="currentColor" />
              <p className="text-xs font-bold text-gray-600">连击</p>
            </div>
            <p className="text-xl font-black text-pink-600">{combo}</p>
          </div>
        </div>

        {/* 连击提示 */}
        {combo > 1 && (
          <div className="mb-4 animate-bounce-in">
            <div className="bg-gradient-to-r from-pink-400 to-rose-400 rounded-2xl p-3 shadow-lg text-center">
              <p className="text-white font-black text-lg">
                🔥 {combo}连击! 奖励 x{combo}
              </p>
            </div>
          </div>
        )}

        {/* 游戏网格 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-4 shadow-2xl mb-4 animate-fade-in-up delay-200 overflow-x-auto">
          <div className="relative inline-block min-w-full">
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
            >
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <button
                    key={cell.id}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    disabled={gameState !== 'playing' || cell.emoji === null}
                    className={`aspect-square rounded-xl flex items-center justify-center text-2xl md:text-3xl transition-all duration-300 ${
                      cell.emoji === null
                        ? 'bg-gray-100'
                        : cell.isSelected
                        ? 'bg-gradient-to-br from-yellow-300 to-orange-300 scale-110 shadow-lg ring-4 ring-yellow-400'
                        : 'bg-gradient-to-br from-green-100 to-teal-100 hover:scale-110 active:scale-95 shadow-md'
                    }`}
                  >
                    {cell.emoji && (
                      <span className={cell.isMatched ? 'animate-spin-out' : ''}>
                        {cell.emoji}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* 连接线 */}
            {linkPath.length > 1 && (
              <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
                {linkPath.map((point, index) => {
                  if (index === linkPath.length - 1) return null;
                  const nextPoint = linkPath[index + 1];
                  const cellSize = 100 / COLS;
                  const x1 = (point.col + 0.5) * cellSize;
                  const y1 = (point.row + 0.5) * cellSize;
                  const x2 = (nextPoint.col + 0.5) * cellSize;
                  const y2 = (nextPoint.row + 0.5) * cellSize;
                  return (
                    <line
                      key={index}
                      x1={`${x1}%`}
                      y1={`${y1}%`}
                      x2={`${x2}%`}
                      y2={`${y2}%`}
                      stroke="#fbbf24"
                      strokeWidth="4"
                      strokeLinecap="round"
                      className="animate-draw-line"
                    />
                  );
                })}
              </svg>
            )}
          </div>
        </div>

        {/* 游戏提示 */}
        <div className="bg-gradient-to-r from-green-100 to-teal-100 rounded-2xl p-4 shadow-lg animate-fade-in-up delay-300">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-400 rounded-full flex items-center justify-center shadow-md animate-bounce-gentle">
              <span className="text-2xl">💡</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-700">游戏提示</p>
              <p className="text-xs text-gray-600">点击两个相同的图标，路径转折不超过2次即可消除！</p>
            </div>
          </div>
        </div>
      </div>

      {/* 暂停遮罩 */}
      {gameState === 'paused' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm mx-4 shadow-2xl animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Pause className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-black text-gray-800 mb-2">游戏暂停</h2>
              <p className="text-gray-600">休息一下，继续挑战～</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setGameState('playing')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-2xl font-black shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
              >
                继续游戏
              </button>
              <button
                onClick={resetGame}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-2xl font-black shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                重新开始
              </button>
              <button
                onClick={onBack}
                className="w-full bg-gray-200 text-gray-700 py-4 rounded-2xl font-black shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 胜利遮罩 */}
      {gameState === 'won' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm mx-4 shadow-2xl animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce-gentle">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 mb-2">
                恭喜过关！
              </h2>
              <p className="text-gray-600 mb-4">你的观察力真棒！</p>
              <div className="bg-gradient-to-r from-green-100 to-teal-100 rounded-2xl p-4 border-2 border-green-200">
                <p className="text-sm text-gray-600 mb-1">最终分数</p>
                <p className="text-4xl font-black text-green-600">{score}</p>
                <p className="text-xs text-gray-500 mt-2">剩余时间: {formatTime(time)}</p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={resetGame}
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-4 rounded-2xl font-black shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                再玩一局
              </button>
              <button
                onClick={onBack}
                className="w-full bg-gray-200 text-gray-700 py-4 rounded-2xl font-black shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 失败遮罩 */}
      {gameState === 'lost' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm mx-4 shadow-2xl animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-5xl">⏰</span>
              </div>
              <h2 className="text-3xl font-black text-gray-800 mb-2">时间到！</h2>
              <p className="text-gray-600 mb-4">差一点就成功了，再试一次吧！</p>
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4">
                <p className="text-sm text-gray-600 mb-1">获得分数</p>
                <p className="text-4xl font-black text-purple-600">{score}</p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={resetGame}
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-4 rounded-2xl font-black shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                重新挑战
              </button>
              <button
                onClick={onBack}
                className="w-full bg-gray-200 text-gray-700 py-4 rounded-2xl font-black shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-down {
          from { 
            opacity: 0;
            transform: translateY(-20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { 
            opacity: 0;
            transform: translateY(10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce-in {
          0% { 
            opacity: 0;
            transform: scale(0.3);
          }
          50% { 
            transform: scale(1.1);
          }
          100% { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes scale-in {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes spin-out {
          from { transform: rotate(0deg) scale(1); opacity: 1; }
          to { transform: rotate(360deg) scale(0); opacity: 0; }
        }
        
        @keyframes draw-line {
          from { stroke-dashoffset: 1000; }
          to { stroke-dashoffset: 0; }
        }
        
        .animate-slide-down {
          animation: slide-down 0.6s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
        
        .animate-spin-out {
          animation: spin-out 0.5s ease-out;
        }
        
        .animate-draw-line {
          stroke-dasharray: 1000;
          animation: draw-line 0.5s ease-out forwards;
        }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
      `}</style>
    </div>
  );
}
