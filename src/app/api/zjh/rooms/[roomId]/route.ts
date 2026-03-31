/**
 * 获取房间信息 API
 * GET /api/zjh/rooms/:roomId
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;

    if (!roomId) {
      return NextResponse.json(
        { success: false, error: '缺少 roomId' },
        { status: 400 }
      );
    }

    const room = await prisma.zjhRoom.findUnique({
      where: { id: roomId },
      include: {
        players: {
          where: { leftAt: null },
          include: { user: { select: { username: true, avatar: true } } },
          orderBy: { seatIndex: 'asc' },
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        { success: false, error: '房间不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        roomId: room.id,
        roomCode: room.roomCode,
        ownerId: room.ownerId,
        status: room.status,
        maxPlayers: room.maxPlayers,
        baseAnte: room.baseAnte,
        maxRounds: room.maxRounds,
        turnTimeout: room.turnTimeout,
        currentPlayers: room.currentPlayers,
        players: room.players.map(p => ({
          userId: p.userId,
          username: p.user.username,
          avatar: p.user.avatar,
          seatIndex: p.seatIndex,
          chips: p.chips,
          isReady: p.isReady,
          isOnline: p.isOnline,
        })),
      },
    });
  } catch (error) {
    console.error('获取房间信息失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
