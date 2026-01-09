/**
 * Redis 连接和工具函数
 */

import Redis from 'ioredis';

// Redis 连接配置
const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || '47.86.46.212',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  connectTimeout: 5000, // 连接超时 5 秒
  commandTimeout: 3000, // 命令超时 3 秒
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableOfflineQueue: false, // 禁用离线队列，避免请求堆积
  lazyConnect: false, // 立即连接
};

// 创建 Redis 客户端
export const redis = new Redis(REDIS_CONFIG);

// 监听 Redis 事件
redis.on('connect', () => {
  console.log('Redis connected');
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

redis.on('close', () => {
  console.log('Redis connection closed');
});

/**
 * 设置缓存（带过期时间）
 * @param key - 缓存键
 * @param value - 缓存值
 * @param ttl - 过期时间（秒）
 */
export async function setCache(key: string, value: any, ttl?: number): Promise<void> {
  const serialized = JSON.stringify(value);
  if (ttl) {
    await redis.setex(key, ttl, serialized);
  } else {
    await redis.set(key, serialized);
  }
}

/**
 * 获取缓存
 * @param key - 缓存键
 * @returns 缓存值或 null
 */
export async function getCache<T = any>(key: string): Promise<T | null> {
  const value = await redis.get(key);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return value as T;
  }
}

/**
 * 删除缓存
 * @param key - 缓存键
 */
export async function deleteCache(key: string): Promise<void> {
  await redis.del(key);
}

/**
 * 检查键是否存在
 * @param key - 缓存键
 * @returns 是否存在
 */
export async function existsCache(key: string): Promise<boolean> {
  const result = await redis.exists(key);
  return result === 1;
}

/**
 * 设置过期时间
 * @param key - 缓存键
 * @param ttl - 过期时间（秒）
 */
export async function expireCache(key: string, ttl: number): Promise<number> {
  return await redis.expire(key, ttl);
}

/**
 * 增加键的值（原子操作）
 * @param key - 缓存键
 * @returns 增加后的值
 */
export async function incrementCache(key: string): Promise<number> {
  return await redis.incr(key);
}

// 导出 Redis 客户端
export { Redis };
