/**
 * 数据库迁移：初始化用户认证表
 * 执行时间：2026-01-12
 * 说明：创建 users 和 user_sessions 表，用于用户认证系统
 */

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(50),
  avatar_url VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- 添加角色检查约束
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_role_check'
  ) THEN
    ALTER TABLE users
    ADD CONSTRAINT users_role_check
    CHECK (role IN ('super_admin', 'admin', 'user'));
  END IF;
END $$;

-- 添加状态检查约束
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_status_check'
  ) THEN
    ALTER TABLE users
    ADD CONSTRAINT users_status_check
    CHECK (status IN ('active', 'inactive', 'banned'));
  END IF;
END $$;

-- 创建用户会话表
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- 添加注释
COMMENT ON TABLE users IS '用户表 - 存储用户基本信息和认证信息';
COMMENT ON COLUMN users.id IS '用户ID（主键）';
COMMENT ON COLUMN users.username IS '用户名（唯一）';
COMMENT ON COLUMN users.email IS '邮箱（唯一）';
COMMENT ON COLUMN users.password_hash IS '密码哈希值（bcrypt）';
COMMENT ON COLUMN users.nickname IS '昵称';
COMMENT ON COLUMN users.avatar_url IS '头像URL';
COMMENT ON COLUMN users.phone IS '手机号';
COMMENT ON COLUMN users.role IS '用户角色: super_admin=超级管理员, admin=管理员, user=普通用户';
COMMENT ON COLUMN users.status IS '用户状态: active=活跃, inactive=停用, banned=封禁';
COMMENT ON COLUMN users.created_at IS '创建时间';
COMMENT ON COLUMN users.updated_at IS '更新时间';
COMMENT ON COLUMN users.last_login_at IS '最后登录时间';

COMMENT ON TABLE user_sessions IS '用户会话表 - 存储登录会话信息';
COMMENT ON COLUMN user_sessions.id IS '会话ID（主键）';
COMMENT ON COLUMN user_sessions.user_id IS '用户ID（外键）';
COMMENT ON COLUMN user_sessions.token_hash IS 'Token哈希值';
COMMENT ON COLUMN user_sessions.device_info IS '设备信息';
COMMENT ON COLUMN user_sessions.ip_address IS 'IP地址';
COMMENT ON COLUMN user_sessions.created_at IS '创建时间';
COMMENT ON COLUMN user_sessions.expires_at IS '过期时间';

-- 验证迁移
SELECT
  table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name IN ('users', 'user_sessions')
GROUP BY table_name
ORDER BY table_name;
