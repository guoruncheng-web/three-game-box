#!/usr/bin/env node
/**
 * 初始化测试用户脚本
 * 用法: node scripts/init-test-user.mjs
 */

import pg from 'pg';
import bcryptjs from 'bcryptjs';

const { Pool } = pg;

// 数据库配置
const pool = new Pool({
  host: process.env.DB_HOST || '47.86.46.212',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'gameBox',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'ZzyxBhyjpvB/N2hBxA9kjhirUmMMzbaS',
  ssl: false,
});

const testUser = {
  username: 'admin',
  email: 'admin@qq.com',
  password: 'admin123',
  nickname: '管理员',
  role: 'super_admin',
};

async function initTestUser() {
  console.log('🚀 开始初始化测试用户...\n');

  try {
    // 检查用户是否已存在
    console.log('📝 检查用户是否已存在...');
    const checkResult = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [testUser.username, testUser.email]
    );

    if (checkResult.rows.length > 0) {
      console.log('✅ 测试用户已存在，无需重复创建\n');
      console.log('📋 登录凭证:');
      console.log(`   用户名: ${testUser.username}`);
      console.log(`   邮箱:   ${testUser.email}`);
      console.log(`   密码:   ${testUser.password}\n`);
      return;
    }

    // 哈希密码
    console.log('🔒 加密密码...');
    const passwordHash = await bcryptjs.hash(testUser.password, 10);

    // 创建用户
    console.log('👤 创建用户...');
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
    console.log('📋 用户信息:');
    console.log(`   ID:     ${newUser.id}`);
    console.log(`   用户名: ${newUser.username}`);
    console.log(`   邮箱:   ${newUser.email}`);
    console.log(`   昵称:   ${newUser.nickname}`);
    console.log(`   角色:   ${newUser.role}`);
    console.log(`   状态:   ${newUser.status}\n`);
    console.log('🔑 登录凭证:');
    console.log(`   用户名/邮箱: ${testUser.username} 或 ${testUser.email}`);
    console.log(`   密码:        ${testUser.password}\n`);
    console.log('🌐 登录地址: http://localhost:3003/login\n');
  } catch (error) {
    console.error('❌ 错误:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   数据库连接失败，请检查数据库是否启动');
    } else if (error.code === '42P01') {
      console.error('   users 表不存在，请先执行数据库迁移脚本');
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 运行脚本
initTestUser();
