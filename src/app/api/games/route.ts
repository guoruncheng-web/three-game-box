/**
 * 游戏列表 API
 * GET /api/games
 */

import { NextResponse } from 'next/server';
import { generateGames } from '@/lib/data/games';
import type { Game } from '@/types/game';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '8', 10);

    let games: Game[] = generateGames(limit);

    // 如果指定了分类，进行筛选
    if (category && category !== 'all') {
      games = games.filter(game => game.category === category);
    }

    return NextResponse.json({
      code: 200,
      message: 'success',
      data: games,
    });
  } catch (error) {
    console.error('Error fetching games:', error);
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
