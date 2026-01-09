import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Star, Timer, Move, Trophy, RotateCcw, Pause, Play, Volume2, VolumeX, Zap } from 'lucide-react';

interface MemoryCardGameProps {
  onBack: () => void;
}

type CardEmoji = '🎈' | '🎨' | '🎭' | '🎪' | '🎸' | '🎯' | '🎮' | '🎲';

interface Card {
  id: number;
  emoji: CardEmoji;
  isFlipped: boolean;
  isMatched: boolean;
}

const emojis: CardEmoji[] = ['🎈', '🎨', '🎭', '🎪', '🎸', '🎯', '🎮', '🎲'];

export function MemoryCardGame({ onBack }: MemoryCardGameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'won'>('playing');
  const [time, setTime] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [canFlip, setCanFlip] = useState(true);
  const [combo, setCombo] = useState(0);

  // 初始化游戏
  const initializeGame = useCallback(() => {
    const gameCards: Card[] = [];
    let id = 0;

    // 创建成对的卡片
    emojis.forEach(emoji => {
      gameCards.push(
        { id: id++, emoji, isFlipped: false, isMatched: false },
        { id: id++, emoji, isFlipped: false, isMatched: false }
      );
    });

    // 洗牌
    for (let i = gameCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]];
    }

    setCards(gameCards);
    setFlippedCards([]);
    setMoves(0);
    setMatchedPairs(0);
    setTime(0);
    setGameState('playing');
    setCombo(0);
  }, []);

  // 计时器
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  // 翻牌逻辑
  const handleCardClick = useCallback((cardId: number) => {
    if (!canFlip || gameState !== 'playing') return;

    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    if (flippedCards.length === 0) {
      // 翻第一张牌
      setFlippedCards([cardId]);
      setCards(prev =>
        prev.map(c => (c.id === cardId ? { ...c, isFlipped: true } : c))
      );
    } else if (flippedCards.length === 1) {
      if (flippedCards[0] === cardId) return;

      // 翻第二张牌
      setFlippedCards(prev => [...prev, cardId]);
      setCards(prev =>
        prev.map(c => (c.id === cardId ? { ...c, isFlipped: true } : c))
      );
      setMoves(prev => prev + 1);
      setCanFlip(false);

      // 检查是否匹配
      const firstCard = cards.find(c => c.id === flippedCards[0]);
      const secondCard = cards.find(c => c.id === cardId);

      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        // 匹配成功
        setTimeout(() => {
          setCards(prev =>
            prev.map(c =>
              c.id === flippedCards[0] || c.id === cardId
                ? { ...c, isMatched: true }
                : c
            )
          );
          setMatchedPairs(prev => prev + 1);
          setFlippedCards([]);
          setCanFlip(true);
          setCombo(prev => prev + 1);
          setTimeout(() => setCombo(0), 1000);
        }, 600);
      } else {
        // 不匹配，翻回去
        setTimeout(() => {
          setCards(prev =>
            prev.map(c =>
              c.id === flippedCards[0] || c.id === cardId
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedCards([]);
          setCanFlip(true);
          setCombo(0);
        }, 1000);
      }
    }
  }, [cards, flippedCards, canFlip, gameState]);

  // 初始化
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // 检查游戏胜利
  useEffect(() => {
    if (matchedPairs === emojis.length && matchedPairs > 0) {
      setGameState('won');
      if (bestScore === null || moves < bestScore) {
        setBestScore(moves);
      }
    }
  }, [matchedPairs, moves, bestScore]);

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 重置游戏
  const resetGame = () => {
    initializeGame();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 via-purple-200 to-pink-200 pb-6">
      <div className="max-w-md mx-auto px-4 pt-4">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-4 animate-slide-down">
          <button
            onClick={onBack}
            className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            记忆翻牌 🎴
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300"
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-blue-600" />
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
        <div className="grid grid-cols-3 gap-3 mb-4 animate-fade-in-up delay-100">
          <div className="bg-white rounded-2xl p-3 shadow-lg text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Timer className="w-4 h-4 text-blue-500" />
              <p className="text-xs font-bold text-gray-600">时间</p>
            </div>
            <p className="text-xl font-black text-blue-600">{formatTime(time)}</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-lg text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Move className="w-4 h-4 text-purple-500" />
              <p className="text-xs font-bold text-gray-600">移动</p>
            </div>
            <p className="text-xl font-black text-purple-600">{moves}</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-lg text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
              <p className="text-xs font-bold text-gray-600">配对</p>
            </div>
            <p className="text-xl font-black text-pink-600">
              {matchedPairs}/{emojis.length}
            </p>
          </div>
        </div>

        {/* 连击提示 */}
        {combo > 0 && (
          <div className="mb-4 animate-bounce-in">
            <div className="bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl p-3 shadow-lg text-center">
              <p className="text-white font-black text-lg flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" fill="currentColor" />
                {combo}连击！继续加油！
              </p>
            </div>
          </div>
        )}

        {/* 最佳记录 */}
        {bestScore !== null && (
          <div className="mb-4 animate-fade-in-up delay-200">
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-3 border-2 border-yellow-300">
              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <p className="text-sm font-bold text-gray-700">
                  最佳记录：<span className="text-yellow-600">{bestScore}</span> 步
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 游戏网格 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-4 shadow-2xl mb-4 animate-fade-in-up delay-300">
          <div className="grid grid-cols-4 gap-3">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                disabled={!canFlip || gameState !== 'playing' || card.isMatched}
                className={`aspect-square rounded-2xl flex items-center justify-center text-4xl transition-all duration-500 transform-style-3d ${
                  card.isFlipped || card.isMatched
                    ? 'bg-gradient-to-br from-white to-gray-50 shadow-lg scale-105'
                    : 'bg-gradient-to-br from-blue-400 to-purple-400 shadow-md hover:scale-110 active:scale-95'
                } ${card.isMatched ? 'ring-4 ring-green-400 animate-pulse-success' : ''}`}
                style={{
                  transform: card.isFlipped || card.isMatched ? 'rotateY(0deg)' : 'rotateY(0deg)',
                }}
              >
                {card.isFlipped || card.isMatched ? (
                  <span className={card.isMatched ? 'animate-bounce-gentle' : 'animate-flip-in'}>
                    {card.emoji}
                  </span>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="absolute inset-2 bg-white/20 rounded-xl"></div>
                    <span className="text-white text-3xl relative z-10">❓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 游戏提示 */}
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-4 shadow-lg animate-fade-in-up delay-400">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center shadow-md animate-bounce-gentle">
              <span className="text-2xl">💡</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-700">游戏提示</p>
              <p className="text-xs text-gray-600">翻开两张卡片，找出所有相同的配对！记住它们的位置～</p>
            </div>
          </div>
        </div>

        {/* 重置按钮 */}
        <button
          onClick={resetGame}
          className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-black shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 animate-fade-in-up delay-500"
        >
          <RotateCcw className="w-5 h-5" />
          重新开始
        </button>
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
              <p className="text-gray-600">休息一下，动动脑筋～</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-2xl p-3">
                  <p className="text-xs text-gray-600">用时</p>
                  <p className="text-lg font-black text-blue-600">{formatTime(time)}</p>
                </div>
                <div className="bg-purple-50 rounded-2xl p-3">
                  <p className="text-xs text-gray-600">步数</p>
                  <p className="text-lg font-black text-purple-600">{moves}</p>
                </div>
              </div>
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
          <div className="bg-white rounded-3xl p-8 max-w-sm mx-4 shadow-2xl animate-scale-in relative overflow-hidden">
            {/* 庆祝装饰 */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute top-10 left-10 text-4xl animate-float-1">🎉</div>
              <div className="absolute top-20 right-10 text-3xl animate-float-2">⭐</div>
              <div className="absolute bottom-20 left-16 text-3xl animate-float-3">🎊</div>
              <div className="absolute bottom-10 right-20 text-4xl animate-float-4">✨</div>
            </div>

            <div className="text-center relative z-10">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce-gentle">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 mb-2">
                太棒了！
              </h2>
              <p className="text-gray-600 mb-6">你的记忆力真不错！</p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-4 border-2 border-blue-200">
                  <Timer className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-600 mb-1">用时</p>
                  <p className="text-2xl font-black text-blue-600">{formatTime(time)}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-4 border-2 border-purple-200">
                  <Move className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-600 mb-1">步数</p>
                  <p className="text-2xl font-black text-purple-600">{moves}</p>
                </div>
              </div>

              {bestScore === moves && (
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-3 mb-4 border-2 border-yellow-300">
                  <p className="text-sm font-black text-yellow-700 flex items-center justify-center gap-2">
                    <Trophy className="w-4 h-4" />
                    新纪录！这是你的最好成绩！
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3 relative z-10">
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
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-5px) scale(1.05); }
        }
        
        @keyframes flip-in {
          from { 
            transform: rotateY(90deg);
            opacity: 0;
          }
          to { 
            transform: rotateY(0deg);
            opacity: 1;
          }
        }
        
        @keyframes pulse-success {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
          50% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
        }
        
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-10deg); }
        }
        
        @keyframes float-3 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(15deg); }
        }
        
        @keyframes float-4 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(-15deg); }
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
        
        .animate-flip-in {
          animation: flip-in 0.5s ease-out;
        }
        
        .animate-pulse-success {
          animation: pulse-success 1.5s infinite;
        }
        
        .animate-float-1 {
          animation: float-1 3s ease-in-out infinite;
        }
        
        .animate-float-2 {
          animation: float-2 3.5s ease-in-out infinite 0.5s;
        }
        
        .animate-float-3 {
          animation: float-3 4s ease-in-out infinite 1s;
        }
        
        .animate-float-4 {
          animation: float-4 3.2s ease-in-out infinite 1.5s;
        }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        
        .transform-style-3d {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
}
