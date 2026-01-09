/**
 * JWT Token 生成和验证工具函数
 */

import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import type { JWTPayload } from '@/types/auth';

// JWT 密钥（应该从环境变量获取）
const JWT_SECRET: Secret = (process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production') as Secret;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

/**
 * 生成 Access Token
 * @param payload - JWT 载荷
 * @returns Token 字符串
 */
export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

/**
 * 生成 Refresh Token
 * @param payload - JWT 载荷
 * @returns Token 字符串
 */
export function generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

/**
 * 验证 Token
 * @param token - Token 字符串
 * @returns 解码后的载荷或 null
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * 解码 Token（不验证签名）
 * @param token - Token 字符串
 * @returns 解码后的载荷或 null
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Token decode failed:', error);
    return null;
  }
}

/**
 * 从请求头中提取 Token
 * @param authHeader - Authorization 请求头
 * @returns Token 字符串或 null
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}
