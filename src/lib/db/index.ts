/**
 * PostgreSQL 数据库连接池
 * 已迁移至 Neon PostgreSQL，使用连接字符串 + SSL
 */

import pg from 'pg';

const { Pool } = pg;

// 数据库连接配置 - 使用 Neon 连接字符串
// 优先使用环境变量 DATABASE_URL，回退到直连地址
const DB_CONFIG = {
  connectionString: process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_XcOj4w1oyDCQ@ep-aged-bread-anwg4ox3-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false, // Neon 需要 SSL 连接
  },
  max: 10, // Neon 连接池建议较低的连接数
  idleTimeoutMillis: 30000, // 空闲连接超时时间（毫秒）
  connectionTimeoutMillis: 10000, // 连接超时时间（毫秒）
};

// 创建连接池
export const pool = new Pool(DB_CONFIG);

// 监听连接池事件
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * 执行查询
 * @param text - SQL 查询文本
 * @param params - 查询参数
 * @returns 查询结果
 */
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error', { text, error });
    throw error;
  }
}

/**
 * 获取一个客户端（用于事务）
 * @returns 数据库客户端
 */
export async function getClient() {
  return await pool.connect();
}

/**
 * 关闭连接池
 */
export async function closePool() {
  await pool.end();
}

// 导出类型
export type { Pool, QueryResult } from 'pg';
