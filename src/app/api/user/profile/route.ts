/**
 * 修改用户信息 API
 * PUT /api/user/profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyToken } from '@/lib/auth/jwt';
import { getUserByEmail, getUserByPhone, toPublicUser } from '@/lib/db/queries/user';
import { query } from '@/lib/db';
import { setCache, delCache } from '@/lib/redis';
import type { ApiResponse, PublicUser } from '@/types/auth';

// 更新用户信息请求验证 Schema
const updateProfileSchema = z.object({
  nickname: z.string().min(1).max(50).optional(),
  email: z.string().email('请输入有效的邮箱地址').optional(),
  phone: z.string()
    .regex(/^1[3-9]\d{9}$/, '请输入有效的手机号')
    .optional()
    .or(z.literal('')),
  avatar_url: z.string().url('请输入有效的头像URL').optional().or(z.literal('')),
});

export async function PUT(request: NextRequest) {
  try {
    // 验证用户身份
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

    const userId = decoded.userId;

    // 解析请求体
    const body = await request.json();

    // 验证请求数据
    const validationResult = updateProfileSchema.safeParse(body);
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

    const { nickname, email, phone, avatar_url } = validationResult.data;

    // 检查邮箱是否已被其他用户使用
    if (email) {
      const existingUserByEmail = await getUserByEmail(email);
      if (existingUserByEmail && existingUserByEmail.id !== userId) {
        return NextResponse.json<ApiResponse>(
          {
            code: 400,
            message: '该邮箱已被其他用户使用',
            data: null,
          },
          { status: 400 }
        );
      }
    }

    // 检查手机号是否已被其他用户使用
    if (phone && phone !== '') {
      const existingUserByPhone = await getUserByPhone(phone);
      if (existingUserByPhone && existingUserByPhone.id !== userId) {
        return NextResponse.json<ApiResponse>(
          {
            code: 400,
            message: '该手机号已被其他用户使用',
            data: null,
          },
          { status: 400 }
        );
      }
    }

    // 构建更新字段
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (nickname !== undefined) {
      updateFields.push(`nickname = $${paramIndex++}`);
      updateValues.push(nickname);
    }
    if (email !== undefined) {
      updateFields.push(`email = $${paramIndex++}`);
      updateValues.push(email);
    }
    if (phone !== undefined) {
      updateFields.push(`phone = $${paramIndex++}`);
      updateValues.push(phone === '' ? null : phone);
    }
    if (avatar_url !== undefined) {
      updateFields.push(`avatar_url = $${paramIndex++}`);
      updateValues.push(avatar_url === '' ? null : avatar_url);
    }

    // 如果没有任何更新字段，返回错误
    if (updateFields.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          code: 400,
          message: '没有提供需要更新的字段',
          data: null,
        },
        { status: 400 }
      );
    }

    // 添加 updated_at 字段
    updateFields.push(`updated_at = NOW()`);

    // 添加 WHERE 条件的参数
    updateValues.push(userId);

    // 执行更新
    const updateQuery = `
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, updateValues);
    const updatedUser = result.rows[0];

    if (!updatedUser) {
      return NextResponse.json<ApiResponse>(
        {
          code: 404,
          message: '用户不存在',
          data: null,
        },
        { status: 404 }
      );
    }

    // 清除 Redis 缓存
    try {
      await delCache(`user:${userId}`);
    } catch (redisError) {
      console.warn('Redis error (delete cache), continuing:', redisError);
    }

    // 缓存新的用户信息到 Redis
    const publicUser = toPublicUser(updatedUser);
    try {
      await setCache(`user:${userId}`, publicUser, 3600);
    } catch (redisError) {
      console.warn('Redis error (set cache), continuing:', redisError);
    }

    return NextResponse.json<ApiResponse<PublicUser>>(
      {
        code: 200,
        message: '用户信息更新成功',
        data: publicUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json<ApiResponse>(
      {
        code: 500,
        message: error instanceof Error ? error.message : '更新用户信息失败',
        data: null,
      },
      { status: 500 }
    );
  }
}

// 获取当前用户信息（已存在于 /api/auth/me，这里提供一个别名）
export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
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

    const userId = decoded.userId;

    // 查询用户信息
    const result = await query(
      'SELECT * FROM users WHERE id = $1 AND status = $2',
      [userId, 'active']
    );

    const user = result.rows[0];
    if (!user) {
      return NextResponse.json<ApiResponse>(
        {
          code: 404,
          message: '用户不存在',
          data: null,
        },
        { status: 404 }
      );
    }

    const publicUser = toPublicUser(user);

    return NextResponse.json<ApiResponse<PublicUser>>(
      {
        code: 200,
        message: '获取成功',
        data: publicUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json<ApiResponse>(
      {
        code: 500,
        message: '获取用户信息失败',
        data: null,
      },
      { status: 500 }
    );
  }
}
