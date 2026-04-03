/**
 * 创建人机对战房间（1 真人 + 1 机器人，机器人自动准备）
 * POST /api/zjh/rooms/human-vs-bot
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateRoomCode } from '@/lib/zjh/room-manager';
import { DEFAULT_ROOM_CONFIG, INITIAL_CHIPS } from '@/lib/zjh/constants';
import { ensureZjhBotUser } from '@/lib/zjh/bot-user';
import { ZJH_BOT_USER_ID } from '@/lib/zjh/bot-constants';
import { ensureUserById } from '@/lib/user/ensure-user';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { userId?: string };
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少 userId' },
        { status: 400 }
      );
    }

    if (userId === ZJH_BOT_USER_ID) {
      return NextResponse.json(
        { success: false, error: '无效用户' },
        { status: 400 }
      );
    }

    await ensureZjhBotUser();
    /** 与 localStorage 游客 id 对齐：库中无 User 时补建，避免「用户不存在」 */
    await ensureUserById(userId);

    let stats = await prisma.zjhPlayerStats.findUnique({ where: { userId } });
    if (!stats) {
      stats = await prisma.zjhPlayerStats.create({
        data: { userId, currentChips: INITIAL_CHIPS },
      });
    }

    if (stats.currentChips < DEFAULT_ROOM_CONFIG.minChips) {
      return NextResponse.json(
        {
          success: false,
          error: `筹码不足，人机模式至少需要 ${DEFAULT_ROOM_CONFIG.minChips} 筹码`,
        },
        { status: 400 }
      );
    }

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

    const chipStack = stats.currentChips;

    const room = await prisma.zjhRoom.create({
      data: {
        roomCode,
        ownerId: userId,
        minPlayers: 2,
        maxPlayers: 2,
        baseAnte: DEFAULT_ROOM_CONFIG.baseAnte,
        maxRounds: DEFAULT_ROOM_CONFIG.maxRounds,
        turnTimeout: DEFAULT_ROOM_CONFIG.turnTimeout,
        minChips: DEFAULT_ROOM_CONFIG.minChips,
        currentPlayers: 2,
        players: {
          create: [
            {
              userId,
              seatIndex: 0,
              chips: chipStack,
              isReady: false,
            },
            {
              userId: ZJH_BOT_USER_ID,
              seatIndex: 1,
              chips: chipStack,
              isReady: true,
            },
          ],
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        roomId: room.id,
        roomCode: room.roomCode,
        botUserId: ZJH_BOT_USER_ID,
        isBotRoom: true,
      },
    });
  } catch (error) {
    console.error('human-vs-bot:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
