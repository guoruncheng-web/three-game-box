/**
 * 获取对局历史 API
 * GET /api/zjh/stats/:userId/history
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { HAND_TYPE_DISPLAY } from '@/lib/zjh/constants';
import type { HandType } from '@/types/zjh';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少 userId' },
        { status: 400 }
      );
    }

    // 查询总数
    const total = await prisma.zjhGamePlayer.count({
      where: { userId },
    });

    // 查询对局历史
    const gamePlayerRecords = await prisma.zjhGamePlayer.findMany({
      where: { userId },
      include: {
        game: {
          include: {
            room: { select: { roomCode: true } },
            players: { select: { userId: true } },
          },
        },
      },
      orderBy: { game: { startedAt: 'desc' } },
      skip: offset,
      take: limit,
    });

    const records = gamePlayerRecords.map(gp => {
      const handType = gp.handType as HandType | null;
      return {
        gameId: gp.gameId,
        roomCode: gp.game.room.roomCode,
        handType,
        handTypeDisplay: handType ? HAND_TYPE_DISPLAY[handType] : null,
        chipsChange: gp.chipsChange,
        isWinner: gp.isWinner,
        totalPlayers: gp.game.players.length,
        createdAt: gp.game.startedAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        records,
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('获取对局历史失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
