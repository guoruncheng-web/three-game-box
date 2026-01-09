# 登录 500 错误排查指南

## 问题描述

登录时出现 `500 Internal Server Error`，需要排查可能的原因。

## 排查步骤

### 1. 检查数据库和 Redis 连接

访问测试连接 API：
```
GET http://localhost:3000/api/auth/test-connection
```

这个 API 会返回：
- 数据库连接状态
- Redis 连接状态
- 详细的错误信息（如果有）

### 2. 检查服务器日志

查看 Next.js 开发服务器的控制台输出，查找错误信息：
```bash
npm run dev
```

常见错误信息：
- `ECONNREFUSED` - 连接被拒绝（数据库/Redis 服务未启动或无法访问）
- `timeout` - 连接超时（网络问题或防火墙）
- `authentication failed` - 认证失败（用户名或密码错误）
- `relation "users" does not exist` - 数据库表不存在

### 3. 检查环境变量

确保 `.env.local` 文件存在并包含正确的配置：

```env
# 数据库配置
DB_HOST=47.86.46.212
DB_PORT=5432
DB_NAME=gameBox
DB_USER=root
DB_PASSWORD=ZzyxBhyjpvB/N2hBxA9kjhirUmMMzbaS

# Redis 配置
REDIS_HOST=47.86.46.212
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT 配置
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
```

### 4. 检查数据库表是否存在

使用 PostgreSQL MCP 工具或直接连接数据库检查：

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'user_sessions');
```

如果表不存在，需要执行数据库迁移。

### 5. 检查网络连接

确保可以访问远程服务器：
- 数据库服务器：`47.86.46.212:5432`
- Redis 服务器：`47.86.46.212:6379`

### 6. 常见问题和解决方案

#### 问题 1: 数据库连接失败

**错误信息：**
```
ECONNREFUSED 47.86.46.212:5432
```

**解决方案：**
1. 检查数据库服务是否运行
2. 检查防火墙设置
3. 验证数据库用户名和密码
4. 检查数据库是否允许远程连接

#### 问题 2: Redis 连接失败

**错误信息：**
```
Redis connection error
```

**解决方案：**
1. 检查 Redis 服务是否运行
2. 验证 Redis 配置（host, port, password）
3. 检查 Redis 是否允许远程连接

#### 问题 3: 数据库表不存在

**错误信息：**
```
relation "users" does not exist
```

**解决方案：**
执行数据库迁移创建表：
```bash
npm run migrate
```

或使用 MCP 工具执行 SQL 迁移文件。

#### 问题 4: 密码包含特殊字符

**错误信息：**
```
authentication failed
```

**解决方案：**
如果密码包含特殊字符（如 `/`），需要正确转义或使用环境变量。

## 调试技巧

### 1. 启用详细错误日志

在开发环境中，登录 API 现在会返回详细的错误信息。检查浏览器控制台或网络请求响应。

### 2. 使用测试连接 API

访问 `/api/auth/test-connection` 可以快速诊断连接问题。

### 3. 检查代码中的硬编码配置

如果环境变量未设置，代码会使用硬编码的默认值。确保这些默认值是正确的。

## 下一步

如果问题仍然存在：

1. 查看完整的错误堆栈信息
2. 检查数据库和 Redis 的服务器日志
3. 验证网络连接和防火墙设置
4. 确认数据库表结构是否正确
