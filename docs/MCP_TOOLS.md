# MCP 工具配置说明

## ✅ 已配置的数据库 MCP 工具

### 1. PostgreSQL - gameBox 数据库连接

**工具名称**: `@modelcontextprotocol/server-postgres`  
**配置名称**: `postgres`  
**数据库**: `gameBox`  
**状态**: ✅ 已配置并可用

**功能**:
- ✅ 执行 SQL 查询（SELECT）
- ✅ 执行 SQL 命令（CREATE, INSERT, UPDATE, DELETE）
- ✅ 创建表、索引、触发器
- ✅ 查看数据库结构
- ✅ 查看表结构
- ✅ 管理数据

**使用方法**:
在 MCP 工具中选择 `postgres`，然后执行 SQL 语句，例如：

```sql
-- 创建表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 查询数据
SELECT * FROM users;

-- 查看表结构
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';
```

### 2. PostgreSQL - 管理连接（用于创建数据库）

**工具名称**: `@modelcontextprotocol/server-postgres`  
**配置名称**: `postgres-admin`  
**数据库**: `postgres`  
**状态**: ✅ 已配置

**用途**: 
- 创建新数据库
- 数据库管理操作
- 当需要创建 `gameBox` 数据库时使用

**使用示例**:
```sql
-- 创建 gameBox 数据库
CREATE DATABASE "gameBox"
WITH
    OWNER = root
    ENCODING = 'UTF8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;
```

## 其他已配置的工具

| 工具名称 | 功能说明 | 状态 |
|---------|---------|------|
| `filesystem` | 文件系统操作 | ✅ |
| `puppeteer` | 浏览器自动化 | ✅ |
| `memory` | 内存管理 | ✅ |
| `fetch` | HTTP 请求 | ✅ |
| `github` | GitHub API 操作 | ✅ |
| `ssh` | SSH 远程执行 | ✅ |

## 使用 MCP 工具创建数据库表的步骤

### 方式 1: 如果 gameBox 数据库已存在

1. 在 MCP 工具中选择 `postgres` 连接
2. 执行以下 SQL 创建表：

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

### 方式 2: 如果 gameBox 数据库不存在

1. **先创建数据库**：
   - 在 MCP 工具中选择 `postgres-admin` 连接
   - 执行：`CREATE DATABASE "gameBox";`

2. **然后创建表**：
   - 切换到 `postgres` 连接（连接到 gameBox 数据库）
   - 执行上面的创建表 SQL

## 验证执行结果

执行以下查询验证表是否创建成功：

```sql
-- 查看所有表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'user_sessions')
ORDER BY table_name;

-- 查看 users 表结构
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;
```

## 注意事项

1. ✅ `@modelcontextprotocol/server-postgres` 已经支持执行所有 SQL 操作
2. ⚠️ 数据库密码在连接字符串中使用 URL 编码（`%2F` 代表 `/`）
3. ⚠️ 所有 SQL 语句都使用了 `IF NOT EXISTS`，可以安全地重复执行
4. ⚠️ PostgreSQL 中，数据库名使用双引号保留大小写：`"gameBox"`
5. ⚠️ 确保连接的是正确的数据库，避免误操作

## 参考文档

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [PostgreSQL MCP Server - npm](https://www.npmjs.com/package/@modelcontextprotocol/server-postgres)
- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
