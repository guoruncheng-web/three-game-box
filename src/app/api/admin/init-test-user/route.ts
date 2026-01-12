/**
 * 初始化测试用户 API
 * POST /api/admin/init-test-user
 *
 * 此 API 用于在数据库中创建测试用户，仅在开发环境可用
 */

import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth/password';
import { createUser, getUserByEmail, getUserByUsername } from '@/lib/db/queries/user';
import type { ApiResponse, PublicUser } from '@/types/auth';

export async function POST() {
  try {
    // 仅在开发环境可用
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json<ApiResponse>(
        {
          code: 403,
          message: '该接口仅在开发环境可用',
          data: null,
        },
        { status: 403 }
      );
    }

    const testUser = {
      username: 'admin',
      email: 'admin@qq.com',
      password: 'admin123',
      nickname: '管理员',
      role: 'super_admin' as const,
    };

    // 检查用户是否已存在
    const existingUserByUsername = await getUserByUsername(testUser.username);
    const existingUserByEmail = await getUserByEmail(testUser.email);

    if (existingUserByUsername || existingUserByEmail) {
      // 用户已存在，返回成功并说明情况
      return NextResponse.json<ApiResponse>(
        {
          code: 200,
          message: '测试用户已存在，无需重复创建',
          data: {
            username: testUser.username,
            email: testUser.email,
            password: testUser.password,
          },
        },
        { status: 200 }
      );
    }

    // 哈希密码
    const passwordHash = await hashPassword(testUser.password);

    // 创建用户
    const newUser = await createUser({
      username: testUser.username,
      email: testUser.email,
      password_hash: passwordHash,
      nickname: testUser.nickname,
      role: testUser.role,
      status: 'active',
    });

    // 返回成功响应（不包含密码哈希）
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

    return NextResponse.json<ApiResponse<{
      user: PublicUser;
      credentials: {
        username: string;
        email: string;
        password: string;
      };
    }>>(
      {
        code: 200,
        message: '测试用户创建成功',
        data: {
          user: publicUser,
          credentials: {
            username: testUser.username,
            email: testUser.email,
            password: testUser.password,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Init test user error:', error);
    return NextResponse.json<ApiResponse>(
      {
        code: 500,
        message: error instanceof Error ? error.message : '创建测试用户失败',
        data: null,
      },
      { status: 500 }
    );
  }
}
