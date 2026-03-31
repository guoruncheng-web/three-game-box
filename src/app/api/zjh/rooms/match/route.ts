/**
 * 快速匹配 API
 * POST /api/zjh/rooms/match
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateRoomCode, assignSeat } from '@/lib/zjh/room-manager';
import { DEFAULT_ROOM_CONFIG, INITIAL_CHIPS } from '@/lib/zjh/constants';
import type { MatchRoomRequest } from '@/types/zjh';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MatchRoomRequest;
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段 userId' },
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

    // 查找有空位的等待中房间（筹码满足要求）
    // 注意：无法在 Prisma where 中直接引用同表字段进行比较，
    // 所以这里用 maxPlayers 上限过滤，后续 JS 中再精确判断
    const availableRoom = await prisma.zjhRoom.findFirst({
      where: {
        status: 'WAITING',
        minChips: { lte: stats.currentChips },
      },
      include: {
        players: {
          where: { leftAt: null },
        },
      },
      orderBy: { currentPlayers: 'desc' }, // 优先匹配人多的房间
    });

    // 筛选出真正有空位且该玩家不在其中的房间
    let targetRoom = availableRoom;
    if (targetRoom) {
      const isAlreadyIn = targetRoom.players.some(p => p.userId === userId);
      const isFull = targetRoom.players.length >= targetRoom.maxPlayers;
      if (isAlreadyIn || isFull) {
        targetRoom = null;
      }
    }

    if (targetRoom) {
      // 加入已有房间
      const occupiedSeats = targetRoom.players.map(p => p.seatIndex);
      const seatIndex = assignSeat(occupiedSeats, targetRoom.maxPlayers);

      await prisma.$transaction([
        prisma.zjhRoomPlayer.create({
          data: {
            roomId: targetRoom.id,
            userId,
            seatIndex,
            chips: stats.currentChips,
          },
        }),
        prisma.zjhRoom.update({
          where: { id: targetRoom.id },
          data: { currentPlayers: { increment: 1 } },
        }),
      ]);

      return NextResponse.json({
        success: true,
        data: {
          roomId: targetRoom.id,
          roomCode: targetRoom.roomCode,
          isNewRoom: false,
          seatIndex,
        },
      });
    }

    // 没有合适房间，创建新房间
    let roomCode = generateRoomCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.zjhRoom.findUnique({ where: { roomCode } });
      if (!existing || existing.status === 'CLOSED') break;
      roomCode = generateRoomCode();
      attempts++;
    }

    if (attempts >= 10) {
      return NextResponse.json(
        { success: false, error: '房间号生成失败，请稍后重试' },
        { status: 503 }
      );
    }

    const newRoom = await prisma.zjhRoom.create({
      data: {
        roomCode,
        ownerId: userId,
        maxPlayers: DEFAULT_ROOM_CONFIG.maxPlayers,
        baseAnte: DEFAULT_ROOM_CONFIG.baseAnte,
        maxRounds: DEFAULT_ROOM_CONFIG.maxRounds,
        turnTimeout: DEFAULT_ROOM_CONFIG.turnTimeout,
        minChips: DEFAULT_ROOM_CONFIG.minChips,
        currentPlayers: 1,
        players: {
          create: {
            userId,
            seatIndex: 0,
            chips: stats.currentChips,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        roomId: newRoom.id,
        roomCode: newRoom.roomCode,
        isNewRoom: true,
        seatIndex: 0,
      },
    });
  } catch (error) {
    console.error('快速匹配失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
