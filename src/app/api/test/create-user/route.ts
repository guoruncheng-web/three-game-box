/**
 * 创建测试用户 API（仅用于开发环境）
 * POST /api/test/create-user
 */

import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth/password';
import { createUser, getUserByEmail, getUserByUsername } from '@/lib/db/queries/user';
import type { ApiResponse, PublicUser } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    // 仅在开发环境允许
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json<ApiResponse>(
        {
          code: 403,
          message: '此接口仅在开发环境可用',
          data: null,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email = 'admin@qq.com', password = 'admin123', username = 'admin' } = body;

    // 检查用户是否已存在
    const existingUserByEmail = await getUserByEmail(email);
    if (existingUserByEmail) {
      return NextResponse.json<ApiResponse>(
        {
          code: 409,
          message: '邮箱已被使用',
          data: null,
        },
        { status: 409 }
      );
    }

    const existingUserByUsername = await getUserByUsername(username);
    if (existingUserByUsername) {
      return NextResponse.json<ApiResponse>(
        {
          code: 409,
          message: '用户名已被使用',
          data: null,
        },
        { status: 409 }
      );
    }

    // 哈希密码
    const passwordHash = await hashPassword(password);

    // 创建用户
    const newUser = await createUser({
      username,
      email,
      password_hash: passwordHash,
      nickname: '管理员',
      role: 'admin',
      status: 'active',
    });

    // 返回成功响应（不包含密码）
    const publicUser: PublicUser = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      nickname: newUser.nickname,
      avatar_url: newUser.avatar_url,
      phone: newUser.phone,
      status: newUser.status,
      role: newUser.role,
      created_at: newUser.created_at,
      updated_at: newUser.updated_at,
    };

    return NextResponse.json<ApiResponse<PublicUser>>(
      {
        code: 200,
        message: '测试用户创建成功',
        data: publicUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Create test user error:', error);
    return NextResponse.json<ApiResponse>(
      {
        code: 500,
        message: error instanceof Error ? error.message : '创建用户失败',
        data: null,
      },
      { status: 500 }
    );
  }
}
