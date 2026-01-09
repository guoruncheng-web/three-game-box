# 数据库迁移说明

## 使用方法

### 方法一：使用 MCP 工具执行

1. 确保 PostgreSQL MCP 工具已配置并连接
2. 使用 MCP 工具执行 `001_create_users.sql` 文件中的 SQL 语句

### 方法二：使用 psql 命令行

```bash
# 连接到数据库
psql -h 47.86.46.212 -p 5432 -U root -d gamebox

# 执行迁移文件
\i src/lib/db/migrations/001_create_users.sql
```

### 方法三：使用 Node.js 脚本

```bash
npm run migrate
```

## 迁移文件列表

- `001_create_users.sql` - 创建用户表和会话表

## 注意事项

- 执行迁移前请确保数据库 `gamebox` 已创建
- 如果数据库不存在，请先执行：`CREATE DATABASE gamebox;`
- 迁移文件使用 `IF NOT EXISTS` 确保可以安全重复执行
