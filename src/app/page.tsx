/**
 * 游戏主页面
 * 基于 Figma 设计实现
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TabBar } from '@/components/layout/TabBar';
import {
  SearchBar,
  CategoryTabs,
  HotGameBanner,
  GameCard,
  defaultCategories,
} from '@/components/home';
import type { TabItem } from '@/components/layout/TabBar';
import type { GameCardData } from '@/components/home';

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

// 模拟游戏数据
const gamesData: GameCardData[] = [
  {
    id: 'fruit-match',
    name: '水果消消乐',
    category: '休闲益智',
    icon: '🍓',
    rating: 4.8,
    playCount: '1.2万',
    isHot: true,
    gradientColor: 'pink',
  },
  {
    id: '2',
    name: '跑酷大冒险',
    category: '动作跑酷',
    icon: '🏃',
    rating: 4.6,
    playCount: '8.5千',
    isHot: true,
    gradientColor: 'blue',
  },
  {
    id: '3',
    name: '泡泡射击',
    category: '休闲益智',
    icon: '🎯',
    rating: 4.5,
    playCount: '5.3千',
    gradientColor: 'purple',
  },
  {
    id: '4',
    name: '贪吃蛇',
    category: '经典怀旧',
    icon: '🐍',
    rating: 4.7,
    playCount: '9.1千',
    isNew: true,
    gradientColor: 'green',
  },
  {
    id: '5',
    name: '俄罗斯方块',
    category: '经典怀旧',
    icon: '🧱',
    rating: 4.9,
    playCount: '6.8千',
    gradientColor: 'orange',
  },
  {
    id: '6',
    name: '记忆翻牌',
    category: '益智训练',
    icon: '🎴',
    rating: 4.4,
    playCount: '4.2千',
    gradientColor: 'red',
  },
  {
    id: '7',
    name: '连连看',
    category: '休闲益智',
    icon: '🎲',
    rating: 4.6,
    playCount: '7.6千',
    gradientColor: 'cyan',
  },
  {
    id: '8',
    name: '翻转方块',
    category: '益智训练',
    icon: '🔄',
    rating: 4.3,
    playCount: '3.5千',
    isNew: true,
    gradientColor: 'violet',
  },
];

// 用户信息类型
interface UserInfo {
  id: string;
  username: string | null;
  level: number;
  totalScore: number;
  gamesPlayed: number;
}

export default function HomePage() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

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
          }
        }

        setUserId(storedUserId);

        // 获取用户信息
        if (storedUserId) {
          const userResponse = await fetch(`/api/users/${storedUserId}`);
          if (userResponse.ok) {
            const { data } = await userResponse.json();
            setUserInfo(data);
          }
        }
      } catch (error) {
        console.error('用户初始化失败:', error);
      }
    };

    initUser();
  }, []);

  // 过滤游戏
  const filteredGames = gamesData.filter((game) => {
    // 搜索过滤
    if (searchValue && !game.name.toLowerCase().includes(searchValue.toLowerCase())) {
      return false;
    }
    // 分类过滤
    if (activeCategory !== 'all') {
      const categoryMap: Record<string, string[]> = {
        puzzle: ['休闲益智', '益智训练'],
        action: ['动作跑酷'],
        classic: ['经典怀旧'],
      };
      if (!categoryMap[activeCategory]?.includes(game.category)) {
        return false;
      }
    }
    return true;
  });

  const handleGameClick = (gameId: string) => {
    router.push(`/games/${gameId}`);
  };

  const handleHotGamePlay = () => {
    router.push('/games/fruit-match'); // 水果消消乐
  };

  return (
    <div
      className="min-h-screen pb-24"
      style={{
        background: 'linear-gradient(to bottom, #f3e8ff, #ffedd4)',
      }}
    >
      <div className="max-w-md mx-auto px-4 pt-4 flex flex-col gap-6">
        {/* 头部区域 */}
        <div className="flex flex-col gap-4 animate-slide-down">
          {/* 欢迎语和游戏图标 */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h1
                className="text-[30px] font-black leading-9"
                style={{
                  background: 'linear-gradient(90deg, #9810fa 0%, #e60076 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                嗨！{userInfo?.username || '玩家'} 👋
              </h1>
              <p className="text-[16px] font-medium text-[#4a5565] leading-6">
                {userInfo ? `等级 ${userInfo.level} · 总分 ${userInfo.totalScore}` : '今天想玩什么游戏呢？'}
              </p>
            </div>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg animate-bounce-gentle"
              style={{
                backgroundImage: 'linear-gradient(135deg, #fdc700 0%, #ff6900 100%)',
              }}
            >
              <span className="text-[30px]">🎮</span>
            </div>
          </div>

          {/* 搜索框 */}
          <SearchBar
            value={searchValue}
            onChange={setSearchValue}
          />
        </div>

        {/* 游戏分类 */}
        <div className="animate-fade-in-up delay-100">
          <CategoryTabs
            categories={defaultCategories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        {/* 热门游戏横幅 */}
        <div className="animate-fade-in-up delay-200">
          <HotGameBanner
            title="🍬 消消乐大师"
            subtitle="本周最热"
            playerCount="已有 12,000+ 玩家在线！"
            onPlay={handleHotGamePlay}
          />
        </div>

        {/* 精选游戏 */}
        <div className="flex flex-col gap-4 animate-fade-in-up delay-300">
          {/* 标题 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] font-black text-[#1e2939] leading-7">
                精选游戏
              </h2>
              <span className="text-[18px]">⭐</span>
            </div>
            <span className="text-[14px] font-medium text-[#6a7282]">
              共 {filteredGames.length} 款
            </span>
          </div>

          {/* 游戏网格 */}
          <div className="grid grid-cols-2 gap-4">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onClick={handleGameClick}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 底部导航栏 */}
      <TabBar tabs={tabs} />
    </div>
  );
}
