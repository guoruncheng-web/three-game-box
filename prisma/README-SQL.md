# 数据库 SQL 文件使用指南

## 文件说明

**文件位置**: `prisma/database-init.sql`

这个 SQL 文件包含了水果消消乐游戏的完整数据库结构和初始数据：

- ✅ 2 个枚举类型（LeaderboardType, AchievementCategory）
- ✅ 7 张数据表（User, GameRecord, Leaderboard, Achievement, UserAchievement, DailyChallenge, UserDailyChallenge）
- ✅ 所有索引和约束
- ✅ 12 个默认成就数据

## 使用方法

### 方法 1: 使用 psql 命令行工具

```bash
# 1. 连接到 PostgreSQL
psql -U your_username -d postgres

# 2. 创建数据库（如果还没有）
CREATE DATABASE three_game;

# 3. 退出并重新连接到新数据库
\q
psql -U your_username -d three_game

# 4. 执行 SQL 文件
\i /path/to/three-game/prisma/database-init.sql

# 或者直接在命令行执行
psql -U your_username -d three_game -f /path/to/three-game/prisma/database-init.sql
```

### 方法 2: 使用一行命令

```bash
# 创建数据库并执行 SQL
psql -U your_username -d postgres -c "CREATE DATABASE three_game;" && \
psql -U your_username -d three_game -f prisma/database-init.sql
```

### 方法 3: 使用 pgAdmin 或其他 GUI 工具

1. 打开 pgAdmin 并连接到 PostgreSQL 服务器
2. 创建新数据库 `three_game`
3. 右键数据库 → Query Tool
4. 打开或粘贴 `database-init.sql` 的内容
5. 点击执行 (Execute/Run)

## 验证安装

执行 SQL 后，你应该看到：

```
      表名          |  大小
--------------------+--------
 Achievement        | 8192 bytes
 DailyChallenge     | 8192 bytes
 GameRecord         | 8192 bytes
 Leaderboard        | 8192 bytes
 User               | 8192 bytes
 UserAchievement    | 8192 bytes
 UserDailyChallenge | 8192 bytes

 成就数量
----------
       12

      状态
----------------
 ✓ 数据库初始化完成！
```

### 使用 psql 验证

```sql
-- 查看所有表
\dt

-- 查看枚举类型
\dT

-- 查看成就数据
SELECT code, name, category FROM "Achievement";

-- 查看表结构
\d "User"
\d "GameRecord"
\d "Achievement"
```

## 配置环境变量

数据库创建完成后，更新 `.env` 文件：

```env
DATABASE_URL="postgresql://username:password@localhost:5432/three_game?schema=public"
```

**替换参数**:
- `username`: 你的 PostgreSQL 用户名
- `password`: 你的密码
- `localhost`: 数据库服务器地址
- `5432`: PostgreSQL 端口（默认）
- `three_game`: 数据库名称

## 生成 Prisma Client

SQL 执行完成后，需要生成 Prisma Client：

```bash
# 1. 生成 Prisma Client
npm run db:generate

# 2. 验证连接（可选）
npm run db:studio
```

访问 http://localhost:5555 查看数据库内容。

## 常见问题

### Q1: 报错 "database already exists"
**解决**: 数据库已存在，直接跳过创建步骤，或者先删除：
```sql
DROP DATABASE three_game;
CREATE DATABASE three_game;
```

### Q2: 报错 "type already exists"
**解决**: 枚举类型已存在，先删除：
```sql
DROP TYPE IF EXISTS "LeaderboardType" CASCADE;
DROP TYPE IF EXISTS "AchievementCategory" CASCADE;
```

### Q3: 报错 "relation already exists"
**解决**: 表已存在，需要先删除所有表：
```sql
DROP TABLE IF EXISTS "UserDailyChallenge" CASCADE;
DROP TABLE IF EXISTS "DailyChallenge" CASCADE;
DROP TABLE IF EXISTS "UserAchievement" CASCADE;
DROP TABLE IF EXISTS "Achievement" CASCADE;
DROP TABLE IF EXISTS "Leaderboard" CASCADE;
DROP TABLE IF EXISTS "GameRecord" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
```

### Q4: 想要重新初始化数据库
**解决**: 使用完整的清理脚本：

```bash
# 创建清理脚本
cat > prisma/clean-db.sql << 'EOF'
-- 删除所有表
DROP TABLE IF EXISTS "UserDailyChallenge" CASCADE;
DROP TABLE IF EXISTS "DailyChallenge" CASCADE;
DROP TABLE IF EXISTS "UserAchievement" CASCADE;
DROP TABLE IF EXISTS "Achievement" CASCADE;
DROP TABLE IF EXISTS "Leaderboard" CASCADE;
DROP TABLE IF EXISTS "GameRecord" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- 删除枚举类型
DROP TYPE IF EXISTS "LeaderboardType" CASCADE;
DROP TYPE IF EXISTS "AchievementCategory" CASCADE;

SELECT '✓ 数据库已清理' AS "状态";
EOF

# 执行清理并重新初始化
psql -U your_username -d three_game -f prisma/clean-db.sql
psql -U your_username -d three_game -f prisma/database-init.sql
```

## 下一步

数据库设置完成后，你可以：

1. **测试 API**: 参考 `docs/api-documentation.md`
2. **集成到游戏**: 在游戏组件中调用 API
3. **查看文档**:
   - `docs/database-design.md` - 数据库设计详情
   - `docs/backend-summary.md` - 后端开发总结

## 注意事项

⚠️ **生产环境**:
- 不要在生产数据库上直接执行 DROP 命令
- 使用 Prisma Migrate 进行版本控制: `npm run db:migrate:prod`
- 定期备份数据库

⚠️ **开发环境**:
- 推荐使用 Prisma 工具链: `npm run db:push`
- 使用 `npm run db:studio` 可视化管理数据

⚠️ **安全**:
- 不要在代码中硬编码数据库密码
- 使用强密码
- 限制数据库访问权限
