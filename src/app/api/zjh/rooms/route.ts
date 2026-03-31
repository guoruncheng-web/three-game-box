/**
 * 创建房间 API
 * POST /api/zjh/rooms
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateRoomCode } from '@/lib/zjh/room-manager';
import { DEFAULT_ROOM_CONFIG, INITIAL_CHIPS } from '@/lib/zjh/constants';
import type { CreateRoomRequest } from '@/types/zjh';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateRoomRequest;
    const { userId, maxPlayers, baseAnte, maxRounds, turnTimeout, minChips } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段 userId' },
        { status: 400 }
      );
    }

    // 验证用户存在
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    // 获取或创建玩家战绩（确保有筹码记录）
    let stats = await prisma.zjhPlayerStats.findUnique({ where: { userId } });
    if (!stats) {
      stats = await prisma.zjhPlayerStats.create({
        data: { userId, currentChips: INITIAL_CHIPS },
      });
    }

    const finalMinChips = minChips ?? DEFAULT_ROOM_CONFIG.minChips;

    // 验证筹码是否足够
    if (stats.currentChips < finalMinChips) {
      return NextResponse.json(
        { success: false, error: `筹码不足，最低入场要求 ${finalMinChips}` },
        { status: 400 }
      );
    }

    // 生成唯一房间号（确保不重复）
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

    // 创建房间和第一个玩家
    const room = await prisma.zjhRoom.create({
      data: {
        roomCode,
        ownerId: userId,
        maxPlayers: maxPlayers ?? DEFAULT_ROOM_CONFIG.maxPlayers,
        baseAnte: baseAnte ?? DEFAULT_ROOM_CONFIG.baseAnte,
        maxRounds: maxRounds ?? DEFAULT_ROOM_CONFIG.maxRounds,
        turnTimeout: turnTimeout ?? DEFAULT_ROOM_CONFIG.turnTimeout,
        minChips: finalMinChips,
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
        roomId: room.id,
        roomCode: room.roomCode,
        ownerId: room.ownerId,
        status: room.status,
        maxPlayers: room.maxPlayers,
        baseAnte: room.baseAnte,
        maxRounds: room.maxRounds,
        currentPlayers: room.currentPlayers,
      },
    });
  } catch (error) {
    console.error('创建房间失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
