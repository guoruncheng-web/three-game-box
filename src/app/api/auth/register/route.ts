/**
 * 用户注册 API
 * POST /api/auth/register
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password';
import { generateAccessToken } from '@/lib/auth/jwt';
import { createUser, usernameExists, emailExists, toPublicUser } from '@/lib/db/queries/user';
import { createSession, hashToken } from '@/lib/db/queries/session';
import { setCache } from '@/lib/redis';
import type { ApiResponse, LoginResponse } from '@/types/auth';

// 注册请求验证 Schema
const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email().max(100),
  password: z.string().min(8),
  nickname: z.string().max(50).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();

    // 验证请求数据
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json<ApiResponse>(
        {
          code: 400,
          message: '请求数据验证失败',
          data: null,
        },
        { status: 400 }
      );
    }

    const { username, email, password, nickname } = validationResult.data;

    // 验证密码强度
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json<ApiResponse>(
        {
          code: 400,
          message: passwordValidation.errors.join('; '),
          data: null,
        },
        { status: 400 }
      );
    }

    // 检查用户名是否已存在
    if (await usernameExists(username)) {
      return NextResponse.json<ApiResponse>(
        {
          code: 409,
          message: '用户名已存在',
          data: null,
        },
        { status: 409 }
      );
    }

    // 检查邮箱是否已存在
    if (await emailExists(email)) {
      return NextResponse.json<ApiResponse>(
        {
          code: 409,
          message: '邮箱已被注册',
          data: null,
        },
        { status: 409 }
      );
    }

    // 加密密码
    const password_hash = await hashPassword(password);

    // 创建用户
    const user = await createUser({
      username,
      email,
      password_hash,
      nickname: nickname || null,
    });

    // 生成 Token
    const token = generateAccessToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    // 创建会话（可选，如果需要记录会话）
    const tokenHash = hashToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 天后过期

    await createSession({
      user_id: user.id,
      token_hash: tokenHash,
      device_info: request.headers.get('user-agent') || undefined,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      expires_at: expiresAt,
    });

    // 缓存用户信息到 Redis（可选）
    const publicUser = toPublicUser(user);
    await setCache(`user:${user.id}`, publicUser, 3600); // 缓存 1 小时

    // 返回响应
    const response: LoginResponse = {
      user: publicUser,
      token,
    };

    return NextResponse.json<ApiResponse<LoginResponse>>(
      {
        code: 200,
        message: '注册成功',
        data: response,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Register error:', error);
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
