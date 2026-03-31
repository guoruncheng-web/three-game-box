/**
 * 离开房间 API
 * POST /api/zjh/rooms/leave
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { selectNewOwner } from '@/lib/zjh/room-manager';
import type { LeaveRoomRequest } from '@/types/zjh';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LeaveRoomRequest;
    const { userId, roomId } = body;

    if (!userId || !roomId) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段 userId 或 roomId' },
        { status: 400 }
      );
    }

    // 查找房间
    const room = await prisma.zjhRoom.findUnique({
      where: { id: roomId },
      include: {
        players: {
          where: { leftAt: null },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        { success: false, error: '房间不存在' },
        { status: 404 }
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

    // 标记玩家离开
    await prisma.zjhRoomPlayer.update({
      where: { id: player.id },
      data: { leftAt: new Date(), isOnline: false },
    });

    // 更新房间人数
    const remainingPlayers = room.players.filter(p => p.userId !== userId);
    let newOwnerId: string | null = null;

    if (remainingPlayers.length === 0) {
      // 所有玩家都离开了，关闭房间
      await prisma.zjhRoom.update({
        where: { id: roomId },
        data: {
          status: 'CLOSED',
          currentPlayers: 0,
          closedAt: new Date(),
        },
      });
    } else {
      // 如果是房主离开，转移房主
      if (room.ownerId === userId) {
        newOwnerId = selectNewOwner(
          remainingPlayers.map(p => p.userId),
          userId
        );
      }

      await prisma.zjhRoom.update({
        where: { id: roomId },
        data: {
          currentPlayers: { decrement: 1 },
          ...(newOwnerId ? { ownerId: newOwnerId } : {}),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        message: '已离开房间',
        newOwnerId,
      },
    });
  } catch (error) {
    console.error('离开房间失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
