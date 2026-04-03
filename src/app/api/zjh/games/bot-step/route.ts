/**
 * 机器人执行一回合（看牌 + 下注）
 * POST /api/zjh/games/bot-step
 * 由真实玩家轮询触发，需携带本人 userId 校验身份
 */

import { NextResponse } from 'next/server';
import { runZjhBotStep } from '@/lib/zjh/bot-step';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { gameId?: string; userId?: string };
    const { gameId, userId } = body;

    if (!gameId || !userId) {
      return NextResponse.json(
        { success: false, error: '缺少 gameId 或 userId' },
        { status: 400 }
      );
    }

    const result = await runZjhBotStep(gameId, userId);
    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: { done: true } });
  } catch (error) {
    console.error('bot-step:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
