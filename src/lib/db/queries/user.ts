/**
 * 用户相关的数据库查询函数
 */

import { query } from '@/lib/db';
import type { User, PublicUser, UserWithPassword } from '@/types/auth';

/**
 * 根据 ID 获取用户
 * @param userId - 用户 ID
 * @returns 用户信息或 null
 */
export async function getUserById(userId: number): Promise<User | null> {
  const result = await query(
    'SELECT * FROM users WHERE id = $1 AND status = $2',
    [userId, 'active']
  );

  return result.rows[0] || null;
}

/**
 * 根据用户名获取用户
 * @param username - 用户名
 * @returns 用户信息或 null
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  const result = await query(
    'SELECT * FROM users WHERE username = $1 AND status = $2',
    [username, 'active']
  );

  return result.rows[0] || null;
}

/**
 * 根据邮箱获取用户
 * @param email - 邮箱
 * @returns 用户信息或 null
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query(
    'SELECT * FROM users WHERE email = $1 AND status = $2',
    [email, 'active']
  );

  return result.rows[0] || null;
}

/**
 * 根据用户名或邮箱获取用户（包含密码哈希）
 * @param identifier - 用户名或邮箱
 * @returns 用户信息或 null
 */
export async function getUserByIdentifier(identifier: string): Promise<UserWithPassword | null> {
  const result = await query(
    'SELECT * FROM users WHERE (username = $1 OR email = $1) AND status = $2',
    [identifier, 'active']
  );

  return result.rows[0] || null;
}

/**
 * 创建用户
 * @param userData - 用户数据
 * @returns 创建的用户信息
 */
export async function createUser(userData: {
  username: string;
  email?: string;
  phone?: string;
  password_hash: string;
  nickname?: string;
  role?: string;
  status?: string;
}): Promise<User> {
  const result = await query(
    `INSERT INTO users (username, email, phone, password_hash, nickname, role, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      userData.username,
      userData.email ?? null,
      userData.phone ?? null,
      userData.password_hash,
      userData.nickname ?? null,
      userData.role ?? 'user',
      userData.status ?? 'active'
    ]
  );

  return result.rows[0];
}

/**
 * 更新用户最后登录时间
 * @param userId - 用户 ID
 */
export async function updateUserLastLogin(userId: number): Promise<void> {
  await query(
    'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
    [userId]
  );
}

/**
 * 检查用户名是否已存在
 * @param username - 用户名
 * @returns 是否存在
 */
export async function usernameExists(username: string): Promise<boolean> {
  const result = await query(
    'SELECT 1 FROM users WHERE username = $1',
    [username]
  );

  return result.rows.length > 0;
}

/**
 * 检查邮箱是否已存在
 * @param email - 邮箱
 * @returns 是否存在
 */
export async function emailExists(email: string): Promise<boolean> {
  const result = await query(
    'SELECT 1 FROM users WHERE email = $1',
    [email]
  );

  return result.rows.length > 0;
}

/**
 * 检查手机号是否已存在
 * @param phone - 手机号
 * @returns 是否存在
 */
export async function phoneExists(phone: string): Promise<boolean> {
  const result = await query(
    'SELECT 1 FROM users WHERE phone = $1',
    [phone]
  );

  return result.rows.length > 0;
}

/**
 * 根据手机号获取用户
 * @param phone - 手机号
 * @returns 用户信息或 null
 */
export async function getUserByPhone(phone: string): Promise<User | null> {
  const result = await query(
    'SELECT * FROM users WHERE phone = $1 AND status = $2',
    [phone, 'active']
  );

  return result.rows[0] || null;
}

/**
 * 从 User 转换为 PublicUser（移除敏感信息）
 * @param user - 用户信息
 * @returns 公开用户信息
 */
export function toPublicUser(user: User | UserWithPassword): PublicUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash, ...publicUser } = user as UserWithPassword;
  return publicUser as PublicUser;
}
