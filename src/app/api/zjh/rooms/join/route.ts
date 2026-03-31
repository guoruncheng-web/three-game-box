/**
 * 加入房间 API
 * POST /api/zjh/rooms/join
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { assignSeat } from '@/lib/zjh/room-manager';
import { INITIAL_CHIPS } from '@/lib/zjh/constants';
import type { JoinRoomRequest } from '@/types/zjh';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as JoinRoomRequest;
    const { userId, roomCode } = body;

    if (!userId || !roomCode) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段 userId 或 roomCode' },
        { status: 400 }
      );
    }

    // 查找房间
    const room = await prisma.zjhRoom.findUnique({
      where: { roomCode },
      include: {
        players: {
          where: { leftAt: null },
          include: { user: { select: { username: true, avatar: true } } },
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        { success: false, error: '房间不存在' },
        { status: 404 }
      );
    }

    if (room.status === 'CLOSED') {
      return NextResponse.json(
        { success: false, error: '房间已关闭' },
        { status: 400 }
      );
    }

    if (room.status === 'PLAYING') {
      return NextResponse.json(
        { success: false, error: '房间游戏中，无法加入' },
        { status: 400 }
      );
    }

    // 检查是否已在房间中
    const existingPlayer = room.players.find(p => p.userId === userId);
    if (existingPlayer) {
      return NextResponse.json(
        { success: false, error: '已在房间中' },
        { status: 400 }
      );
    }

    // 检查房间是否已满
    if (room.players.length >= room.maxPlayers) {
      return NextResponse.json(
        { success: false, error: '房间已满' },
        { status: 400 }
      );
    }

    // 获取或创建玩家战绩
    let stats = await prisma.zjhPlayerStats.findUnique({ where: { userId } });
    if (!stats) {
      stats = await prisma.zjhPlayerStats.create({
        data: { userId, currentChips: INITIAL_CHIPS },
      });
    }

    // 检查筹码是否足够
    if (stats.currentChips < room.minChips) {
      return NextResponse.json(
        { success: false, error: `筹码不足，最低入场要求 ${room.minChips}` },
        { status: 400 }
      );
    }

    // 分配座位
    const occupiedSeats = room.players.map(p => p.seatIndex);
    const seatIndex = assignSeat(occupiedSeats, room.maxPlayers);

    if (seatIndex === -1) {
      return NextResponse.json(
        { success: false, error: '没有空闲座位' },
        { status: 400 }
      );
    }

    // 创建玩家记录并更新房间人数
    await prisma.$transaction([
      prisma.zjhRoomPlayer.create({
        data: {
          roomId: room.id,
          userId,
          seatIndex,
          chips: stats.currentChips,
        },
      }),
      prisma.zjhRoom.update({
        where: { id: room.id },
        data: { currentPlayers: { increment: 1 } },
      }),
    ]);

    // 查询更新后的玩家列表
    const updatedPlayers = await prisma.zjhRoomPlayer.findMany({
      where: { roomId: room.id, leftAt: null },
      include: { user: { select: { username: true, avatar: true } } },
      orderBy: { seatIndex: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        roomId: room.id,
        seatIndex,
        players: updatedPlayers.map(p => ({
          userId: p.userId,
          username: p.user.username,
          avatar: p.user.avatar,
          seatIndex: p.seatIndex,
          chips: p.chips,
          isReady: p.isReady,
        })),
      },
    });
  } catch (error) {
    console.error('加入房间失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
