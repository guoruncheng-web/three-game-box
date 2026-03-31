/**
 * 每日筹码领取 API
 * POST /api/zjh/stats/daily-bonus
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DAILY_BONUS_CHIPS, INITIAL_CHIPS } from '@/lib/zjh/constants';
import type { DailyBonusRequest } from '@/types/zjh';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DailyBonusRequest;
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段 userId' },
        { status: 400 }
      );
    }

    // 检查用户是否存在
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    // 获取或创建玩家战绩
    let stats = await prisma.zjhPlayerStats.findUnique({
      where: { userId },
    });

    if (!stats) {
      stats = await prisma.zjhPlayerStats.create({
        data: { userId, currentChips: INITIAL_CHIPS },
      });
    }

    // 检查今日是否已领取
    if (stats.lastDailyBonusAt) {
      const lastBonus = new Date(stats.lastDailyBonusAt);
      const today = new Date();
      // 比较日期（忽略时间）
      if (
        lastBonus.getFullYear() === today.getFullYear() &&
        lastBonus.getMonth() === today.getMonth() &&
        lastBonus.getDate() === today.getDate()
      ) {
        return NextResponse.json(
          { success: false, error: '今日已领取' },
          { status: 400 }
        );
      }
    }

    // 发放奖励
    const updatedStats = await prisma.zjhPlayerStats.update({
      where: { userId },
      data: {
        currentChips: { increment: DAILY_BONUS_CHIPS },
        lastDailyBonusAt: new Date(),
      },
    });

    // 计算明天 00:00:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return NextResponse.json({
      success: true,
      data: {
        bonusAmount: DAILY_BONUS_CHIPS,
        currentChips: updatedStats.currentChips,
        nextBonusAt: tomorrow.toISOString(),
      },
    });
  } catch (error) {
    console.error('每日筹码领取失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
