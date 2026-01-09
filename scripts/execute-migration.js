/**
 * 直接执行数据库迁移脚本
 * 使用 PostgreSQL 连接执行 SQL
 */

const { Client } = require('pg');
const { readFileSync } = require('fs');
const { join } = require('path');

const DB_CONFIG = {
  host: '47.86.46.212',
  port: 5432,
  database: 'gameBox',
  user: 'root',
  password: 'ZzyxBhyjpvB/N2hBxA9kjhirUmMMzbaS',
};

const SQL_FILE = join(__dirname, '../src/lib/db/migrations/EXECUTE_NOW.sql');

async function executeMigration() {
  const client = new Client(DB_CONFIG);

  try {
    console.log('🔌 正在连接到数据库...');
    console.log(`   主机: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
    console.log(`   数据库: ${DB_CONFIG.database}`);
    console.log(`   用户: ${DB_CONFIG.user}\n`);

    await client.connect();
    console.log('✅ 数据库连接成功\n');

    console.log('📄 读取 SQL 文件...');
    const sql = readFileSync(SQL_FILE, 'utf-8');
    console.log(`   文件: ${SQL_FILE}\n`);

    console.log('🚀 正在执行 SQL 迁移...');
    await client.query(sql);
    console.log('✅ SQL 执行成功\n');

    console.log('🔍 验证表是否创建成功...\n');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('users', 'user_sessions')
      ORDER BY table_name;
    `);

    if (result.rows.length === 2) {
      console.log('✅ 表创建成功:');
      result.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('⚠️  部分表可能未创建成功');
      console.log('   已创建的表:', result.rows.map(r => r.table_name).join(', '));
    }

    console.log('\n✨ 迁移完成！');

  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND' && error.message.includes('pg')) {
      console.error('❌ 错误: pg 模块未安装');
      console.error('\n💡 请先安装依赖:');
      console.error('   npm install pg');
      console.error('\n或者直接在 MCP PostgreSQL 工具中执行 SQL 文件:');
      console.error('   src/lib/db/migrations/EXECUTE_NOW.sql');
    } else if (error.code === '3D000') {
      console.error('❌ 错误: 数据库 "gameBox" 不存在');
      console.error('\n💡 请先创建数据库:');
      console.error('   使用 postgres-admin MCP 连接，执行: CREATE DATABASE "gameBox";');
    } else {
      console.error('❌ 执行失败:', error.message);
      if (error.code) {
        console.error('   错误代码:', error.code);
      }
      console.error('\n💡 提示: 请直接在 MCP PostgreSQL 工具中执行 SQL');
      console.error('   SQL 文件位置: src/lib/db/migrations/EXECUTE_NOW.sql');
    }
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 数据库连接已关闭');
  }
}

executeMigration();
