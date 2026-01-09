/**
 * 测试数据库和 Redis 连接
 * GET /api/auth/test-connection
 */

import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function GET() {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    database: { connected: false, error: null },
    redis: { connected: false, error: null },
  };

  // 测试数据库连接
  try {
    const dbResult = await pool.query('SELECT NOW() as current_time, version() as version');
    results.database = {
      connected: true,
      currentTime: dbResult.rows[0].current_time,
      version: dbResult.rows[0].version.split(' ')[0] + ' ' + dbResult.rows[0].version.split(' ')[1],
    };
  } catch (error) {
    results.database = {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // 测试 Redis 连接
  try {
    await redis.ping();
    const redisInfo = await redis.info('server');
    results.redis = {
      connected: true,
      info: 'Redis connected successfully',
    };
  } catch (error) {
    results.redis = {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  const allConnected = results.database.connected && results.redis.connected;

  return NextResponse.json(
    {
      success: allConnected,
      ...results,
    },
    { status: allConnected ? 200 : 503 }
  );
}
