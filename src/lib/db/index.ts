/**
 * PostgreSQL 数据库连接池
 */

import pg from 'pg';

const { Pool } = pg;

// 数据库连接配置
const DB_CONFIG = {
  host: process.env.DB_HOST || '47.86.46.212',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'gameBox',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'ZzyxBhyjpvB/N2hBxA9kjhirUmMMzbaS',
  max: 20, // 连接池最大连接数
  idleTimeoutMillis: 30000, // 空闲连接超时时间（毫秒）
  connectionTimeoutMillis: 5000, // 连接超时时间（毫秒）
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
