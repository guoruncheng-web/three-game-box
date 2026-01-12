# 数据库设置指南

本指南将帮助你设置水果消消乐游戏的 PostgreSQL 数据库。

## 前置要求

- PostgreSQL 12+ 已安装
- Node.js 18+ 已安装
- npm 或 pnpm 已安装

## 步骤 1: 安装依赖

```bash
npm install
```

这将安装所有必需的依赖，包括：
- `@prisma/client` - Prisma 客户端
- `prisma` - Prisma CLI 工具
- `tsx` - TypeScript 执行器（用于 seed 脚本）

## 步骤 2: 配置环境变量

复制 `.env.example` 到 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，设置你的数据库连接信息：

```env
DATABASE_URL="postgresql://username:password@localhost:5432/three_game?schema=public"
```

**参数说明：**
- `username`: PostgreSQL 用户名
- `password`: PostgreSQL 密码
- `localhost`: 数据库主机地址
- `5432`: PostgreSQL 端口（默认）
- `three_game`: 数据库名称
- `schema`: 数据库 schema（默认 public）

## 步骤 3: 创建数据库

首先连接到 PostgreSQL：

```bash
psql -U postgres
```

创建数据库：

```sql
CREATE DATABASE three_game;
\q
```

## 步骤 4: 生成 Prisma Client

```bash
npm run db:generate
```

这将根据 `prisma/schema.prisma` 生成类型安全的 Prisma Client。

## 步骤 5: 运行数据库迁移

### 开发环境

使用交互式迁移（会提示输入迁移名称）：

```bash
npm run db:migrate
```

或直接推送 schema 变更（不创建迁移文件）：

```bash
npm run db:push
```

### 生产环境

部署迁移（不会提示）：

```bash
npm run db:migrate:prod
```

## 步骤 6: 初始化种子数据

运行种子脚本添加默认成就数据：

```bash
npm run db:seed
```

这将创建 12 个默认成就：
- 初出茅庐（完成第一局）
- 高分新手/选手/大师
- 连击新手/高手/大师
- 坚持不懈/游戏达人/资深玩家
- 时光飞逝
- 完美通关

## 步骤 7: 验证设置

使用 Prisma Studio 可视化查看数据库：

```bash
npm run db:studio
```

这将打开浏览器访问 http://localhost:5555，你可以：
- 查看所有表和数据
- 手动添加/编辑/删除记录
- 运行查询

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run db:generate` | 生成 Prisma Client |
| `npm run db:push` | 推送 schema 变更到数据库 |
| `npm run db:migrate` | 创建并运行迁移（开发） |
| `npm run db:migrate:prod` | 运行迁移（生产） |
| `npm run db:seed` | 运行种子脚本 |
| `npm run db:studio` | 打开 Prisma Studio |

## 数据库 Schema

数据库包含以下表：

1. **User** - 用户信息和统计
2. **GameRecord** - 游戏记录
3. **Leaderboard** - 排行榜
4. **Achievement** - 成就定义
5. **UserAchievement** - 用户成就进度
6. **DailyChallenge** - 每日挑战
7. **UserDailyChallenge** - 用户挑战记录

详细的表结构和关系图请查看 `docs/database-design.md`。

## 故障排除

### 无法连接到数据库

**错误**: `Can't reach database server`

**解决方案**:
1. 确认 PostgreSQL 服务正在运行：
   ```bash
   # Linux/Mac
   pg_ctl status

   # 或
   sudo systemctl status postgresql
   ```

2. 检查 `.env` 中的 `DATABASE_URL` 是否正确

3. 确认防火墙允许连接到 PostgreSQL 端口

### 数据库已存在但表不存在

**解决方案**:
```bash
npm run db:push
```

### Prisma Client 版本不匹配

**错误**: `@prisma/client did not initialize yet`

**解决方案**:
```bash
npm run db:generate
```

### 迁移冲突

**错误**: `Migration ... failed`

**解决方案**:
```bash
# 重置数据库（警告：会删除所有数据！）
npx prisma migrate reset

# 或手动解决冲突后重新运行
npm run db:migrate
```

## 生产环境部署

### 1. 设置生产数据库 URL

在生产环境的 `.env` 或环境变量中设置：

```env
DATABASE_URL="postgresql://prod_user:secure_password@prod-db.example.com:5432/three_game_prod?schema=public&sslmode=require"
```

注意添加 `sslmode=require` 以确保安全连接。

### 2. 运行迁移

```bash
npm run db:migrate:prod
```

### 3. 运行种子（如果需要）

```bash
npm run db:seed
```

### 4. 构建应用

```bash
npm run build
```

## 备份和恢复

### 备份数据库

```bash
pg_dump -U username three_game > backup.sql
```

### 恢复数据库

```bash
psql -U username three_game < backup.sql
```

## 下一步

- 查看 API 文档了解如何使用后端接口
- 查看 `src/lib/prisma.ts` 了解如何在代码中使用 Prisma Client
- 查看 `prisma/schema.prisma` 了解数据模型定义
