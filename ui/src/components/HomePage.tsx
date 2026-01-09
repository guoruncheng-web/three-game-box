import { useState } from 'react';
import { Star, Trophy, Clock, TrendingUp, Search, Zap } from 'lucide-react';
import { FruitMatchGame } from './FruitMatchGame';
import { MemoryCardGame } from './MemoryCardGame';
import { LinkGamePage } from './LinkGamePage';

// 模拟游戏数据
const games = [
  {
    id: 1,
    name: '消消乐',
    emoji: '🍬',
    category: '休闲益智',
    players: '1.2万',
    rating: 4.8,
    hot: true,
    color: 'from-pink-400 to-rose-400',
    component: 'fruit-match'
  },
  {
    id: 2,
    name: '跑酷大冒险',
    emoji: '🏃',
    category: '动作跑酷',
    players: '8.5千',
    rating: 4.6,
    hot: true,
    color: 'from-blue-400 to-cyan-400'
  },
  {
    id: 3,
    name: '泡泡射击',
    emoji: '🎯',
    category: '休闲益智',
    players: '5.3千',
    rating: 4.5,
    color: 'from-purple-400 to-indigo-400'
  },
  {
    id: 4,
    name: '贪吃蛇',
    emoji: '🐍',
    category: '经典怀旧',
    players: '9.1千',
    rating: 4.7,
    new: true,
    color: 'from-green-400 to-emerald-400'
  },
  {
    id: 5,
    name: '俄罗斯方块',
    emoji: '🧱',
    category: '经典怀旧',
    players: '6.8千',
    rating: 4.9,
    color: 'from-orange-400 to-amber-400'
  },
  {
    id: 6,
    name: '记忆翻牌',
    emoji: '🎴',
    category: '益智训练',
    players: '4.2千',
    rating: 4.4,
    color: 'from-red-400 to-pink-400',
    component: 'memory-card'
  },
  {
    id: 7,
    name: '连连看',
    emoji: '🎲',
    category: '休闲益智',
    players: '7.6千',
    rating: 4.6,
    color: 'from-teal-400 to-cyan-400',
    component: 'link-game'
  },
  {
    id: 8,
    name: '翻转方块',
    emoji: '🔄',
    category: '益智训练',
    players: '3.5千',
    rating: 4.3,
    new: true,
    color: 'from-violet-400 to-purple-400'
  },
];

const categories = [
  { name: '全部', emoji: '🎮', active: true },
  { name: '休闲益智', emoji: '🧩', active: false },
  { name: '动作跑酷', emoji: '⚡', active: false },
  { name: '经典怀旧', emoji: '👾', active: false },
];

export function HomePage() {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [currentGame, setCurrentGame] = useState<string | null>(null);

  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = selectedCategory === '全部' || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 如果正在玩游戏，显示游戏界面
  if (currentGame === 'fruit-match') {
    return <FruitMatchGame onBack={() => setCurrentGame(null)} />;
  }
  
  if (currentGame === 'memory-card') {
    return <MemoryCardGame onBack={() => setCurrentGame(null)} />;
  }
  
  if (currentGame === 'link-game') {
    return <LinkGamePage onBack={() => setCurrentGame(null)} />;
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-4">
      {/* 头部欢迎区域 */}
      <div className="mb-6 animate-slide-down">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              嗨！玩家 👋
            </h1>
            <p className="text-gray-600 font-medium mt-1">今天想玩什么游戏呢？</p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce-gentle">
            <span className="text-3xl">🎮</span>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="relative animate-fade-in-up delay-100">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="搜索你喜欢的游戏... 🔍"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-3 border-purple-200 rounded-2xl focus:outline-none focus:border-purple-400 focus:scale-[1.02] transition-all duration-300 shadow-md font-medium placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* 分类导航 */}
      <div className="mb-6 animate-fade-in-up delay-200">
        <h2 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
          <span>游戏分类</span>
          <Zap className="w-5 h-5 text-yellow-500" fill="currentColor" />
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => setSelectedCategory(category.name)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-300 ${
                selectedCategory === category.name
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-600 shadow-md hover:shadow-lg hover:scale-105'
              }`}
            >
              <span className="text-lg">{category.emoji}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 热门游戏横幅 */}
      <div className="mb-6 animate-fade-in-up delay-300">
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-6 h-6 text-yellow-300" fill="currentColor" />
              <span className="text-white font-black text-lg">本周最热</span>
            </div>
            <h3 className="text-white text-2xl font-black mb-2">🍬 消消乐大师</h3>
            <p className="text-white/90 text-sm mb-4">已有 12,000+ 玩家在线！</p>
            <button 
              onClick={() => setCurrentGame('fruit-match')}
              className="bg-white text-purple-600 font-black px-6 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg"
            >
              立即开始 →
            </button>
          </div>
        </div>
      </div>

      {/* 游戏列表 */}
      <div className="animate-fade-in-up delay-400">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
            <span>精选游戏</span>
            <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
          </h2>
          <span className="text-sm text-gray-500 font-medium">
            共 {filteredGames.length} 款
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {filteredGames.map((game, index) => (
            <button
              key={game.id}
              onClick={() => game.component && setCurrentGame(game.component)}
              className="bg-white rounded-3xl p-4 shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden group"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* 标签 */}
              {game.hot && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-black px-2 py-1 rounded-full flex items-center gap-1 shadow-lg z-10">
                  <TrendingUp className="w-3 h-3" />
                  <span>HOT</span>
                </div>
              )}
              {game.new && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-black px-2 py-1 rounded-full flex items-center gap-1 shadow-lg z-10">
                  <Zap className="w-3 h-3" fill="currentColor" />
                  <span>NEW</span>
                </div>
              )}

              {/* 游戏图标 */}
              <div className={`w-full aspect-square bg-gradient-to-br ${game.color} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <span className="text-6xl group-hover:animate-wiggle-subtle">{game.emoji}</span>
              </div>

              {/* 游戏信息 */}
              <h3 className="font-black text-gray-800 mb-1 text-left">{game.name}</h3>
              <p className="text-xs text-gray-500 font-medium mb-2 text-left">{game.category}</p>

              {/* 评分和玩家 */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                  <span className="font-bold text-gray-700">{game.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 font-medium">
                  <Clock className="w-3 h-3" />
                  <span>{game.players}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 animate-bounce-gentle">🔍</div>
            <p className="text-gray-500 font-medium">没有找到相关游戏</p>
            <p className="text-gray-400 text-sm mt-2">试试其他关键词吧~</p>
          </div>
        )}
      </div>

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
        
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes wiggle-subtle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        
        .animate-slide-down {
          animation: slide-down 0.6s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
        
        .animate-wiggle-subtle {
          animation: wiggle-subtle 0.5s ease-in-out;
        }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}