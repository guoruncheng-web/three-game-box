/**
 * Prisma 数据库种子文件
 * 用于初始化默认数据
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 默认成就数据
const defaultAchievements = [
  {
    code: 'first_game',
    name: '初出茅庐',
    description: '完成第一局游戏',
    icon: '/images/achievements/first-game.png',
    category: 'GAMES',
    condition: { type: 'games', target: 1, operator: 'gte' },
    reward: 10,
  },
  {
    code: 'score_1000',
    name: '高分新手',
    description: '单局得分超过 1000 分',
    icon: '/images/achievements/score-1000.png',
    category: 'SCORE',
    condition: { type: 'score', target: 1000, operator: 'gte' },
    reward: 20,
  },
  {
    code: 'score_2000',
    name: '高分选手',
    description: '单局得分超过 2000 分',
    icon: '/images/achievements/score-2000.png',
    category: 'SCORE',
    condition: { type: 'score', target: 2000, operator: 'gte' },
    reward: 50,
  },
  {
    code: 'score_5000',
    name: '得分大师',
    description: '单局得分超过 5000 分',
    icon: '/images/achievements/score-5000.png',
    category: 'SCORE',
    condition: { type: 'score', target: 5000, operator: 'gte' },
    reward: 100,
  },
  {
    code: 'combo_5',
    name: '连击新手',
    description: '达成 5 连击',
    icon: '/images/achievements/combo-5.png',
    category: 'COMBO',
    condition: { type: 'combo', target: 5, operator: 'gte' },
    reward: 15,
  },
  {
    code: 'combo_10',
    name: '连击高手',
    description: '达成 10 连击',
    icon: '/images/achievements/combo-10.png',
    category: 'COMBO',
    condition: { type: 'combo', target: 10, operator: 'gte' },
    reward: 30,
  },
  {
    code: 'combo_20',
    name: '连击大师',
    description: '达成 20 连击',
    icon: '/images/achievements/combo-20.png',
    category: 'COMBO',
    condition: { type: 'combo', target: 20, operator: 'gte' },
    reward: 80,
  },
  {
    code: 'games_10',
    name: '坚持不懈',
    description: '累计游戏 10 局',
    icon: '/images/achievements/games-10.png',
    category: 'GAMES',
    condition: { type: 'games', target: 10, operator: 'gte' },
    reward: 25,
  },
  {
    code: 'games_50',
    name: '游戏达人',
    description: '累计游戏 50 局',
    icon: '/images/achievements/games-50.png',
    category: 'GAMES',
    condition: { type: 'games', target: 50, operator: 'gte' },
    reward: 60,
  },
  {
    code: 'games_100',
    name: '资深玩家',
    description: '累计游戏 100 局',
    icon: '/images/achievements/games-100.png',
    category: 'GAMES',
    condition: { type: 'games', target: 100, operator: 'gte' },
    reward: 120,
  },
  {
    code: 'time_1hour',
    name: '时光飞逝',
    description: '累计游戏时长达到 1 小时',
    icon: '/images/achievements/time-1hour.png',
    category: 'TIME',
    condition: { type: 'time', target: 3600, operator: 'gte' },
    reward: 40,
  },
  {
    code: 'perfect_win',
    name: '完美通关',
    description: '不剩余步数的情况下达成目标分数',
    icon: '/images/achievements/perfect-win.png',
    category: 'SPECIAL',
    condition: { type: 'special', code: 'perfect_win' },
    reward: 150,
  },
];

async function main() {
  console.log('开始数据库种子...');

  // 清除现有成就数据
  console.log('清除现有成就...');
  await prisma.achievement.deleteMany({});

  // 创建默认成就
  console.log('创建默认成就...');
  for (const achievement of defaultAchievements) {
    await prisma.achievement.create({
      data: achievement,
    });
    console.log(`✓ 创建成就: ${achievement.name}`);
  }

  console.log(`✓ 成功创建 ${defaultAchievements.length} 个成就`);
}

main()
  .catch((e) => {
    console.error('数据库种子失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
