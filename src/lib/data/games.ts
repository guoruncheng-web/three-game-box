/**
 * 游戏数据生成工具
 */

import type { Game, GameCategory } from '@/types/game';

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
 * 生成随机数字
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 生成随机浮点数
 */
function randomFloat(min: number, max: number, decimals: number = 2): number {
  return Number((Math.random() * (max - min) + min).toFixed(decimals));
}

/**
 * 生成随机 GUID
 */
function generateGuid(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 从数组中随机选择
 */
function randomPick<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * 生成随机中文标题
 */
function randomChineseTitle(min: number = 3, max: number = 6): string {
  const words = ['游戏', '冒险', '挑战', '竞技', '益智', '休闲', '动作', '跑酷', '射击', '拼图', '消除', '竞速'];
  const length = randomInt(min, max);
  return Array.from({ length }, () => randomPick(words)).join('');
}

/**
 * 生成随机中文段落
 */
function randomChineseParagraph(min: number = 1, max: number = 2): string {
  const sentences = [
    '这是一款非常有趣的游戏！',
    '快来挑战你的极限吧！',
    '简单易上手，老少皆宜。',
    '考验你的反应能力和技巧。',
    '收集道具，解锁更多内容。',
    '和朋友一起比拼高分！',
  ];
  const length = randomInt(min, max);
  return Array.from({ length }, () => randomPick(sentences)).join('');
}

/**
 * 生成游戏数据
 */
export function generateGames(count: number = 8): Game[] {
  const now = new Date().toISOString();
  
  return presetGames.slice(0, count).map((preset, index) => ({
    id: preset.id || generateGuid(),
    name: preset.name || randomChineseTitle(3, 6),
    description: preset.description || randomChineseParagraph(1, 2),
    thumbnail: `https://picsum.photos/seed/${preset.id || index}/400/300`,
    icon: preset.icon || randomPick(gameIcons),
    category: preset.category || randomPick(categories),
    difficulty: preset.difficulty || randomPick(['easy', 'medium', 'hard']),
    rating: preset.rating || randomFloat(3.5, 5, 1),
    playCount: preset.playCount || randomInt(1000, 100000),
    isHot: preset.isHot ?? false,
    isNew: preset.isNew ?? false,
    createdAt: preset.createdAt || now,
    updatedAt: preset.updatedAt || now,
  })) as Game[];
}

/**
 * 根据 ID 获取游戏
 */
export function getGameById(id: string): Game | null {
  const games = generateGames(8);
  return games.find(g => g.id === id) || null;
}

/**
 * 根据分类获取游戏
 */
export function getGamesByCategory(category: GameCategory): Game[] {
  const games = generateGames(8);
  return games.filter(g => g.category === category);
}
