/**
 * 游戏数据 Mock
 */

import Mock from 'mockjs';
import type { Game, GameCategory } from '@/types/game';

const Random = Mock.Random;

// 游戏分类
const categories: GameCategory[] = ['action', 'puzzle', 'arcade', 'casual', 'racing', 'shooter'];

// 游戏图标
const gameIcons = ['🎮', '🎯', '🎪', '🎨', '🚀', '🏃', '🧩', '🎲', '🏎️', '⚽', '🎳', '🎰'];

// 预设游戏数据
const presetGames: Partial<Game>[] = [
  {
    id: 'cube-runner',
    name: '立方体跑酷',
    description: '控制立方体躲避障碍物，看看你能跑多远！简单易上手，考验反应力。',
    icon: '🏃',
    category: 'arcade',
    difficulty: 'easy',
    isHot: true,
  },
  {
    id: 'space-shooter',
    name: '太空射击',
    description: '驾驶飞船在太空中消灭敌人，收集道具升级武器，成为宇宙英雄！',
    icon: '🚀',
    category: 'shooter',
    difficulty: 'medium',
    isHot: true,
  },
  {
    id: 'puzzle-3d',
    name: '3D 拼图',
    description: '挑战你的空间思维能力，将碎片拼成完整的3D图形。',
    icon: '🧩',
    category: 'puzzle',
    difficulty: 'hard',
    isNew: true,
  },
  {
    id: 'ball-maze',
    name: '迷宫滚球',
    description: '倾斜手机控制小球滚动，穿越复杂迷宫到达终点。',
    icon: '⚽',
    category: 'puzzle',
    difficulty: 'medium',
  },
  {
    id: 'tower-stack',
    name: '堆叠高塔',
    description: '精准堆叠方块，建造最高的塔楼。考验你的手眼协调能力！',
    icon: '🏗️',
    category: 'casual',
    difficulty: 'easy',
    isNew: true,
  },
  {
    id: 'color-match',
    name: '颜色消消乐',
    description: '匹配相同颜色的方块，连续消除获得高分，解锁特殊道具。',
    icon: '🎨',
    category: 'puzzle',
    difficulty: 'easy',
    isHot: true,
  },
  {
    id: 'racing-drift',
    name: '漂移竞速',
    description: '在弯曲的赛道上漂移过弯，超越对手冲向终点！',
    icon: '🏎️',
    category: 'racing',
    difficulty: 'medium',
  },
  {
    id: 'fruit-ninja',
    name: '水果忍者',
    description: '挥动手指切开飞来的水果，避开炸弹，成为切水果大师！',
    icon: '🍉',
    category: 'action',
    difficulty: 'easy',
  },
];

/**
 * 生成游戏数据
 */
export function generateGames(count: number = 8): Game[] {
  return presetGames.slice(0, count).map((preset, index) => ({
    id: preset.id || Random.guid(),
    name: preset.name || Random.ctitle(3, 6),
    description: preset.description || Random.cparagraph(1, 2),
    thumbnail: `https://picsum.photos/seed/${preset.id || index}/400/300`,
    icon: preset.icon || Random.pick(gameIcons),
    category: preset.category || Random.pick(categories),
    difficulty: preset.difficulty || Random.pick(['easy', 'medium', 'hard']),
    rating: Number((Random.float(3.5, 5, 1, 1)).toFixed(1)),
    playCount: Random.integer(1000, 100000),
    isHot: preset.isHot || false,
    isNew: preset.isNew || false,
    createdAt: Random.datetime(),
    updatedAt: Random.datetime(),
  })) as Game[];
}

/**
 * 生成随机游戏
 */
export function generateRandomGame(): Game {
  return {
    id: Random.guid(),
    name: Random.ctitle(3, 6),
    description: Random.cparagraph(1, 2),
    thumbnail: `https://picsum.photos/seed/${Random.word()}/400/300`,
    icon: Random.pick(gameIcons),
    category: Random.pick(categories),
    difficulty: Random.pick(['easy', 'medium', 'hard']),
    rating: Number((Random.float(3.5, 5, 1, 1)).toFixed(1)),
    playCount: Random.integer(1000, 100000),
    isHot: Random.boolean(),
    isNew: Random.boolean(),
    createdAt: Random.datetime(),
    updatedAt: Random.datetime(),
  } as Game;
}

// Mock API
Mock.mock('/api/games', 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: generateGames(8),
  };
});

Mock.mock(/\/api\/games\/\w+/, 'get', (options: { url: string }) => {
  const id = options.url.split('/').pop();
  const games = generateGames(8);
  const game = games.find(g => g.id === id);
  
  return {
    code: game ? 200 : 404,
    message: game ? 'success' : 'Game not found',
    data: game || null,
  };
});

export default Mock;
