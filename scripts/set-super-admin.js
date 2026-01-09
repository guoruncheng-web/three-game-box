/**
 * 设置超级管理员
 */

const { Client } = require('pg');

const DB_CONFIG = {
  host: '47.86.46.212',
  port: 5432,
  database: 'gameBox',
  user: 'root',
  password: 'ZzyxBhyjpvB/N2hBxA9kjhirUmMMzbaS',
};

// 要设置为超级管理员的用户名或邮箱
const USERNAME = '1509233773@qq.com'; // 修改为你的用户名或邮箱

async function setSuperAdmin() {
  const client = new Client(DB_CONFIG);

  try {
    console.log('🔌 连接到数据库...\n');
    await client.connect();

    // 检查用户是否存在
    console.log(`📋 查找用户: ${USERNAME}\n`);
    const userResult = await client.query(
      'SELECT id, username, email, role FROM users WHERE username = $1 OR email = $1',
      [USERNAME]
    );

    if (userResult.rows.length === 0) {
      console.log('❌ 用户不存在！');
      console.log('\n请修改脚本中的 USERNAME 变量为你的用户名或邮箱');
      process.exit(1);
    }

    const user = userResult.rows[0];
    console.log('✅ 找到用户:');
    console.log(`   ID: ${user.id}`);
    console.log(`   用户名: ${user.username}`);
    console.log(`   邮箱: ${user.email}`);
    console.log(`   当前角色: ${user.role}\n`);

    if (user.role === 'super_admin') {
      console.log('✅ 该用户已经是超级管理员了！');
      process.exit(0);
    }

    // 更新为超级管理员
    console.log('🔄 正在设置为超级管理员...\n');
    await client.query(
      'UPDATE users SET role = $1 WHERE id = $2',
      ['super_admin', user.id]
    );

    // 验证更新
    const verifyResult = await client.query(
      'SELECT username, email, role FROM users WHERE id = $1',
      [user.id]
    );

    const updatedUser = verifyResult.rows[0];
    console.log('✅ 更新成功！');
    console.log(`   用户名: ${updatedUser.username}`);
    console.log(`   邮箱: ${updatedUser.email}`);
    console.log(`   新角色: ${updatedUser.role}`);
    console.log('\n🎉 现在你可以使用管理员功能了！');

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setSuperAdmin();
