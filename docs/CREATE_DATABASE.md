# 创建 gameBox 数据库

## 步骤说明

由于 PostgreSQL MCP 工具需要连接到已存在的数据库，我们需要分两步执行：

### 步骤 1: 创建数据库

首先，需要在默认的 `postgres` 数据库中创建 `gameBox` 数据库。

#### 方法 1: 修改 MCP 配置（推荐）

1. 临时修改 `.mcp.json` 文件，将 PostgreSQL 连接改为连接到 `postgres` 数据库：

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

2. 在 MCP 工具中执行以下 SQL 创建数据库：

```sql
-- 创建 gameBox 数据库（注意：使用双引号保留大小写）
CREATE DATABASE "gameBox"
WITH
    OWNER = root
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;
```

3. 验证数据库是否创建成功：

```sql
SELECT datname FROM pg_database WHERE datname = 'gamebox';
```

4. 恢复 `.mcp.json` 配置，连接回 `gamebox` 数据库：

```json
"postgres": {
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-postgres",
    "postgresql://root:ZzyxBhyjpvB%2FN2hBxA9kjhirUmMMzbaS@47.86.46.212:5432/gameBox"
  ]
}
```

#### 方法 2: 使用命令行工具

如果有 `psql` 命令行工具，可以使用：

```bash
# 连接到 postgres 数据库
psql -h 47.86.46.212 -p 5432 -U root -d postgres

# 执行创建数据库命令（注意：使用双引号保留大小写）
CREATE DATABASE "gameBox";

# 验证
\l "gameBox"
```

## 步骤 2: 创建表结构

数据库创建成功后，连接到 `gamebox` 数据库，然后执行 `001_create_users.sql` 或 `execute.sql` 文件中的 SQL 语句。

## 完整 SQL 语句

### 创建数据库的 SQL：

```sql
-- 使用双引号保留大小写
CREATE DATABASE "gameBox"
WITH
    OWNER = root
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;
```

### 简化版本（如果遇到编码问题）：

```sql
-- 使用双引号保留大小写
CREATE DATABASE "gameBox";
```

## 注意事项

1. 创建数据库需要在有足够权限的数据库（通常是 `postgres`）中执行
2. 如果数据库已存在，会报错，可以使用 `CREATE DATABASE IF NOT EXISTS`（但 PostgreSQL 不支持这个语法）
3. 可以先检查数据库是否存在：

```sql
-- 注意：PostgreSQL 中数据库名大小写敏感，需要使用双引号或者精确匹配
SELECT 1 FROM pg_database WHERE datname = 'gameBox';
-- 或者
SELECT 1 FROM pg_database WHERE datname ILIKE 'gamebox';
```

如果返回结果，说明数据库已存在，可以跳过创建步骤。
