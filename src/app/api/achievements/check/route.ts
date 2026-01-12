/**
 * 成就检查 API
 * POST /api/achievements/check - 检查并解锁成就
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface AchievementCondition {
  type: string;
  target: number;
  operator?: 'gte' | 'lte' | 'eq';
  code?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, gameData } = body;

    if (!userId || !gameData) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必需参数',
        },
        { status: 400 }
      );
    }

    // 获取用户统计信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: '用户不存在',
        },
        { status: 404 }
      );
    }

    // 获取所有未解锁的成就
    const achievements = await prisma.achievement.findMany({
      where: { isActive: true },
    });

    const unlockedAchievements = [];

    for (const achievement of achievements) {
      // 检查是否已解锁
      const userAchievement = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id,
          },
        },
      });

      if (userAchievement?.isUnlocked) {
        continue; // 已解锁，跳过
      }

      // 检查条件
      const condition = achievement.condition as unknown as AchievementCondition;
      const shouldUnlock = checkAchievementCondition(condition, user, gameData);

      if (shouldUnlock) {
        // 创建或更新用户成就
        const updatedAchievement = await prisma.userAchievement.upsert({
          where: {
            userId_achievementId: {
              userId,
              achievementId: achievement.id,
            },
          },
          create: {
            userId,
            achievementId: achievement.id,
            progress: 100,
            isUnlocked: true,
            unlockedAt: new Date(),
          },
          update: {
            progress: 100,
            isUnlocked: true,
            unlockedAt: new Date(),
          },
          include: {
            achievement: true,
          },
        });

        unlockedAchievements.push(updatedAchievement);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        unlockedCount: unlockedAchievements.length,
        unlockedAchievements,
      },
    });
  } catch (error) {
    console.error('检查成就失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '检查成就失败',
      },
      { status: 500 }
    );
  }
}

// 检查成就条件
function checkAchievementCondition(
  condition: AchievementCondition,
  user: any,
  gameData: any
): boolean {
  const { type, target, operator = 'gte', code } = condition;

  switch (type) {
    case 'score':
      // 单局得分
      return compareValue(gameData.score, target, operator);

    case 'combo':
      // 最大连击
      return compareValue(gameData.maxCombo, target, operator);

    case 'games':
      // 游戏次数
      return compareValue(user.gamesPlayed, target, operator);

    case 'time':
      // 游戏时长
      return compareValue(user.totalPlayTime, target, operator);

    case 'special':
      // 特殊成就
      if (code === 'perfect_win') {
        // 完美通关：不剩余步数的情况下达成目标分数
        return gameData.moves === 0 && gameData.isWon;
      }
      return false;

    default:
      return false;
  }
}

// 比较值
function compareValue(value: number, target: number, operator: string): boolean {
  switch (operator) {
    case 'gte':
      return value >= target;
    case 'lte':
      return value <= target;
    case 'eq':
      return value === target;
    default:
      return false;
  }
}
