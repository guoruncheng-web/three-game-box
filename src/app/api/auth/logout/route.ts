/**
 * 用户登出 API
 * POST /api/auth/logout
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth/jwt';
import { deleteSessionByTokenHash, hashToken } from '@/lib/db/queries/session';
import { deleteCache } from '@/lib/redis';
import { authenticateRequest } from '@/lib/auth/middleware';
import type { ApiResponse } from '@/types/auth';

export async function POST(request: NextRequest) {
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

    // 从请求头中提取 Token
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      // 删除会话
      const tokenHash = hashToken(token);
      await deleteSessionByTokenHash(tokenHash);
    }

    // 删除 Redis 中的用户缓存
    await deleteCache(`user:${payload.userId}`);

    // 返回响应
    return NextResponse.json<ApiResponse>(
      {
        code: 200,
        message: '登出成功',
        data: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
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
