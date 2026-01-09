# 执行 SQL 创建数据库表的说明

## 方法 1: 使用 MCP 工具执行（推荐）

### 步骤 1: 确认数据库连接

确保 MCP 工具已连接到 `gameBox` 数据库：
- 在 Cursor 中，检查 MCP 工具状态
- 如果 `gameBox` 数据库不存在，先使用 `postgres-admin` 连接创建数据库

### 步骤 2: 执行 SQL

在 MCP PostgreSQL 工具中：

1. **选择 `postgres` 连接**（连接到 gameBox 数据库）

2. **执行 SQL**，有两种方式：

   **方式 A: 读取并执行文件**
   - 让 MCP 工具读取文件：`src/lib/db/migrations/EXECUTE_NOW.sql`
   - 执行文件中的所有 SQL 语句

   **方式 B: 直接复制粘贴执行**
   - 复制下面的完整 SQL 语句
   - 在 MCP 工具中粘贴并执行

## 完整 SQL 语句（可直接复制）

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

-- 创建用户表索引
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

-- 创建触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 步骤 3: 验证执行结果

执行以下查询验证表是否创建成功：

```sql
-- 查看所有表
SELECT 
  table_name,
  '表已创建' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'user_sessions')
ORDER BY table_name;

-- 查看 users 表结构
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;
```

## 方法 2: 使用命令行工具（如果 MCP 工具不可用）

如果有 `psql` 命令行工具：

```bash
# 连接到数据库
PGPASSWORD='ZzyxBhyjpvB/N2hBxA9kjhirUmMMzbaS' psql \
  -h 47.86.46.212 \
  -p 5432 \
  -U root \
  -d gameBox \
  -f src/lib/db/migrations/EXECUTE_NOW.sql
```

## 预期结果

执行成功后，应该看到：

1. ✅ `users` 表已创建
2. ✅ `user_sessions` 表已创建
3. ✅ 所有索引已创建
4. ✅ 触发器函数已创建
5. ✅ 触发器已创建

## 如果遇到错误

### 错误 1: 数据库不存在

```
ERROR: database "gameBox" does not exist
```

**解决方案**：
1. 使用 `postgres-admin` MCP 连接
2. 执行：`CREATE DATABASE "gameBox";`
3. 然后重新执行创建表的 SQL

### 错误 2: 表已存在

```
NOTICE: relation "users" already exists
```

**解决方案**：这是正常的，所有 SQL 都使用了 `IF NOT EXISTS`，可以安全地重复执行。

## 注意事项

- ✅ 所有 SQL 都使用了 `IF NOT EXISTS`，可以安全地重复执行
- ✅ PostgreSQL 中，数据库名使用双引号保留大小写：`"gameBox"`
- ✅ 确保连接的是正确的数据库，避免误操作
