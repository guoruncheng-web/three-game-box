/**
 * 玩家操作 API（跟注/加注/全押/弃牌）
 * POST /api/zjh/games/action
 */

import { NextResponse } from 'next/server';
import { applyBettingAction } from '@/lib/zjh/mutations/apply-betting-action';
import type { ActionRequest } from '@/types/zjh';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ActionRequest;
    const { userId, gameId, actionType, amount } = body;

    if (!userId || !gameId || !actionType) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    const result = await applyBettingAction(userId, gameId, actionType, amount);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('玩家操作失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
