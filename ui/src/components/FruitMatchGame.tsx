import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Star, Target, Zap, Trophy, RotateCcw, Pause, Play, Volume2, VolumeX } from 'lucide-react';

interface FruitMatchGameProps {
  onBack: () => void;
}

type Fruit = '🍎' | '🍊' | '🍋' | '🍇' | '🍓' | '🍉' | '🍒';
const fruits: Fruit[] = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍉', '🍒'];

interface Cell {
  fruit: Fruit;
  id: number;
  isMatched: boolean;
  isSelected: boolean;
}

const GRID_SIZE = 8;
const TARGET_SCORE = 1000;
const MAX_MOVES = 30;

export function FruitMatchGame({ onBack }: FruitMatchGameProps) {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(MAX_MOVES);
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'won' | 'lost'>('playing');
  const [combo, setCombo] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  // 初始化游戏网格
  const initializeGrid = useCallback(() => {
    const newGrid: Cell[][] = [];
    let id = 0;

    for (let row = 0; row < GRID_SIZE; row++) {
      newGrid[row] = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        newGrid[row][col] = {
          fruit: fruits[Math.floor(Math.random() * fruits.length)],
          id: id++,
          isMatched: false,
          isSelected: false,
        };
      }
    }

    return newGrid;
  }, []);

  // 检查匹配
  const checkMatches = useCallback((currentGrid: Cell[][]) => {
    const matches: { row: number; col: number }[] = [];

    // 检查横向匹配
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE - 2; col++) {
        const fruit = currentGrid[row][col].fruit;
        if (
          fruit === currentGrid[row][col + 1].fruit &&
          fruit === currentGrid[row][col + 2].fruit
        ) {
          matches.push({ row, col });
          matches.push({ row, col: col + 1 });
          matches.push({ row, col: col + 2 });
        }
      }
    }

    // 检查纵向匹配
    for (let col = 0; col < GRID_SIZE; col++) {
      for (let row = 0; row < GRID_SIZE - 2; row++) {
        const fruit = currentGrid[row][col].fruit;
        if (
          fruit === currentGrid[row + 1][col].fruit &&
          fruit === currentGrid[row + 2][col].fruit
        ) {
          matches.push({ row, col });
          matches.push({ row: row + 1, col });
          matches.push({ row: row + 2, col });
        }
      }
    }

    return matches;
  }, []);

  // 移除匹配的水果
  const removeMatches = useCallback((currentGrid: Cell[][], matches: { row: number; col: number }[]) => {
    const newGrid = currentGrid.map(row => row.map(cell => ({ ...cell })));
    const uniqueMatches = Array.from(new Set(matches.map(m => `${m.row},${m.col}`)))
      .map(str => {
        const [row, col] = str.split(',').map(Number);
        return { row, col };
      });

    uniqueMatches.forEach(({ row, col }) => {
      newGrid[row][col].isMatched = true;
    });

    return { newGrid, matchCount: uniqueMatches.length };
  }, []);

  // 水果下落
  const dropFruits = useCallback((currentGrid: Cell[][]) => {
    const newGrid = currentGrid.map(row => row.map(cell => ({ ...cell })));
    let idCounter = GRID_SIZE * GRID_SIZE;

    for (let col = 0; col < GRID_SIZE; col++) {
      let emptySpaces = 0;

      for (let row = GRID_SIZE - 1; row >= 0; row--) {
        if (newGrid[row][col].isMatched) {
          emptySpaces++;
        } else if (emptySpaces > 0) {
          newGrid[row + emptySpaces][col] = { ...newGrid[row][col] };
          newGrid[row][col] = {
            fruit: fruits[Math.floor(Math.random() * fruits.length)],
            id: idCounter++,
            isMatched: false,
            isSelected: false,
          };
        }
      }

      for (let row = 0; row < emptySpaces; row++) {
        newGrid[row][col] = {
          fruit: fruits[Math.floor(Math.random() * fruits.length)],
          id: idCounter++,
          isMatched: false,
          isSelected: false,
        };
      }
    }

    return newGrid;
  }, []);

  // 处理匹配和下落的循环
  const processMatches = useCallback(async (currentGrid: Cell[][]) => {
    let newGrid = currentGrid;
    let totalMatches = 0;
    let currentCombo = 0;

    while (true) {
      const matches = checkMatches(newGrid);
      if (matches.length === 0) break;

      const { newGrid: gridAfterRemoval, matchCount } = removeMatches(newGrid, matches);
      totalMatches += matchCount;
      currentCombo++;

      await new Promise(resolve => setTimeout(resolve, 300));
      newGrid = dropFruits(gridAfterRemoval);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    if (totalMatches > 0) {
      const points = totalMatches * 10 * Math.max(1, currentCombo);
      setScore(prev => prev + points);
      setCombo(currentCombo);
      setTimeout(() => setCombo(0), 1000);
    }

    return newGrid;
  }, [checkMatches, removeMatches, dropFruits]);

  // 交换水果
  const swapFruits = useCallback(async (row1: number, col1: number, row2: number, col2: number) => {
    if (isAnimating) return;
    setIsAnimating(true);

    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    const temp = newGrid[row1][col1];
    newGrid[row1][col1] = newGrid[row2][col2];
    newGrid[row2][col2] = temp;

    setGrid(newGrid);
    await new Promise(resolve => setTimeout(resolve, 200));

    const matches = checkMatches(newGrid);

    if (matches.length > 0) {
      setMoves(prev => prev - 1);
      const finalGrid = await processMatches(newGrid);
      setGrid(finalGrid);
    } else {
      // 交换回来
      const revertGrid = newGrid.map(row => row.map(cell => ({ ...cell })));
      const tempRevert = revertGrid[row1][col1];
      revertGrid[row1][col1] = revertGrid[row2][col2];
      revertGrid[row2][col2] = tempRevert;
      setGrid(revertGrid);
    }

    setIsAnimating(false);
  }, [grid, checkMatches, processMatches, isAnimating]);

  // 处理点击
  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState !== 'playing' || isAnimating) return;

    if (selectedCell === null) {
      const newGrid = grid.map(r => r.map(cell => ({ ...cell, isSelected: false })));
      newGrid[row][col].isSelected = true;
      setGrid(newGrid);
      setSelectedCell({ row, col });
    } else {
      const rowDiff = Math.abs(selectedCell.row - row);
      const colDiff = Math.abs(selectedCell.col - col);

      if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
        swapFruits(selectedCell.row, selectedCell.col, row, col);
      }

      const newGrid = grid.map(r => r.map(cell => ({ ...cell, isSelected: false })));
      setGrid(newGrid);
      setSelectedCell(null);
    }
  }, [selectedCell, grid, gameState, swapFruits, isAnimating]);

  // 重置游戏
  const resetGame = () => {
    setGrid(initializeGrid());
    setScore(0);
    setMoves(MAX_MOVES);
    setGameState('playing');
    setCombo(0);
    setSelectedCell(null);
  };

  // 初始化
  useEffect(() => {
    setGrid(initializeGrid());
  }, [initializeGrid]);

  // 检查游戏结束
  useEffect(() => {
    if (gameState === 'playing') {
      if (score >= TARGET_SCORE) {
        setGameState('won');
      } else if (moves <= 0) {
        setGameState('lost');
      }
    }
  }, [score, moves, gameState]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-200 via-purple-200 to-blue-200 pb-6">
      <div className="max-w-md mx-auto px-4 pt-4">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-4 animate-slide-down">
          <button
            onClick={onBack}
            className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
            水果消消乐 🍓
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300"
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-purple-600" />
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

        {/* 分数和目标 */}
        <div className="grid grid-cols-3 gap-3 mb-4 animate-fade-in-up delay-100">
          <div className="bg-white rounded-2xl p-3 shadow-lg text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
              <p className="text-xs font-bold text-gray-600">分数</p>
            </div>
            <p className="text-2xl font-black text-purple-600">{score}</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-lg text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-4 h-4 text-blue-500" />
              <p className="text-xs font-bold text-gray-600">目标</p>
            </div>
            <p className="text-2xl font-black text-blue-600">{TARGET_SCORE}</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-lg text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-4 h-4 text-orange-500" fill="currentColor" />
              <p className="text-xs font-bold text-gray-600">移动</p>
            </div>
            <p className={`text-2xl font-black ${moves <= 5 ? 'text-red-600' : 'text-orange-600'}`}>
              {moves}
            </p>
          </div>
        </div>

        {/* 连击提示 */}
        {combo > 1 && (
          <div className="mb-4 animate-bounce-in">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-3 shadow-lg text-center">
              <p className="text-white font-black text-lg">
                🔥 {combo}连击! +{combo * 10} 分
              </p>
            </div>
          </div>
        )}

        {/* 游戏网格 */}
        <div
          className="rounded-3xl p-4 shadow-2xl mb-4 animate-fade-in-up delay-200 overflow-hidden relative"
          style={{
            backgroundImage: "url('/images/board.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: 'transparent',
          }}
        >
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <button
                  key={cell.id}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  disabled={gameState !== 'playing' || isAnimating}
                  className={`aspect-square rounded-xl flex items-center justify-center text-3xl transition-all duration-300 ${cell.isSelected
                    ? 'bg-gradient-to-br from-yellow-300 to-orange-300 scale-110 shadow-lg ring-4 ring-yellow-400'
                    : cell.isMatched
                      ? 'bg-gradient-to-br from-green-200 to-emerald-200 scale-75 opacity-50'
                      : 'bg-gradient-to-br from-purple-100 to-pink-100 hover:scale-110 active:scale-95 shadow-md'
                    }`}
                  style={{
                    animation: cell.isMatched ? 'pop-out 0.3s ease-out' : undefined,
                  }}
                >
                  <span className={cell.isMatched ? 'animate-spin-out' : ''}>{cell.fruit}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* 游戏提示 */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 shadow-lg animate-fade-in-up delay-300">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-md animate-bounce-gentle">
              <span className="text-2xl">💡</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-700">游戏提示</p>
              <p className="text-xs text-gray-600">点击相邻水果交换位置，匹配3个或更多相同水果即可消除！</p>
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
              <p className="text-gray-600">休息一下，继续加油！</p>
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
                恭喜胜利！
              </h2>
              <p className="text-gray-600 mb-4">你真是消消乐高手！</p>
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4">
                <p className="text-sm text-gray-600 mb-1">最终分数</p>
                <p className="text-4xl font-black text-purple-600">{score}</p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={resetGame}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-black shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
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
                <span className="text-5xl">😢</span>
              </div>
              <h2 className="text-3xl font-black text-gray-800 mb-2">游戏结束</h2>
              <p className="text-gray-600 mb-4">差一点就成功了，继续加油！</p>
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4">
                <p className="text-sm text-gray-600 mb-1">获得分数</p>
                <p className="text-4xl font-black text-purple-600">{score}</p>
                <p className="text-xs text-gray-500 mt-2">目标分数: {TARGET_SCORE}</p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={resetGame}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-black shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
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
        
        @keyframes pop-out {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(0); opacity: 0; }
        }
        
        @keyframes spin-out {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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
          animation: spin-out 0.3s ease-out;
        }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
      `}</style>
    </div>
  );
}
