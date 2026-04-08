/**
 * 通用图片上传 API（Vercel Blob 存储）
 * POST /api/upload
 * Content-Type: multipart/form-data
 * Authorization: Bearer {token}
 * Body: FormData { file: File, type?: 'avatar' | 'general' }
 *
 * 环境变量: BLOB_READ_WRITE_TOKEN（Vercel Blob 访问令牌）
 */

import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { authenticateRequest, createUnauthorizedResponse } from '@/lib/auth/middleware';
import type { ApiResponse } from '@/types/auth';

// 允许的图片 MIME 类型
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

// MIME 类型对应的文件扩展名
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

// 文件头 magic bytes 校验（防止 MIME 伪造）
const MAGIC_BYTES: Record<string, number[]> = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/gif': [0x47, 0x49, 0x46],
  'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF header
};

/** 校验文件内容是否与声明的 MIME 类型匹配 */
function validateMagicBytes(buffer: ArrayBuffer, mimeType: string): boolean {
  const expected = MAGIC_BYTES[mimeType];
  if (!expected) return false;
  const view = new Uint8Array(buffer);
  if (view.length < expected.length) return false;
  return expected.every((byte, i) => view[i] === byte);
}

// 文件大小限制（字节）
const SIZE_LIMITS: Record<string, number> = {
  avatar: 2 * 1024 * 1024,   // 头像最大 2MB
  general: 5 * 1024 * 1024,  // 普通图片最大 5MB
};

export async function POST(request: NextRequest) {
  try {
    // 认证校验
    const user = await authenticateRequest(request);
    if (!user) {
      return createUnauthorizedResponse('请先登录');
    }

    // 解析 FormData
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json<ApiResponse>(
        { code: 400, message: '请求格式错误，需要 multipart/form-data', data: null },
        { status: 400 }
      );
    }

    // 获取上传文件
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json<ApiResponse>(
        { code: 400, message: '请选择要上传的文件', data: null },
        { status: 400 }
      );
    }

    // 获取上传类型，默认为 general
    const uploadType = (formData.get('type') as string) || 'general';
    if (!['avatar', 'general'].includes(uploadType)) {
      return NextResponse.json<ApiResponse>(
        { code: 400, message: '无效的上传类型，仅支持 avatar 或 general', data: null },
        { status: 400 }
      );
    }

    // 文件类型校验
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json<ApiResponse>(
        { code: 400, message: '不支持的文件类型，仅允许 JPEG、PNG、GIF、WebP 格式', data: null },
        { status: 400 }
      );
    }

    // 文件大小校验
    const maxSize = SIZE_LIMITS[uploadType];
    if (file.size > maxSize) {
      const maxMB = maxSize / (1024 * 1024);
      return NextResponse.json<ApiResponse>(
        { code: 400, message: `文件大小超出限制，最大允许 ${maxMB}MB`, data: null },
        { status: 400 }
      );
    }

    // 读取文件内容并校验 magic bytes
    const bytes = await file.arrayBuffer();
    if (!validateMagicBytes(bytes, file.type)) {
      return NextResponse.json<ApiResponse>(
        { code: 400, message: '文件内容与声明的类型不匹配', data: null },
        { status: 400 }
      );
    }

    // 生成唯一文件名: {type}/{userId}_{timestamp}_{random}.{ext}
    const ext = MIME_TO_EXT[file.type];
    const random = Math.random().toString(36).substring(2, 8);
    const subDir = uploadType === 'avatar' ? 'avatars' : 'images';
    const pathname = `${subDir}/${user.userId}_${Date.now()}_${random}.${ext}`;

    // 上传到 Vercel Blob（显式传递 token 防止环境变量未注入）
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN;
    if (!blobToken) {
      console.error('BLOB_READ_WRITE_TOKEN 环境变量未配置');
      return NextResponse.json<ApiResponse>(
        { code: 500, message: '服务器存储未配置，请联系管理员', data: null },
        { status: 500 }
      );
    }

    const blob = await put(pathname, bytes, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: false,
      token: blobToken,
    });

    return NextResponse.json<ApiResponse<{ url: string; filename: string }>>(
      {
        code: 200,
        message: '上传成功',
        data: { url: blob.url, filename: pathname },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json<ApiResponse>(
      {
        code: 500,
        message: error instanceof Error ? error.message : '文件上传失败',
        data: null,
      },
      { status: 500 }
    );
  }
}
