/**
 * 用户登录 API
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyPassword } from '@/lib/auth/password';
import { generateAccessToken } from '@/lib/auth/jwt';
import { getUserByIdentifier, updateUserLastLogin, toPublicUser } from '@/lib/db/queries/user';
import { createSession, hashToken } from '@/lib/db/queries/session';
import { setCache, redis } from '@/lib/redis';
import type { ApiResponse, LoginResponse } from '@/types/auth';

// 登录请求验证 Schema
const loginSchema = z.object({
  username: z.string().min(1), // 支持用户名或邮箱
  password: z.string().min(1),
});

// 登录失败限制（15 分钟内最多 5 次）
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_ATTEMPT_WINDOW = 15 * 60; // 15 分钟（秒）

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();

    // 验证请求数据
    const validationResult = loginSchema.safeParse(body);
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

    const { username, password } = validationResult.data;

    // 检查登录失败次数
    const attemptKey = `login:attempt:${username}`;
    const attemptCountStr = await redis.get(attemptKey);
    const attemptCount = attemptCountStr ? parseInt(attemptCountStr, 10) : 0;

    if (attemptCount >= MAX_LOGIN_ATTEMPTS) {
      return NextResponse.json<ApiResponse>(
        {
          code: 429,
          message: '登录失败次数过多，请 15 分钟后再试',
          data: null,
        },
        { status: 429 }
      );
    }

    // 获取用户（支持用户名或邮箱登录）
    const user = await getUserByIdentifier(username);
    if (!user) {
      // 增加失败次数
      await redis.incr(attemptKey);
      await redis.expire(attemptKey, LOGIN_ATTEMPT_WINDOW);

      return NextResponse.json<ApiResponse>(
        {
          code: 401,
          message: '用户名或密码错误',
          data: null,
        },
        { status: 401 }
      );
    }

    // 验证密码
    const passwordValid = await verifyPassword(password, user.password_hash);
    if (!passwordValid) {
      // 增加失败次数
      await redis.incr(attemptKey);
      await redis.expire(attemptKey, LOGIN_ATTEMPT_WINDOW);

      return NextResponse.json<ApiResponse>(
        {
          code: 401,
          message: '用户名或密码错误',
          data: null,
        },
        { status: 401 }
      );
    }

    // 清除登录失败次数
    await redis.del(attemptKey);

    // 更新最后登录时间
    await updateUserLastLogin(user.id);

    // 生成 Token
    const token = generateAccessToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    // 创建会话
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

    // 缓存用户信息到 Redis
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
        message: '登录成功',
        data: response,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    
    // 提供更详细的错误信息（开发环境）
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // 在生产环境中隐藏详细错误信息
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return NextResponse.json<ApiResponse>(
      {
        code: 500,
        message: isDevelopment 
          ? `服务器内部错误: ${errorMessage}` 
          : '服务器内部错误，请稍后重试',
        data: isDevelopment ? { error: errorMessage, stack: errorStack } : null,
      },
      { status: 500 }
    );
  }
}

