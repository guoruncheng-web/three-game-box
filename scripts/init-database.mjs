#!/usr/bin/env node
/**
 * 数据库初始化脚本
 * 用法: node scripts/init-database.mjs
 * 功能: 1. 创建数据库表 2. 创建测试用户
 */

import pg from 'pg';
import bcryptjs from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

// 获取当前文件所在目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 数据库配置 - 使用 Neon PostgreSQL
// 优先使用环境变量 DATABASE_URL，回退到 Neon 连接字符串
const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_XcOj4w1oyDCQ@ep-aged-bread-anwg4ox3-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false, // Neon 需要 SSL 连接
  },
});

const testUser = {
  username: 'admin',
  email: 'admin@qq.com',
  password: 'admin123',
  nickname: '管理员',
  role: 'super_admin',
};

async function runMigration() {
  console.log('📋 读取数据库迁移文件...');
  const migrationPath = path.join(__dirname, '../src/lib/db/migrations/001_init_users_tables.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  console.log('🔨 执行数据库迁移...');
  await pool.query(migrationSQL);
  console.log('✅ 数据库表创建成功！\n');
}

async function createTestUser() {
  console.log('👤 创建测试用户...');

  // 检查用户是否已存在
  const checkResult = await pool.query(
    'SELECT * FROM users WHERE username = $1 OR email = $2',
    [testUser.username, testUser.email]
  );

  if (checkResult.rows.length > 0) {
    console.log('ℹ️  测试用户已存在，跳过创建\n');
    return checkResult.rows[0];
  }

  // 哈希密码
  const passwordHash = await bcryptjs.hash(testUser.password, 10);

  // 创建用户
  const result = await pool.query(
    `INSERT INTO users (username, email, password_hash, nickname, role, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
     RETURNING id, username, email, nickname, role, status, created_at`,
    [
      testUser.username,
      testUser.email,
      passwordHash,
      testUser.nickname,
      testUser.role,
      'active',
    ]
  );

  const newUser = result.rows[0];
  console.log('✅ 测试用户创建成功！\n');
  return newUser;
}

async function init() {
  console.log('🚀 开始初始化数据库...\n');
  console.log('📍 数据库配置:');
  console.log(`   连接: Neon PostgreSQL`);
  console.log(`   URL: ${(process.env.DATABASE_URL || 'postgresql://...neon.tech/neondb').replace(/:[^:@]+@/, ':***@')}\n`);

  try {
    // 1. 运行迁移
    await runMigration();

    // 2. 创建测试用户
    const user = await createTestUser();

    console.log('🎉 数据库初始化完成！\n');
    console.log('════════════════════════════════════════');
    console.log('📋 用户信息:');
    console.log(`   ID:     ${user.id}`);
    console.log(`   用户名: ${user.username}`);
    console.log(`   邮箱:   ${user.email}`);
    console.log(`   昵称:   ${user.nickname}`);
    console.log(`   角色:   ${user.role}`);
    console.log(`   状态:   ${user.status}`);
    console.log('────────────────────────────────────────');
    console.log('🔑 登录凭证:');
    console.log(`   用户名: ${testUser.username}`);
    console.log(`   邮箱:   ${testUser.email}`);
    console.log(`   密码:   ${testUser.password}`);
    console.log('────────────────────────────────────────');
    console.log('🌐 登录地址: http://localhost:3003/login');
    console.log('════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 提示: 无法连接到数据库，请检查:');
      console.error('   1. 数据库服务是否启动');
      console.error('   2. 数据库配置是否正确');
      console.error('   3. 网络连接是否正常\n');
    } else if (error.code === '3D000') {
      console.error('\n💡 提示: 数据库不存在，请先创建数据库:');
      console.error(`   CREATE DATABASE ${process.env.DB_NAME || 'gameBox'};\n`);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 运行脚本
init();
