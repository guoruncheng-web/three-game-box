/**
 * 用户会话相关的数据库查询函数
 */

import { query } from '@/lib/db';
import type { UserSession } from '@/types/auth';
import crypto from 'crypto';

/**
 * 创建用户会话
 * @param sessionData - 会话数据
 * @returns 创建的会话信息
 */
export async function createSession(sessionData: {
  user_id: number;
  token_hash: string;
  device_info?: string;
  ip_address?: string;
  expires_at: Date;
}): Promise<UserSession> {
  const result = await query(
    `INSERT INTO user_sessions (user_id, token_hash, device_info, ip_address, expires_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      sessionData.user_id,
      sessionData.token_hash,
      sessionData.device_info || null,
      sessionData.ip_address || null,
      sessionData.expires_at,
    ]
  );

  return result.rows[0];
}

/**
 * 根据 Token 哈希获取会话
 * @param tokenHash - Token 哈希
 * @returns 会话信息或 null
 */
export async function getSessionByTokenHash(tokenHash: string): Promise<UserSession | null> {
  const result = await query(
    'SELECT * FROM user_sessions WHERE token_hash = $1 AND expires_at > CURRENT_TIMESTAMP',
    [tokenHash]
  );

  return result.rows[0] || null;
}

/**
 * 删除会话（通过 Token 哈希）
 * @param tokenHash - Token 哈希
 */
export async function deleteSessionByTokenHash(tokenHash: string): Promise<void> {
  await query(
    'DELETE FROM user_sessions WHERE token_hash = $1',
    [tokenHash]
  );
}

/**
 * 删除用户的所有会话
 * @param userId - 用户 ID
 */
export async function deleteAllUserSessions(userId: number): Promise<void> {
  await query(
    'DELETE FROM user_sessions WHERE user_id = $1',
    [userId]
  );
}

/**
 * 删除过期的会话
 */
export async function deleteExpiredSessions(): Promise<void> {
  await query(
    'DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP'
  );
}

/**
 * 生成 Token 哈希
 * @param token - Token 字符串
 * @returns Token 哈希
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
