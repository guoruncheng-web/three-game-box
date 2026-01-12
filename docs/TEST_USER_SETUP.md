# 测试用户设置指南

## 概述

本文档说明如何设置和使用测试用户进行登录测试。

## 测试用户信息

已创建的测试用户凭证：

```
用户名: admin
邮箱:   admin@qq.com
密码:   admin123
角色:   super_admin（超级管理员）
```

## 快速开始

### 1. 初始化数据库（如果尚未初始化）

运行初始化脚本来创建数据库表和测试用户：

```bash
node scripts/init-database.mjs
```

该脚本会：
- 创建 `users` 表（用户信息）
- 创建 `user_sessions` 表（登录会话）
- 创建测试用户 `admin@qq.com`

### 2. 启动开发服务器

```bash
npm run dev
```

开发服务器将在 http://localhost:3003 启动

### 3. 测试登录

#### 方式 1: 通过登录页面

1. 访问: http://localhost:3003/login
2. 输入凭证:
   - 用户名/邮箱: `admin` 或 `admin@qq.com`
   - 密码: `admin123`
3. 点击登录

#### 方式 2: 通过 API 测试

使用 curl 测试登录 API：

```bash
curl -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

成功响应示例：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@qq.com",
      "nickname": "管理员",
      "role": "super_admin",
      "status": "active"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## API 接口说明

### 登录接口

**POST** `/api/auth/login`

请求体：
```json
{
  "username": "admin",  // 支持用户名或邮箱
  "password": "admin123"
}
```

响应：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "user": { /* 用户信息 */ },
    "token": "jwt_token_string"
  }
}
```

### 获取当前用户信息

**GET** `/api/auth/me`

请求头：
```
Authorization: Bearer {token}
```

### 登出接口

**POST** `/api/auth/logout`

请求头：
```
Authorization: Bearer {token}
```

## 页面路由

| 路由 | 说明 |
|------|------|
| `/login` | 登录页面 |
| `/register` | 注册页面 |
| `/` | 首页（游戏列表） |

## 用户角色说明

系统支持三种用户角色：

1. **super_admin（超级管理员）**
   - 拥有所有权限
   - 可以创建和管理其他管理员

2. **admin（管理员）**
   - 管理内容和普通用户
   - 不能管理其他管理员

3. **user（普通用户）**
   - 基础使用权限
   - 可以玩游戏和查看排行榜

## 创建额外用户

### 方式 1: 通过管理员界面（需要先登录）

1. 以 admin 身份登录
2. 访问管理员页面
3. 使用创建用户功能

### 方式 2: 通过 API（需要管理员 Token）

```bash
curl -X POST http://localhost:3003/api/admin/users/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {admin_token}" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "nickname": "测试用户",
    "role": "user"
  }'
```

### 方式 3: 通过初始化 API（仅开发环境）

```bash
curl -X POST http://localhost:3003/api/admin/init-test-user
```

注意：此接口仅在开发环境可用，如果测试用户已存在会返回提示信息。

## 故障排除

### 问题 1: "用户名或密码错误"

**解决方案**：
1. 检查是否已运行初始化脚本
2. 确认用户名/邮箱和密码输入正确（区分大小写）
3. 检查数据库连接是否正常

### 问题 2: "数据库表不存在"

**解决方案**：
```bash
node scripts/init-database.mjs
```

### 问题 3: 无法连接到服务器

**解决方案**：
1. 确认开发服务器正在运行
2. 检查端口 3003 是否被占用
3. 查看服务器日志输出

### 问题 4: Token 无效

**解决方案**：
1. 检查 JWT_SECRET 环境变量是否设置
2. 确认 Token 格式正确（Bearer {token}）
3. 检查 Token 是否过期（默认 7 天）

## 环境变量配置

在 `.env.local` 或 `.env` 文件中配置：

```env
# 数据库配置
DB_HOST=47.86.46.212
DB_PORT=5432
DB_NAME=gameBox
DB_USER=root
DB_PASSWORD=your_password

# Redis 配置（可选）
REDIS_HOST=47.86.46.212
REDIS_PORT=6379

# JWT 配置
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
```

## 安全注意事项

1. **生产环境**：
   - 更改默认密码
   - 使用强 JWT 密钥
   - 启用 HTTPS
   - 禁用开发环境专用的 API

2. **测试用户**：
   - 仅用于开发和测试
   - 生产环境应删除或禁用
   - 不要在生产环境使用简单密码

## 相关文档

- [认证系统实现说明](./AUTH_IMPLEMENTATION.md)
- [认证系统规划](./AUTH_PLAN.md)
- [数据库设计](./database-design.md)
- [API 文档](./api-documentation.md)

## 脚本说明

### scripts/init-database.mjs

功能：
- 创建数据库表（users, user_sessions）
- 创建测试用户（admin@qq.com）
- 自动处理已存在的情况

用法：
```bash
node scripts/init-database.mjs
```

### scripts/init-test-user.mjs

功能：
- 仅创建测试用户（不创建表）
- 适用于表已存在的情况

用法：
```bash
node scripts/init-test-user.mjs
```

## 总结

测试用户已成功创建，可以通过以下方式进行测试：

1. ✅ 登录页面: http://localhost:3003/login
2. ✅ 登录 API: POST /api/auth/login
3. ✅ 凭证: admin@qq.com / admin123

如有问题，请查看故障排除部分或联系开发团队。
