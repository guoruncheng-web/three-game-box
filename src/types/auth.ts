/**
 * 认证相关的类型定义
 */

/** 用户信息 */
export interface User {
  id: number;
  username: string;
  email: string;
  nickname?: string;
  avatar_url?: string;
  phone?: string;
  status: string;
  created_at: Date | string;
  updated_at: Date | string;
  last_login_at?: Date | string;
}

/** 数据库用户（包含密码哈希） */
export interface UserWithPassword extends User {
  password_hash: string;
}

/** 用户（不包含敏感信息） */
export interface PublicUser {
  id: number;
  username: string;
  email: string;
  nickname?: string;
  avatar_url?: string;
  phone?: string;
  status: string;
  created_at: Date | string;
  updated_at: Date | string;
}

/** 注册请求 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  nickname?: string;
}

/** 登录请求 */
export interface LoginRequest {
  username: string; // 支持用户名或邮箱
  password: string;
}

/** 登录响应 */
export interface LoginResponse {
  user: PublicUser;
  token: string;
}

/** JWT Token 载荷 */
export interface JWTPayload {
  userId: number;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}

/** API 响应格式 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T | null;
}

/** 用户会话信息 */
export interface UserSession {
  id: number;
  user_id: number;
  token_hash: string;
  device_info?: string;
  ip_address?: string;
  created_at: Date | string;
  expires_at: Date | string;
}
