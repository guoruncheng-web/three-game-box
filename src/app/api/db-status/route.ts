/**
 * 数据库状态检查 API
 * GET /api/db-status - 查看数据库状态
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 查询所有表
    const tables = await prisma.$queryRaw<Array<{ table_name: string; columns: bigint }>>`
      SELECT
        t.table_name,
        (SELECT COUNT(*) FROM information_schema.columns c
         WHERE c.table_schema = 'public' AND c.table_name = t.table_name) as columns
      FROM information_schema.tables t
      WHERE t.table_schema = 'public'
      ORDER BY t.table_name
    `;

    // 统计各表数据
    const [
      userCount,
      gameRecordCount,
      achievementCount,
      leaderboardCount,
      dailyChallengeCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.gameRecord.count(),
      prisma.achievement.count(),
      prisma.leaderboard.count(),
      prisma.dailyChallenge.count(),
    ]);

    // 获取成就列表
    const achievements = await prisma.achievement.findMany({
      select: {
        code: true,
        name: true,
        category: true,
        reward: true,
      },
      orderBy: [{ category: 'asc' }, { reward: 'asc' }],
    });

    return NextResponse.json({
      success: true,
      data: {
        database: {
          host: '47.86.46.212:5432',
          name: 'three_game',
          status: 'connected',
        },
        tables: tables.map(t => ({
          name: t.table_name,
          columns: Number(t.columns),
        })),
        statistics: {
          users: userCount,
          gameRecords: gameRecordCount,
          achievements: achievementCount,
          leaderboard: leaderboardCount,
          dailyChallenges: dailyChallengeCount,
        },
        achievements: achievements,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('数据库状态检查失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '数据库连接失败: ' + error.message,
      },
      { status: 500 }
    );
  }
}
