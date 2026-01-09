/**
 * 数据库迁移脚本 - 使用 CommonJS 格式，可直接运行
 */

const { readFileSync } = require('fs');
const { join } = require('path');

// 尝试加载 pg 模块
let pg;
try {
  pg = require('pg');
} catch (error) {
  console.error('❌ 请先安装 pg 模块: npm install pg');
  process.exit(1);
}

const { Client } = pg;

// 数据库连接配置
const DB_CONFIG = {
  host: process.env.DB_HOST || '47.86.46.212',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'gameBox',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'ZzyxBhyjpvB/N2hBxA9kjhirUmMMzbaS',
};

/**
 * 执行 SQL 迁移文件
 */
async function runMigration() {
  const client = new Client(DB_CONFIG);

  try {
    console.log('🔌 正在连接到数据库...');
    console.log(`   主机: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
    console.log(`   数据库: ${DB_CONFIG.database}`);
    console.log(`   用户: ${DB_CONFIG.user}`);
    
    await client.connect();
    console.log('✅ 数据库连接成功\n');

    // 读取迁移文件
    const migrationPath = join(
      __dirname,
      '../src/lib/db/migrations/001_create_users.sql'
    );
    console.log(`📄 读取迁移文件: ${migrationPath}\n`);

    const sql = readFileSync(migrationPath, 'utf-8');

    // 执行 SQL
    console.log('🚀 正在执行迁移...');
    await client.query(sql);
    console.log('✅ 迁移执行成功\n');

    // 验证表是否创建成功
    console.log('🔍 验证表结构...\n');
    
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'user_sessions')
      ORDER BY table_name;
    `);

    console.log('📊 已创建的表:');
    if (tablesResult.rows.length === 0) {
      console.log('  ⚠️  未找到表，可能迁移失败');
    } else {
      tablesResult.rows.forEach((row) => {
        console.log(`  ✅ ${row.table_name}`);
      });
    }

    // 检查 users 表结构
    const columnsResult = await client.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 users 表结构:');
    columnsResult.rows.forEach((row) => {
      const maxLength = row.character_maximum_length ? `(${row.character_maximum_length})` : '';
      const nullable = row.is_nullable === 'NO' ? ' NOT NULL' : '';
      console.log(`  - ${row.column_name}: ${row.data_type}${maxLength}${nullable}`);
    });

    // 检查索引
    const indexesResult = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename IN ('users', 'user_sessions')
      AND schemaname = 'public'
      ORDER BY tablename, indexname;
    `);

    console.log('\n📑 已创建的索引:');
    indexesResult.rows.forEach((row) => {
      console.log(`  ✅ ${row.indexname}`);
    });

  } catch (error) {
    console.error('\n❌ 迁移失败:');
    console.error('   错误信息:', error.message);
    if (error.code) {
      console.error('   错误代码:', error.code);
    }
    if (error.code === '3D000') {
      console.error('\n💡 提示: 数据库 "gamebox" 不存在，请先创建数据库');
      console.error('   可以使用以下命令创建:');
      console.error(`   psql -h ${DB_CONFIG.host} -p ${DB_CONFIG.port} -U ${DB_CONFIG.user} -d postgres -c "CREATE DATABASE gamebox;"`);
    }
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 数据库连接已关闭');
  }
}

// 执行迁移
runMigration()
  .then(() => {
    console.log('\n✨ 迁移完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 迁移过程中发生错误:', error);
    process.exit(1);
  });
