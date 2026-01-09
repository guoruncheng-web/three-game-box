# 使用 MCP 工具创建数据库和表

## 方式一：如果 gameBox 数据库已存在

如果 `gameBox` 数据库已经存在，直接执行创建表的 SQL：

### 执行文件：
`src/lib/db/migrations/create_tables_only.sql`

### 或者直接执行以下 SQL：

```sql
-- 1. 创建用户表
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

-- 2. 创建用户表索引
CREATE INDEX IF NOT EXISTS idx_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_status ON users(status);

-- 3. 创建用户会话表
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  device_info VARCHAR(255),
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

-- 4. 创建会话表索引
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- 5. 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. 为 users 表添加自动更新 updated_at 的触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## 方式二：如果 gameBox 数据库不存在

需要分两步执行：

### 步骤 1: 创建数据库

1. **临时修改 `.mcp.json`**，将连接改为 `postgres` 数据库：
   ```json
   "postgresql://root:ZzyxBhyjpvB%2FN2hBxA9kjhirUmMMzbaS@47.86.46.212:5432/postgres"
   ```

2. **在 MCP 工具中执行创建数据库的 SQL**：
   ```sql
   CREATE DATABASE "gameBox"
   WITH
       OWNER = root
       ENCODING = 'UTF8'
       TABLESPACE = pg_default
       CONNECTION LIMIT = -1;
   ```

3. **验证数据库是否创建成功**：
   ```sql
   SELECT datname FROM pg_database WHERE datname = 'gameBox';
   ```

### 步骤 2: 创建表

1. **恢复 `.mcp.json` 配置**，连接回 `gameBox` 数据库：
   ```json
   "postgresql://root:ZzyxBhyjpvB%2FN2hBxA9kjhirUmMMzbaS@47.86.46.212:5432/gameBox"
   ```

2. **执行创建表的 SQL**（使用上面的 SQL 语句）

## 验证结果

执行以下查询验证表是否创建成功：

```sql
-- 查看所有表
SELECT 
  table_name,
  '表创建成功' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'user_sessions')
ORDER BY table_name;

-- 查看表结构
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;
```

## 注意事项

1. ✅ 所有 SQL 都使用了 `IF NOT EXISTS`，可以安全地重复执行
2. ✅ 确保 MCP 工具已连接到正确的数据库
3. ✅ PostgreSQL 中，数据库名使用双引号保留大小写：`"gameBox"`
4. ✅ 执行后应该能看到两个表：`users` 和 `user_sessions`
