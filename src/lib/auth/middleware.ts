/**
 * 认证中间件
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth/jwt';
import { getSessionByTokenHash, hashToken } from '@/lib/db/queries/session';
import type { JWTPayload } from '@/types/auth';

/**
 * 认证中间件 - 验证 Token 并获取用户信息
 * @param request - Next.js 请求对象
 * @returns 用户信息或 null
 */
export async function authenticateRequest(request: NextRequest): Promise<JWTPayload | null> {
  try {
    // 从请求头中提取 Token
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return null;
    }

    // 验证 Token
    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    // 验证会话是否有效（可选，如果使用会话表）
    const tokenHash = hashToken(token);
    const session = await getSessionByTokenHash(tokenHash);
    if (!session) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * 创建未授权响应
 * @param message - 错误消息
 * @returns NextResponse
 */
export function createUnauthorizedResponse(message: string = '未授权'): NextResponse {
  return NextResponse.json(
    {
      code: 401,
      message,
      data: null,
    },
    { status: 401 }
  );
}

/**
 * 创建禁止访问响应
 * @param message - 错误消息
 * @returns NextResponse
 */
export function createForbiddenResponse(message: string = '禁止访问'): NextResponse {
  return NextResponse.json(
    {
      code: 403,
      message,
      data: null,
    },
    { status: 403 }
  );
}
