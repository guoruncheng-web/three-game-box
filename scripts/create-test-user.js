/**
 * 创建测试用户脚本
 * 用法: node scripts/create-test-user.js
 */

const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const DB_CONFIG = {
  host: '47.86.46.212',
  port: 5432,
  database: 'gameBox',
  user: 'root',
  password: 'ZzyxBhyjpvB/N2hBxA9kjhirUmMMzbaS',
};

async function createTestUser() {
  const client = new Client(DB_CONFIG);
  
  try {
    console.log('🔌 连接到数据库...\n');
    await client.connect();
    const email = 'admin@qq.com';
    const password = 'admin123';
    const username = 'admin';
    
    // 检查用户是否已存在
    const checkResult = await client.query(
      'SELECT id, username, email FROM users WHERE email = $1 OR username = $1',
      [email]
    );
    
    if (checkResult.rows.length > 0) {
      console.log('❌ 用户已存在:');
      console.log('   ID:', checkResult.rows[0].id);
      console.log('   用户名:', checkResult.rows[0].username);
      console.log('   邮箱:', checkResult.rows[0].email);
      return;
    }
    
    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);
    
    // 创建用户
    const result = await client.query(
      `INSERT INTO users (username, email, password_hash, nickname, role, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, username, email, nickname, role, status, created_at`,
      [username, email, passwordHash, '管理员', 'admin', 'active']
    );
    
    const user = result.rows[0];
    
    console.log('✅ 测试用户创建成功！');
    console.log('   用户ID:', user.id);
    console.log('   用户名:', user.username);
    console.log('   邮箱:', user.email);
    console.log('   昵称:', user.nickname);
    console.log('   角色:', user.role);
    console.log('   状态:', user.status);
    console.log('   创建时间:', user.created_at);
    console.log('\n📝 登录信息:');
    console.log('   邮箱:', email);
    console.log('   密码:', password);
    
  } catch (error) {
    console.error('❌ 创建用户失败:', error.message);
    if (error.code === '23505') {
      console.error('   错误: 用户名或邮箱已存在');
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

createTestUser();
