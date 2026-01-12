/**
 * 检查数据库表是否存在
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function checkTables() {
  console.log('连接数据库...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));

  try {
    // 尝试执行一个简单的查询来测试连接
    const result = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    console.log('\n数据库中的表：');
    console.log(result);

    // 尝试查询成就表
    console.log('\n尝试查询成就表...');
    const achievements = await prisma.achievement.findMany({
      take: 5,
    });
    console.log(`✓ 成就表存在，包含 ${achievements.length} 条记录（前5条）`);

  } catch (error: any) {
    console.error('\n❌ 错误:', error.message);
    if (error.code) {
      console.error('错误代码:', error.code);
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
