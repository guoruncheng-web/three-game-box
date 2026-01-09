#!/bin/bash
# 通过 SSH 连接到服务器执行 SQL

set -e

SSH_KEY="./id_rsa"
SSH_HOST="47.86.46.212"
SSH_PORT="10022"
SSH_USER="root"
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="root"
DB_PASSWORD="ZzyxBhyjpvB/N2hBxA9kjhirUmMMzbaS"
DB_NAME="gameBox"
# 获取脚本所在目录的父目录（项目根目录）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SQL_FILE="$PROJECT_ROOT/src/lib/db/migrations/EXECUTE_NOW.sql"
SSH_KEY="$PROJECT_ROOT/id_rsa"

echo "🔌 连接到服务器..."
echo "   主机: ${SSH_HOST}:${SSH_PORT}"
echo "   用户: ${SSH_USER}"
echo "   数据库: ${DB_NAME}"
echo ""

# 读取 SQL 文件
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ 错误: SQL 文件不存在: $SQL_FILE"
    exit 1
fi

SQL_CONTENT=$(cat "$SQL_FILE")

# 通过 SSH 执行 SQL
ssh -i "$SSH_KEY" \
    -p "$SSH_PORT" \
    -o StrictHostKeyChecking=no \
    -o UserKnownHostsFile=/dev/null \
    "${SSH_USER}@${SSH_HOST}" \
    "export PGPASSWORD='${DB_PASSWORD}' && psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d \"${DB_NAME}\" << 'SQLEND'
${SQL_CONTENT}
SQLEND
"

echo ""
echo "✅ SQL 执行完成！"
