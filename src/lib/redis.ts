/**
 * Redis 缓存模块
 * 提供简单的内存缓存实现（用于开发环境）
 */

// 简单的内存缓存 Map
const cache = new Map<string, { value: string; expireAt?: number }>();

/**
 * 模拟的 Redis 客户端（用于兼容性）
 */
export const redis = {
  get: async (key: string): Promise<string | null> => {
    return getCache(key);
  },
  set: async (key: string, value: string, ex?: number): Promise<void> => {
    setCache(key, value, ex);
  },
  del: async (key: string): Promise<void> => {
    delCache(key);
  },
  ping: async (): Promise<string> => {
    return 'PONG';
  },
};

/**
 * 获取缓存
 * @param key 缓存键
 * @returns 缓存值，如果不存在或已过期则返回 null
 */
export async function getCache(key: string): Promise<string | null> {
  const item = cache.get(key);

  if (!item) {
    return null;
  }

  // 检查是否过期
  if (item.expireAt && Date.now() > item.expireAt) {
    cache.delete(key);
    return null;
  }

  return item.value;
}

/**
 * 设置缓存
 * @param key 缓存键
 * @param value 缓存值（会自动转换为字符串）
 * @param ttl 过期时间（秒），不传则永久有效
 */
export async function setCache(key: string, value: any, ttl?: number): Promise<void> {
  const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
  const expireAt = ttl ? Date.now() + ttl * 1000 : undefined;

  cache.set(key, {
    value: valueStr,
    expireAt,
  });
}

/**
 * 删除缓存（别名：delCache）
 * @param key 缓存键
 */
export async function delCache(key: string): Promise<void> {
  cache.delete(key);
}

/**
 * 删除缓存（别名：deleteCache）
 * @param key 缓存键
 */
export async function deleteCache(key: string): Promise<void> {
  cache.delete(key);
}

/**
 * 清空所有缓存
 */
export async function clearCache(): Promise<void> {
  cache.clear();
}

/**
 * 定期清理过期缓存（可选）
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, item] of cache.entries()) {
    if (item.expireAt && now > item.expireAt) {
      cache.delete(key);
    }
  }
}, 60000); // 每分钟清理一次

// 日志
console.log('✓ Redis 模块已加载（内存缓存模式）');
