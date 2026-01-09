'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { generateGames } from '@/mocks/games.mock';
import type { Game } from '@/types/game';

// 格式化播放次数
function formatPlayCount(count: number): string {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

// 游戏卡片组件
function GameCard({ game }: { game: Game }) {
  return (
    <div className="
      group relative
      bg-white rounded-3xl overflow-hidden
      shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-float)]
      transition-all duration-300
      hover:-translate-y-2
      border-2 border-transparent
      hover:border-[var(--candy-pink)]/30
      active:scale-95
    ">
      {/* 游戏封面 */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[var(--game-primary)] to-[var(--game-secondary)]">
        <Image 
          src={game.thumbnail} 
          alt={game.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          unoptimized
        />
        
        {/* 分类标签 */}
        <div className="absolute top-3 left-3">
          <span className="
            px-3 py-1 
            bg-white/90 backdrop-blur-sm
            rounded-full text-sm font-medium
            text-[var(--game-primary)]
            shadow-[var(--shadow-xs)]
          ">
            {game.category}
          </span>
        </div>
        
        {/* 热门/新品标签 */}
        {game.isHot && (
          <div className="absolute top-3 right-3">
            <span className="
              px-2 py-1
              bg-gradient-to-r from-[var(--candy-red)] to-[var(--candy-orange)]
              rounded-full text-xs font-bold text-white
              animate-pulse
            ">
              🔥 热门
            </span>
          </div>
        )}
        {game.isNew && !game.isHot && (
          <div className="absolute top-3 right-3">
            <span className="
              px-2 py-1
              bg-gradient-to-r from-[var(--candy-green)] to-[var(--candy-teal)]
              rounded-full text-xs font-bold text-white
            ">
              ✨ 新品
            </span>
          </div>
        )}
        
        {/* 游戏图标 */}
        <div className="
          absolute -bottom-6 right-4
          w-14 h-14 
          bg-gradient-to-br from-[var(--candy-pink)] to-[var(--candy-orange)]
          rounded-2xl shadow-[var(--shadow-card)]
          flex items-center justify-center
          text-2xl
          group-hover:scale-110
          transition-transform duration-300
          border-4 border-white
        ">
          {game.icon}
        </div>
      </div>
      
      {/* 内容 */}
      <div className="p-4 pt-6">
        <h3 className="font-game text-lg text-[var(--text-primary)] mb-1 truncate">
          {game.name}
        </h3>
        <p className="text-[var(--text-secondary)] text-sm line-clamp-2 min-h-[2.5rem]">
          {game.description}
        </p>
        
        {/* 底部信息 */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1">
            <span className="text-[var(--candy-yellow)] text-base drop-shadow">⭐</span>
            <span className="font-bold text-[var(--text-primary)]">{game.rating}</span>
          </div>
          <div className="flex items-center gap-1 text-[var(--text-muted)] text-xs">
            <span>🎮</span>
            <span>{formatPlayCount(game.playCount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 首页组件
export default function HomePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 模拟加载游戏数据
    const timer = setTimeout(() => {
      setGames(generateGames(8));
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen pb-20 safe-area-inset">
      {/* 头部 */}
      <header className="
        sticky top-0 z-40
        bg-white/80 backdrop-blur-lg
        border-b border-[var(--border-light)]
        px-4 py-4
      ">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="font-game text-2xl bg-gradient-to-r from-[var(--game-primary)] to-[var(--game-secondary)] bg-clip-text text-transparent">
            🎮 游戏盒子
          </h1>
          <button className="
            w-10 h-10
            bg-[var(--bg-secondary)]
            rounded-xl
            flex items-center justify-center
            text-xl
            active:scale-90
            transition-transform
          ">
            🔍
          </button>
        </div>
      </header>

      {/* 分类导航 */}
      <nav className="px-4 py-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 max-w-7xl mx-auto">
          {['全部', '热门', '益智', '动作', '休闲', '竞速'].map((cat, i) => (
            <button
              key={cat}
              className={`
                px-4 py-2
                rounded-full
                font-medium text-sm
                whitespace-nowrap
                transition-all duration-200
                active:scale-95
                ${i === 0 
                  ? 'bg-gradient-to-r from-[var(--game-primary)] to-[var(--game-secondary)] text-white shadow-[var(--shadow-button)]' 
                  : 'bg-white text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* 游戏列表 */}
      <section className="px-4 py-4">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            // 骨架屏
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-[var(--shadow-card)] animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-4 pt-6">
                    <div className="h-5 bg-gray-200 rounded-lg mb-2 w-3/4" />
                    <div className="h-4 bg-gray-200 rounded-lg mb-1 w-full" />
                    <div className="h-4 bg-gray-200 rounded-lg w-2/3" />
                    <div className="flex justify-between mt-3">
                      <div className="h-4 bg-gray-200 rounded-lg w-12" />
                      <div className="h-4 bg-gray-200 rounded-lg w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {games.map((game, i) => (
                <div 
                  key={game.id}
                  style={{ animationDelay: `${i * 0.05}s` }}
                  className="animate-[slideUp_0.5s_ease-out_forwards] opacity-0"
                >
                  <GameCard game={game} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 底部导航 */}
      <nav className="
        fixed bottom-0 left-0 right-0
        bg-white/90 backdrop-blur-lg
        border-t border-[var(--border-light)]
        px-4 py-2
        pb-[max(0.5rem,env(safe-area-inset-bottom))]
        z-50
      ">
        <div className="max-w-md mx-auto flex justify-around">
          {[
            { icon: '🏠', label: '首页', active: true },
            { icon: '🎯', label: '分类', active: false },
            { icon: '❤️', label: '收藏', active: false },
            { icon: '👤', label: '我的', active: false },
          ].map((item) => (
            <button
              key={item.label}
              className={`
                flex flex-col items-center gap-1
                py-2 px-4
                rounded-xl
                transition-all duration-200
                active:scale-90
                ${item.active 
                  ? 'text-[var(--game-primary)]' 
                  : 'text-[var(--text-muted)]'
                }
              `}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}
