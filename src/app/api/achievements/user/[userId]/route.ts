/**
 * 用户成就 API
 * GET /api/achievements/user/[userId] - 获取用户成就进度
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    userId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = params;

    // 获取所有成就
    const allAchievements = await prisma.achievement.findMany({
      where: { isActive: true },
    });

    // 获取用户成就进度
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
    });

    // 创建成就映射
    const userAchievementMap = new Map(
      userAchievements.map((ua) => [ua.achievementId, ua])
    );

    // 合并数据
    const achievements = allAchievements.map((achievement) => {
      const userAchievement = userAchievementMap.get(achievement.id);
      return {
        ...achievement,
        progress: userAchievement?.progress || 0,
        isUnlocked: userAchievement?.isUnlocked || false,
        unlockedAt: userAchievement?.unlockedAt || null,
      };
    });

    // 统计
    const total = achievements.length;
    const unlocked = achievements.filter((a) => a.isUnlocked).length;
    const totalReward = achievements
      .filter((a) => a.isUnlocked)
      .reduce((sum, a) => sum + a.reward, 0);

    return NextResponse.json({
      success: true,
      data: {
        achievements,
        stats: {
          total,
          unlocked,
          progress: total > 0 ? Math.round((unlocked / total) * 100) : 0,
          totalReward,
        },
      },
    });
  } catch (error) {
    console.error('获取用户成就失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取用户成就失败',
      },
      { status: 500 }
    );
  }
}
