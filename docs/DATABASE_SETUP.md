# 数据库设置指南

## 使用 MCP 工具创建数据库

### 步骤 1: 创建数据库（如果不存在）

如果 `gameBox` 数据库还不存在，需要先创建它。由于 PostgreSQL MCP 工具连接到特定数据库，你需要：

1. **临时修改 MCP 配置**，连接到 `postgres` 数据库：
   ```json
   "postgres": {
     "command": "npx",
     "args": [
       "-y",
       "@modelcontextprotocol/server-postgres",
       "postgresql://root:ZzyxBhyjpvB%2FN2hBxA9kjhirUmMMzbaS@47.86.46.212:5432/postgres"
     ]
   }
   ```

2. **使用 MCP 工具执行**：
   ```sql
   CREATE DATABASE gamebox;
   ```

3. **恢复 MCP 配置**，连接到 `gamebox` 数据库

### 步骤 2: 创建表结构

使用 MCP 工具执行 `src/lib/db/migrations/001_create_users.sql` 文件中的所有 SQL 语句。

#### 完整的 SQL 语句：

```sql
-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(50),
  avatar_url VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active'
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_status ON users(status);

-- 创建用户会话表
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  device_info VARCHAR(255),
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

-- 创建会话表索引
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 users 表添加自动更新 updated_at 的触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 步骤 3: 验证创建结果

执行以下查询验证表是否创建成功：

```sql
-- 查看所有表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 查看 users 表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

## 使用命令行工具（备选方案）

如果 MCP 工具不可用，可以使用 `psql` 命令行工具：

```bash
# 连接到数据库
psql -h 47.86.46.212 -p 5432 -U root -d postgres

# 创建数据库
CREATE DATABASE gamebox;

# 连接到 gamebox 数据库
\c gamebox

# 执行迁移文件
\i src/lib/db/migrations/001_create_users.sql
```

## 使用 Node.js 脚本（备选方案）

安装依赖后运行：

```bash
# 安装依赖
npm install pg @types/pg

# 运行迁移脚本
npx tsx src/lib/db/migrate.ts
```

## 表结构说明

### users 表
- `id`: 主键，自增
- `username`: 用户名，唯一，最大 50 字符
- `email`: 邮箱，唯一，最大 100 字符
- `password_hash`: 密码哈希值，最大 255 字符
- `nickname`: 昵称，可选，最大 50 字符
- `avatar_url`: 头像 URL，可选
- `phone`: 手机号，可选
- `created_at`: 创建时间，自动设置
- `updated_at`: 更新时间，自动更新
- `last_login_at`: 最后登录时间
- `status`: 用户状态，默认 'active'

### user_sessions 表
- `id`: 主键，自增
- `user_id`: 用户 ID，外键关联 users 表
- `token_hash`: Token 哈希值
- `device_info`: 设备信息
- `ip_address`: IP 地址
- `created_at`: 创建时间
- `expires_at`: 过期时间

## 注意事项

1. 所有表都使用 `IF NOT EXISTS`，可以安全地重复执行
2. 索引使用 `IF NOT EXISTS`，避免重复创建错误
3. 触发器会在更新 users 表时自动更新 `updated_at` 字段
4. 外键约束确保数据完整性
