/**
 * 验证数据库迁移结果
 */

const { Client } = require('pg');

const DB_CONFIG = {
  host: '47.86.46.212',
  port: 5432,
  database: 'gameBox',
  user: 'root',
  password: 'ZzyxBhyjpvB/N2hBxA9kjhirUmMMzbaS',
};

async function verify() {
  const client = new Client(DB_CONFIG);

  try {
    console.log('🔌 连接到数据库...\n');
    await client.connect();

    // 检查 role 列
    console.log('📊 检查 role 列信息:\n');
    const roleInfo = await client.query(`
      SELECT
        column_name,
        data_type,
        character_maximum_length,
        column_default,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
        AND column_name = 'role';
    `);

    if (roleInfo.rows.length === 0) {
      console.log('❌ role 列不存在！');
    } else {
      const col = roleInfo.rows[0];
      console.log('✅ role 列存在:');
      console.log(`   类型: ${col.data_type}(${col.character_maximum_length})`);
      console.log(`   默认值: ${col.column_default}`);
      console.log(`   可为空: ${col.is_nullable}`);
    }

    // 检查约束
    console.log('\n📋 检查约束:\n');
    const constraints = await client.query(`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'users'
        AND constraint_name = 'users_role_check';
    `);

    if (constraints.rows.length > 0) {
      console.log('✅ CHECK 约束存在: users_role_check');
    } else {
      console.log('❌ CHECK 约束不存在');
    }

    // 检查索引
    console.log('\n📑 检查索引:\n');
    const indexes = await client.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'users'
        AND indexname = 'idx_users_role';
    `);

    if (indexes.rows.length > 0) {
      console.log('✅ 索引存在: idx_users_role');
    } else {
      console.log('⚠️  索引不存在');
    }

    // 查看所有用户
    console.log('\n👥 当前所有用户:\n');
    const users = await client.query(`
      SELECT id, username, email, role, status, created_at
      FROM users
      ORDER BY id;
    `);

    if (users.rows.length === 0) {
      console.log('   暂无用户');
    } else {
      console.log(`   共 ${users.rows.length} 个用户:\n`);
      users.rows.forEach((user) => {
        console.log(`   [${user.id}] ${user.username} (${user.email})`);
        console.log(`       角色: ${user.role}`);
        console.log(`       状态: ${user.status}`);
        console.log(`       创建时间: ${user.created_at}`);
        console.log('');
      });
    }

    console.log('✨ 验证完成！\n');

  } catch (error) {
    console.error('❌ 验证失败:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verify();
