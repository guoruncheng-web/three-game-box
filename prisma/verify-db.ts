/**
 * 验证数据库是否正确设置
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDatabase() {
  console.log('验证数据库设置...\n');

  try {
    // 检查成就数量
    const achievementCount = await prisma.achievement.count();
    console.log(`✓ 成就表: ${achievementCount} 个成就`);

    // 列出所有成就
    const achievements = await prisma.achievement.findMany({
      select: {
        code: true,
        name: true,
        category: true,
      },
      orderBy: {
        category: 'asc',
      },
    });

    console.log('\n成就列表:');
    achievements.forEach((achievement) => {
      console.log(`  - [${achievement.category}] ${achievement.name} (${achievement.code})`);
    });

    // 检查其他表
    const userCount = await prisma.user.count();
    const gameRecordCount = await prisma.gameRecord.count();
    const leaderboardCount = await prisma.leaderboard.count();

    console.log(`\n其他表状态:`);
    console.log(`✓ 用户表: ${userCount} 条记录`);
    console.log(`✓ 游戏记录表: ${gameRecordCount} 条记录`);
    console.log(`✓ 排行榜表: ${leaderboardCount} 条记录`);

    console.log('\n✅ 数据库验证成功！');
  } catch (error) {
    console.error('❌ 数据库验证失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();
