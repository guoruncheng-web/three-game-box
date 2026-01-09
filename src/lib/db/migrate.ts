/**
 * 数据库迁移脚本
 * 用于执行 SQL 迁移文件
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import pg from 'pg';

const { Client } = pg;

// 数据库连接配置
// 从环境变量或默认值获取配置
const DB_CONFIG = {
  host: process.env.DB_HOST || '47.86.46.212',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'gameBox',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || decodeURIComponent('ZzyxBhyjpvB%2FN2hBxA9kjhirUmMMzbaS'),
};

/**
 * 执行 SQL 迁移文件
 */
async function runMigration() {
  const client = new Client(DB_CONFIG);

  try {
    console.log('🔌 连接到数据库...');
    await client.connect();
    console.log('✅ 数据库连接成功');

    // 读取迁移文件
    const migrationPath = join(
      process.cwd(),
      'src/lib/db/migrations/001_create_users.sql'
    );
    console.log(`📄 读取迁移文件: ${migrationPath}`);

    const sql = readFileSync(migrationPath, 'utf-8');

    // 执行 SQL
    console.log('🚀 执行迁移...');
    await client.query(sql);
    console.log('✅ 迁移执行成功');

    // 验证表是否创建成功
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'user_sessions')
      ORDER BY table_name;
    `);

    console.log('\n📊 已创建的表:');
    tablesResult.rows.forEach((row) => {
      console.log(`  - ${row.table_name}`);
    });

    // 检查 users 表结构
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 users 表结构:');
    columnsResult.rows.forEach((row) => {
      console.log(
        `  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : ''}`
      );
    });
  } catch (error) {
    console.error('❌ 迁移失败:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 数据库连接已关闭');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('\n✨ 迁移完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 迁移过程中发生错误:', error);
      process.exit(1);
    });
}

export { runMigration };
