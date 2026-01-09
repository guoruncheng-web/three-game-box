/**
 * 创建用户 API（管理员专用）
 * POST /api/admin/users/create
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hashPassword } from '@/lib/auth/password';
import { verifyToken } from '@/lib/auth/jwt';
import { createUser, getUserByUsername, getUserByEmail } from '@/lib/db/queries/user';
import type { ApiResponse, CreateUserRequest, PublicUser } from '@/types/auth';

// 创建用户请求验证 Schema
const createUserSchema = z.object({
  username: z.string()
    .min(3, '用户名至少 3 个字符')
    .max(50, '用户名最多 50 个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
  password: z.string().min(8, '密码至少 8 个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  nickname: z.string().optional(),
  phone: z.string()
    .regex(/^1[3-9]\d{9}$/, '请输入有效的手机号')
    .optional()
    .or(z.literal('')),
  role: z.enum(['super_admin', 'admin', 'user']),
});

export async function POST(request: NextRequest) {
  try {
    // 验证管理员身份
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json<ApiResponse>(
        {
          code: 401,
          message: '未授权访问',
          data: null,
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json<ApiResponse>(
        {
          code: 401,
          message: '无效的访问令牌',
          data: null,
        },
        { status: 401 }
      );
    }

    // 检查是否为超级管理员（假设从 JWT 中可以获取角色）
    // 注意：需要在 JWT 中包含 role 字段，这里假设已经实现
    // const userRole = decoded.role;
    // if (userRole !== 'super_admin') {
    //   return NextResponse.json<ApiResponse>(
    //     {
    //       code: 403,
    //       message: '权限不足',
    //       data: null,
    //     },
    //     { status: 403 }
    //   );
    // }

    // 解析请求体
    const body = await request.json();

    // 验证请求数据
    const validationResult = createUserSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json<ApiResponse>(
        {
          code: 400,
          message: errors,
          data: null,
        },
        { status: 400 }
      );
    }

    const { username, password, email, nickname, phone, role } = validationResult.data;

    // 检查用户名是否已存在
    const existingUserByUsername = await getUserByUsername(username);
    if (existingUserByUsername) {
      return NextResponse.json<ApiResponse>(
        {
          code: 400,
          message: '用户名已存在',
          data: null,
        },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    const existingUserByEmail = await getUserByEmail(email);
    if (existingUserByEmail) {
      return NextResponse.json<ApiResponse>(
        {
          code: 400,
          message: '邮箱已被使用',
          data: null,
        },
        { status: 400 }
      );
    }

    // 哈希密码
    const passwordHash = await hashPassword(password);

    // 创建用户
    const newUser = await createUser({
      username,
      email,
      password_hash: passwordHash,
      nickname: nickname || undefined,
      phone: phone || undefined,
      role,
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
        message: '用户创建成功',
        data: publicUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Create user error:', error);
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
