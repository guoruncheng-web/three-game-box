/**
 * 开始游戏 API
 * POST /api/zjh/games/start
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initializeGame } from '@/lib/zjh/game-engine';
import { determineDealerIndex } from '@/lib/zjh/room-manager';
import { evaluateHand } from '@/lib/zjh/hand-evaluator';
import type { StartGameRequest, Card } from '@/types/zjh';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as StartGameRequest;
    const { userId, roomId } = body;

    if (!userId || !roomId) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 查找房间
    const room = await prisma.zjhRoom.findUnique({
      where: { id: roomId },
      include: {
        players: {
          where: { leftAt: null },
          orderBy: { seatIndex: 'asc' },
        },
        games: {
          orderBy: { gameIndex: 'desc' },
          take: 1,
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        { success: false, error: '房间不存在' },
        { status: 404 }
      );
    }

    // 验证是否是房主
    if (room.ownerId !== userId) {
      return NextResponse.json(
        { success: false, error: '只有房主可以开始游戏' },
        { status: 403 }
      );
    }

    // 验证房间状态
    if (room.status !== 'WAITING') {
      return NextResponse.json(
        { success: false, error: '房间不在等待状态' },
        { status: 400 }
      );
    }

    // 验证人数
    if (room.players.length < room.minPlayers) {
      return NextResponse.json(
        { success: false, error: `至少需要 ${room.minPlayers} 名玩家` },
        { status: 400 }
      );
    }

    // 验证所有玩家都已准备
    const notReady = room.players.filter(p => !p.isReady && p.userId !== room.ownerId);
    if (notReady.length > 0) {
      return NextResponse.json(
        { success: false, error: '还有玩家未准备' },
        { status: 400 }
      );
    }

    // 确定局数和庄家
    const lastGame = room.games[0];
    const gameIndex = lastGame ? lastGame.gameIndex + 1 : 1;
    const dealerIndex = determineDealerIndex(
      gameIndex,
      room.players.length,
      lastGame?.dealerIndex
    );

    // 初始化游戏引擎
    const playerInfos = room.players.map(p => ({
      userId: p.userId,
      seatIndex: p.seatIndex,
      chips: p.chips,
    }));

    const gameState = initializeGame(
      playerInfos,
      room.baseAnte,
      room.maxRounds,
      dealerIndex
    );

    // 当前行动玩家
    const currentPlayer = gameState.players[gameState.currentTurnIndex];

    // 创建游戏记录
    const game = await prisma.zjhGame.create({
      data: {
        roomId: room.id,
        gameIndex,
        status: 'BETTING',
        deck: JSON.parse(JSON.stringify(gameState.deck)),
        pot: gameState.pot,
        currentAnte: gameState.currentAnte,
        currentRound: gameState.currentRound,
        currentTurn: currentPlayer.userId,
        dealerIndex,
        players: {
          create: gameState.players.map(p => {
            const evaluation = evaluateHand(p.hand);
            return {
              userId: p.userId,
              seatIndex: p.seatIndex,
              status: 'PLAYING',
              hand: JSON.parse(JSON.stringify(p.hand)),
              handType: evaluation.handType,
              handRank: evaluation.handRank,
              hasLooked: false,
              totalBet: p.totalBet,
              chipsBeforeGame: p.chipsBeforeGame,
            };
          }),
        },
      },
    });

    // 更新房间状态为游戏中
    await prisma.zjhRoom.update({
      where: { id: roomId },
      data: { status: 'PLAYING' },
    });

    // 更新房间玩家筹码（扣除底注）
    for (const p of gameState.players) {
      await prisma.zjhRoomPlayer.updateMany({
        where: { roomId: room.id, userId: p.userId },
        data: { chips: p.chips, isReady: false },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        gameId: game.id,
        gameIndex,
        dealerIndex,
        currentTurn: currentPlayer.userId,
        pot: gameState.pot,
        currentAnte: gameState.currentAnte,
        players: gameState.players.map(p => ({
          userId: p.userId,
          seatIndex: p.seatIndex,
          status: p.status,
          chips: p.chips,
          hasLooked: false,
        })),
      },
    });
  } catch (error) {
    console.error('开始游戏失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
