/**
 * 单个游戏详情 API
 * GET /api/games/[gameId]
 */

import { NextResponse } from 'next/server';
import { getGameById } from '@/lib/data/games';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const game = getGameById(gameId);

    if (!game) {
      return NextResponse.json(
        {
          code: 404,
          message: 'Game not found',
          data: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      code: 200,
      message: 'success',
      data: game,
    });
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json(
      {
        code: 500,
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    );
  }
}
