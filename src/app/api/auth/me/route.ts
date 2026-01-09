/**
 * 获取当前用户信息 API
 * GET /api/auth/me
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { getUserById, toPublicUser } from '@/lib/db/queries/user';
import { getCache, setCache } from '@/lib/redis';
import type { ApiResponse, PublicUser } from '@/types/auth';

export async function GET(request: NextRequest) {
  try {
    // 验证 Token 并获取用户信息
    const payload = await authenticateRequest(request);
    if (!payload) {
      return NextResponse.json<ApiResponse>(
        {
          code: 401,
          message: '未授权',
          data: null,
        },
        { status: 401 }
      );
    }

    // 先从 Redis 缓存中获取
    let user = await getCache<PublicUser>(`user:${payload.userId}`);

    if (!user) {
      // 缓存未命中，从数据库获取
      const dbUser = await getUserById(payload.userId);
      if (!dbUser) {
        return NextResponse.json<ApiResponse>(
          {
            code: 404,
            message: '用户不存在',
            data: null,
          },
          { status: 404 }
        );
      }

      user = toPublicUser(dbUser);
      // 缓存到 Redis（1 小时）
      await setCache(`user:${payload.userId}`, user, 3600);
    }

    // 返回响应
    return NextResponse.json<ApiResponse<PublicUser>>(
      {
        code: 200,
        message: 'success',
        data: user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json<ApiResponse>(
      {
        code: 500,
        message: '服务器内部错误',
        data: null,
      },
      { status: 500 }
    );
  }
}
