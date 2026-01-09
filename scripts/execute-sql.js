/**
 * 直接执行 SQL 脚本
 * 使用 PostgreSQL MCP 工具或直接连接数据库
 */

// 由于无法直接调用 MCP 工具，这里提供一个通过 SSH 执行的方式
// 或者需要手动在 MCP 工具中执行

const { exec } = require('child_process');
const { readFileSync } = require('fs');
const { join } = require('path');

const SQL_FILE = join(__dirname, '../src/lib/db/migrations/EXECUTE_NOW.sql');
const DB_CONFIG = {
  host: '47.86.46.212',
  port: '5432',
  user: 'root',
  password: 'ZzyxBhyjpvB/N2hBxA9kjhirUmMMzbaS',
  database: 'gameBox',
};

console.log('📄 读取 SQL 文件...');
const sql = readFileSync(SQL_FILE, 'utf-8');

console.log('🔌 准备连接到数据库...');
console.log(`   主机: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
console.log(`   数据库: ${DB_CONFIG.database}`);
console.log(`   用户: ${DB_CONFIG.user}`);

// 通过 SSH 连接到服务器执行 psql 命令
const sshCommand = `ssh -p 10022 root@${DB_CONFIG.host} << 'EOF'
export PGPASSWORD='${DB_CONFIG.password}'
psql -h localhost -p ${DB_CONFIG.port} -U ${DB_CONFIG.user} -d "${DB_CONFIG.database}" << 'SQLEND'
${sql.replace(/'/g, "'\"'\"'")}
SQLEND
EOF
`;

console.log('🚀 执行 SQL...');
exec(sshCommand, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ 执行失败:', error.message);
    console.error('stderr:', stderr);
    console.log('\n💡 提示: 请直接在 MCP PostgreSQL 工具中执行 SQL');
    console.log('   SQL 文件位置: src/lib/db/migrations/EXECUTE_NOW.sql');
    process.exit(1);
  }
  
  console.log('✅ SQL 执行成功!');
  console.log('输出:', stdout);
  if (stderr) {
    console.log('警告:', stderr);
  }
});
