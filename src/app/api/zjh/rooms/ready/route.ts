/**
 * 玩家准备 API
 * POST /api/zjh/rooms/ready
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ReadyRequest } from '@/types/zjh';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ReadyRequest;
    const { userId, roomId, isReady } = body;

    if (!userId || !roomId || isReady === undefined) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 查找房间
    const room = await prisma.zjhRoom.findUnique({
      where: { id: roomId },
      include: {
        players: { where: { leftAt: null } },
      },
    });

    if (!room) {
      return NextResponse.json(
        { success: false, error: '房间不存在' },
        { status: 404 }
      );
    }

    if (room.status !== 'WAITING') {
      return NextResponse.json(
        { success: false, error: '房间不在等待状态' },
        { status: 400 }
      );
    }

    // 查找玩家
    const player = room.players.find(p => p.userId === userId);
    if (!player) {
      return NextResponse.json(
        { success: false, error: '你不在该房间中' },
        { status: 400 }
      );
    }

    // 更新准备状态
    await prisma.zjhRoomPlayer.update({
      where: { id: player.id },
      data: { isReady },
    });

    // 检查是否所有人都准备了
    const otherPlayers = room.players.filter(p => p.userId !== userId);
    const allReady = otherPlayers.every(p => p.isReady) && isReady && room.players.length >= room.minPlayers;

    return NextResponse.json({
      success: true,
      data: {
        isReady,
        allReady,
      },
    });
  } catch (error) {
    console.error('准备状态更新失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
