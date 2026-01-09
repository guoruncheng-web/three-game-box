/**
 * 用户注册 API
 * POST /api/auth/register
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password';
import { generateAccessToken } from '@/lib/auth/jwt';
import { createUser, usernameExists, emailExists, phoneExists, toPublicUser } from '@/lib/db/queries/user';
import { createSession, hashToken } from '@/lib/db/queries/session';
import { setCache } from '@/lib/redis';
import { verifyCode, identifyContactType } from '@/utils/validation';
import type { ApiResponse, LoginResponse } from '@/types/auth';

// 注册请求验证 Schema
const registerSchema = z.object({
  username: z.string().min(3).max(50),
  contact: z.string().min(1), // 手机号或邮箱
  password: z.string().min(8),
  code: z.string().min(1), // 验证码
  nickname: z.string().max(50).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();

    // 打印调试信息
    console.log('注册请求体:', JSON.stringify(body, null, 2));

    // 验证请求数据
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('数据验证失败:', validationResult.error.errors);

      // 字段名映射
      const fieldMap: Record<string, string> = {
        username: '用户名',
        contact: '手机号/邮箱',
        password: '密码',
        code: '验证码',
        nickname: '昵称',
      };

      // 生成友好的错误消息
      const errorMessages = validationResult.error.errors
        .map((err) => {
          const fieldName = err.path[0] as string;
          const friendlyFieldName = fieldMap[fieldName] || fieldName;

          if (err.code === 'too_small' && 'minimum' in err) {
            return `${friendlyFieldName}至少需要 ${err.minimum} 个字符`;
          }
          if (err.code === 'too_big' && 'maximum' in err) {
            return `${friendlyFieldName}最多 ${err.maximum} 个字符`;
          }
          if (err.code === 'invalid_type') {
            return `${friendlyFieldName}格式不正确`;
          }
          if (err.code === 'invalid_string') {
            return `${friendlyFieldName}格式不正确`;
          }

          return `${friendlyFieldName}: ${err.message}`;
        })
        .join('；');

      return NextResponse.json<ApiResponse>(
        {
          code: 400,
          message: errorMessages || '请求数据验证失败',
          data: null,
        },
        { status: 400 }
      );
    }

    const { username, contact, password, code, nickname } = validationResult.data;

    // 验证验证码
    if (!verifyCode(code)) {
      return NextResponse.json<ApiResponse>(
        {
          code: 400,
          message: '验证码错误',
          data: null,
        },
        { status: 400 }
      );
    }

    // 识别联系方式类型
    const contactType = identifyContactType(contact);
    if (contactType === 'unknown') {
      return NextResponse.json<ApiResponse>(
        {
          code: 400,
          message: '请输入有效的手机号或邮箱',
          data: null,
        },
        { status: 400 }
      );
    }

    const isPhone = contactType === 'phone';
    const email = isPhone ? undefined : contact;
    const phone = isPhone ? contact : undefined;

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

    // 检查联系方式是否已存在
    if (isPhone) {
      if (await phoneExists(contact)) {
        return NextResponse.json<ApiResponse>(
          {
            code: 409,
            message: '该手机号已被注册',
            data: null,
          },
          { status: 409 }
        );
      }
    } else {
      if (await emailExists(contact)) {
        return NextResponse.json<ApiResponse>(
          {
            code: 409,
            message: '该邮箱已被注册',
            data: null,
          },
          { status: 409 }
        );
      }
    }

    // 加密密码
    const password_hash = await hashPassword(password);

    // 创建用户
    const user = await createUser({
      username,
      email,
      phone,
      password_hash,
      nickname: nickname || undefined,
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
