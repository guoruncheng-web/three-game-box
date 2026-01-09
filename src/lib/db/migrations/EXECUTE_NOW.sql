/**
 * 数据库迁移：添加用户角色管理
 * 执行时间：2026-01-09
 * 说明：为 users 表添加 role 列，支持角色管理系统
 */

-- 添加角色列（如果不存在）
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user';

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

-- 为 role 列创建索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 注释
COMMENT ON COLUMN users.role IS '用户角色: super_admin=超级管理员, admin=管理员, user=普通用户';

-- 验证迁移
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name = 'role';
