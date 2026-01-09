# 登录功能实现规划

## 一、技术架构

### 1.1 技术栈
- **数据库**: PostgreSQL
- **缓存**: Redis
- **认证方式**: JWT (JSON Web Token)
- **密码加密**: bcrypt
- **状态管理**: Redux Toolkit

### 1.2 依赖包
```json
{
  "dependencies": {
    "pg": "^8.11.3",              // PostgreSQL 客户端
    "@types/pg": "^8.10.9",       // PostgreSQL 类型定义
    "ioredis": "^5.3.2",          // Redis 客户端
    "jsonwebtoken": "^9.0.2",     // JWT 生成和验证
    "@types/jsonwebtoken": "^9.0.5",
    "bcryptjs": "^2.4.3",         // 密码加密
    "@types/bcryptjs": "^2.4.6",
    "zod": "^3.22.4"              // 数据验证
  }
}
```

## 二、数据库设计

### 2.1 用户表 (users)
```sql
CREATE TABLE users (
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
  status VARCHAR(20) DEFAULT 'active',
  INDEX idx_username (username),
  INDEX idx_email (email)
);
```

### 2.2 用户会话表 (user_sessions) - 可选
用于记录登录历史，如果需要的话：
```sql
CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  device_info VARCHAR(255),
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);
```

## 三、Redis 缓存设计

### 3.1 缓存 Key 设计
- **用户信息缓存**: `user:${userId}` - 存储用户基本信息，TTL: 1小时
- **Token 缓存**: `token:${tokenHash}` - 存储 token 信息，TTL: 7天
- **登录限制**: `login:attempt:${username}` - 登录失败次数，TTL: 15分钟
- **验证码**: `captcha:${sessionId}` - 验证码（如果需要），TTL: 5分钟

## 四、API 接口设计

### 4.1 注册接口
- **路径**: `POST /api/auth/register`
- **请求体**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "nickname": "string (可选)"
}
```
- **响应**:
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "user": {
      "id": 1,
      "username": "test",
      "email": "test@example.com",
      "nickname": "测试用户"
    },
    "token": "jwt_token_string"
  }
}
```

### 4.2 登录接口
- **路径**: `POST /api/auth/login`
- **请求体**:
```json
{
  "username": "string",  // 支持用户名或邮箱
  "password": "string"
}
```
- **响应**: 同注册接口

### 4.3 登出接口
- **路径**: `POST /api/auth/logout`
- **请求头**: `Authorization: Bearer ${token}`
- **响应**:
```json
{
  "code": 200,
  "message": "登出成功",
  "data": null
}
```

### 4.4 获取当前用户信息
- **路径**: `GET /api/auth/me`
- **请求头**: `Authorization: Bearer ${token}`
- **响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "test",
    "email": "test@example.com",
    "nickname": "测试用户",
    "avatar_url": "https://...",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 4.5 刷新 Token
- **路径**: `POST /api/auth/refresh`
- **请求头**: `Authorization: Bearer ${token}`
- **响应**: 返回新的 token

## 五、文件结构

```
src/
├── lib/
│   ├── db/
│   │   ├── index.ts              # PostgreSQL 连接池
│   │   ├── migrations/           # 数据库迁移文件
│   │   │   └── 001_create_users.sql
│   │   └── queries/              # 数据库查询函数
│   │       └── user.ts
│   ├── redis/
│   │   └── index.ts              # Redis 连接
│   └── auth/
│       ├── jwt.ts                # JWT 工具函数
│       ├── password.ts           # 密码加密/验证
│       └── middleware.ts         # 认证中间件
├── app/
│   └── api/
│       └── auth/
│           ├── register/
│           │   └── route.ts
│           ├── login/
│           │   └── route.ts
│           ├── logout/
│           │   └── route.ts
│           ├── me/
│           │   └── route.ts
│           └── refresh/
│               └── route.ts
├── stores/
│   └── authStore.ts              # Redux auth slice
├── types/
│   └── auth.ts                   # 认证相关类型定义
├── components/
│   └── auth/
│       ├── LoginForm.tsx
│       ├── RegisterForm.tsx
│       └── UserProfile.tsx
└── app/
    └── (auth)/                    # 认证相关页面
        ├── login/
        │   └── page.tsx
        └── register/
            └── page.tsx
```

## 六、安全措施

### 6.1 密码安全
- 使用 bcrypt 加密，salt rounds: 10
- 密码最小长度: 8 位
- 密码复杂度要求: 至少包含字母和数字

### 6.2 Token 安全
- JWT 过期时间: 7 天
- Refresh Token: 30 天
- Token 存储在 Redis 中，支持主动失效
- 使用 HTTPS 传输

### 6.3 登录限制
- 15 分钟内连续失败 5 次，锁定 15 分钟
- 使用 Redis 记录失败次数

### 6.4 数据验证
- 使用 Zod 进行请求数据验证
- 防止 SQL 注入（使用参数化查询）
- 防止 XSS 攻击（输入转义）

## 七、实现步骤

1. ✅ 安装依赖包
2. ✅ 配置数据库连接（PostgreSQL）
3. ✅ 配置 Redis 连接
4. ✅ 创建数据库表结构
5. ✅ 实现 JWT 工具函数
6. ✅ 实现密码加密/验证函数
7. ✅ 实现数据库查询函数
8. ✅ 实现 API 路由（注册、登录、登出、获取用户信息）
9. ✅ 创建 Redux auth store
10. ✅ 创建登录/注册页面组件
11. ✅ 实现认证中间件
12. ✅ 测试完整流程

## 八、环境变量配置

在 `.env.local` 中添加：
```env
# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/gamebox
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gameBox
DB_USER=your_user
DB_PASSWORD=your_password

# Redis 配置
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT 配置
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```

## 九、测试要点

1. **注册功能**
   - 正常注册流程
   - 用户名/邮箱重复检查
   - 密码强度验证
   - 数据格式验证

2. **登录功能**
   - 用户名登录
   - 邮箱登录
   - 密码错误处理
   - 登录限制测试

3. **Token 验证**
   - Token 有效性验证
   - Token 过期处理
   - Token 刷新机制

4. **缓存功能**
   - 用户信息缓存
   - Token 缓存
   - 缓存失效机制

## 十、后续优化

1. 添加手机号验证码登录
2. 添加第三方登录（微信、QQ等）
3. 添加忘记密码功能
4. 添加邮箱验证功能
5. 添加用户头像上传功能
6. 添加用户资料编辑功能
