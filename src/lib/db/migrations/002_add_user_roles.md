# 迁移 002：添加用户角色管理

**创建时间**: 2026-01-09
**状态**: 待执行

## 目的

为 `users` 表添加 `role` 列，支持用户角色管理系统（超级管理员、管理员、普通用户）。

## 变更内容

1. **添加 role 列**
   - 类型: `VARCHAR(20)`
   - 非空，默认值: `'user'`
   - 可选值: `'super_admin'`, `'admin'`, `'user'`

2. **添加约束**
   - CHECK 约束确保角色值有效

3. **添加索引**
   - 为 `role` 列创建索引，优化角色查询

## 执行方法

### 方法一：使用 Node.js 脚本（推荐）

```bash
cd /home/cooper/work/oner/three-game
node scripts/execute-migration.js
```

### 方法二：使用 psql 命令行

```bash
psql -h 47.86.46.212 -p 5432 -U root -d gameBox -f src/lib/db/migrations/EXECUTE_NOW.sql
```

### 方法三：使用 MCP PostgreSQL 工具

1. 连接到数据库（host: 47.86.46.212, database: gameBox）
2. 执行 `src/lib/db/migrations/EXECUTE_NOW.sql` 中的 SQL 语句

## 验证

执行后应该看到：

```
     column_name |     data_type     | column_default | is_nullable
    -------------+-------------------+----------------+-------------
     role        | character varying | 'user'::...    | NO
```

## 回滚（如果需要）

如果需要回滚此迁移：

```sql
-- 删除索引
DROP INDEX IF EXISTS idx_users_role;

-- 删除约束
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- 删除列
ALTER TABLE users DROP COLUMN IF EXISTS role;
```

## 注意事项

- ⚠️ 此迁移使用 `IF NOT EXISTS`，可以安全重复执行
- ⚠️ 现有用户默认角色为 `'user'`
- ⚠️ 执行后需要手动将第一个用户设置为超级管理员：

```sql
-- 将特定用户设置为超级管理员
UPDATE users
SET role = 'super_admin'
WHERE username = '你的用户名';
```

## 相关文件

- 迁移 SQL: `src/lib/db/migrations/EXECUTE_NOW.sql`
- 执行脚本: `scripts/execute-migration.js`
- 类型定义: `src/types/auth.ts`
- API 实现: `src/app/api/admin/users/create/route.ts`
