/**
 * 看牌 API
 * POST /api/zjh/games/look
 */

import { NextResponse } from 'next/server';
import { applyLook } from '@/lib/zjh/mutations/apply-look';
import type { LookRequest } from '@/types/zjh';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LookRequest;
    const { userId, gameId } = body;

    if (!userId || !gameId) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    const result = await applyLook(userId, gameId);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        hand: result.hand,
        handType: result.handType,
        handTypeDisplay: result.handTypeDisplay,
      },
    });
  } catch (error) {
    console.error('看牌失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
