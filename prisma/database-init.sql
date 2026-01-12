-- ============================================
-- 水果消消乐游戏数据库初始化脚本
-- Database: PostgreSQL 12+
-- Created: 2026-01-12
-- ============================================

-- 设置客户端编码
SET client_encoding = 'UTF8';

-- ==================== 枚举类型 ====================

-- 排行榜类型枚举
-- ALL_TIME: 历史总榜
-- DAILY: 每日榜
-- WEEKLY: 每周榜
-- MONTHLY: 每月榜
CREATE TYPE "LeaderboardType" AS ENUM ('ALL_TIME', 'DAILY', 'WEEKLY', 'MONTHLY');

-- 成就类别枚举
-- SCORE: 分数相关
-- COMBO: 连击相关
-- GAMES: 游戏次数相关
-- TIME: 时间相关
-- SPECIAL: 特殊成就
CREATE TYPE "AchievementCategory" AS ENUM ('SCORE', 'COMBO', 'GAMES', 'TIME', 'SPECIAL');

-- ==================== 数据表 ====================

-- 1. 用户表 (User)
-- 存储用户基本信息和游戏统计数据
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT,
    "email" TEXT,
    "avatar" TEXT,
    "isGuest" BOOLEAN NOT NULL DEFAULT true,
    "guestToken" TEXT,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "highestScore" INTEGER NOT NULL DEFAULT 0,
    "totalPlayTime" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- 2. 游戏记录表 (GameRecord)
-- 存储每局游戏的详细记录
CREATE TABLE "GameRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "moves" INTEGER NOT NULL,
    "targetScore" INTEGER NOT NULL DEFAULT 1000,
    "isWon" BOOLEAN NOT NULL,
    "playTime" INTEGER NOT NULL,
    "maxCombo" INTEGER NOT NULL DEFAULT 0,
    "totalMatches" INTEGER NOT NULL DEFAULT 0,
    "gameData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameRecord_pkey" PRIMARY KEY ("id")
);

-- 3. 排行榜表 (Leaderboard)
-- 存储不同类型和周期的排行榜数据
CREATE TABLE "Leaderboard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "LeaderboardType" NOT NULL,
    "score" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "period" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Leaderboard_pkey" PRIMARY KEY ("id")
);

-- 4. 成就表 (Achievement)
-- 定义所有可用的成就
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "category" "AchievementCategory" NOT NULL,
    "condition" JSONB NOT NULL,
    "reward" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- 5. 用户成就关联表 (UserAchievement)
-- 跟踪用户的成就解锁进度
CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "unlockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- 6. 每日挑战表 (DailyChallenge)
-- 存储每日挑战的配置
CREATE TABLE "DailyChallenge" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetScore" INTEGER NOT NULL,
    "targetMoves" INTEGER NOT NULL,
    "reward" INTEGER NOT NULL DEFAULT 100,
    "config" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyChallenge_pkey" PRIMARY KEY ("id")
);

-- 7. 用户每日挑战记录表 (UserDailyChallenge)
-- 跟踪用户的每日挑战完成情况
CREATE TABLE "UserDailyChallenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserDailyChallenge_pkey" PRIMARY KEY ("id")
);

-- ==================== 唯一约束 ====================

-- User 表唯一约束
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_guestToken_key" ON "User"("guestToken");

-- Leaderboard 表唯一约束
CREATE UNIQUE INDEX "Leaderboard_userId_type_period_key" ON "Leaderboard"("userId", "type", "period");

-- Achievement 表唯一约束
CREATE UNIQUE INDEX "Achievement_code_key" ON "Achievement"("code");

-- UserAchievement 表唯一约束
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");

-- DailyChallenge 表唯一约束
CREATE UNIQUE INDEX "DailyChallenge_date_key" ON "DailyChallenge"("date");

-- UserDailyChallenge 表唯一约束
CREATE UNIQUE INDEX "UserDailyChallenge_userId_challengeId_key" ON "UserDailyChallenge"("userId", "challengeId");

-- ==================== 索引 ====================

-- User 表索引
CREATE INDEX "User_guestToken_idx" ON "User"("guestToken");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_username_idx" ON "User"("username");

-- GameRecord 表索引
CREATE INDEX "GameRecord_userId_idx" ON "GameRecord"("userId");
CREATE INDEX "GameRecord_score_idx" ON "GameRecord"("score" DESC);
CREATE INDEX "GameRecord_createdAt_idx" ON "GameRecord"("createdAt" DESC);
CREATE INDEX "GameRecord_userId_score_idx" ON "GameRecord"("userId", "score" DESC);

-- Leaderboard 表索引
CREATE INDEX "Leaderboard_type_period_score_idx" ON "Leaderboard"("type", "period", "score" DESC);

-- Achievement 表索引
CREATE INDEX "Achievement_code_idx" ON "Achievement"("code");
CREATE INDEX "Achievement_category_idx" ON "Achievement"("category");

-- UserAchievement 表索引
CREATE INDEX "UserAchievement_userId_isUnlocked_idx" ON "UserAchievement"("userId", "isUnlocked");

-- DailyChallenge 表索引
CREATE INDEX "DailyChallenge_date_idx" ON "DailyChallenge"("date");
CREATE INDEX "DailyChallenge_isActive_idx" ON "DailyChallenge"("isActive");

-- UserDailyChallenge 表索引
CREATE INDEX "UserDailyChallenge_userId_isCompleted_idx" ON "UserDailyChallenge"("userId", "isCompleted");

-- ==================== 外键约束 ====================

-- GameRecord 外键
ALTER TABLE "GameRecord" ADD CONSTRAINT "GameRecord_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Leaderboard 外键
ALTER TABLE "Leaderboard" ADD CONSTRAINT "Leaderboard_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- UserAchievement 外键
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey"
    FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- UserDailyChallenge 外键
ALTER TABLE "UserDailyChallenge" ADD CONSTRAINT "UserDailyChallenge_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserDailyChallenge" ADD CONSTRAINT "UserDailyChallenge_challengeId_fkey"
    FOREIGN KEY ("challengeId") REFERENCES "DailyChallenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ==================== 种子数据 ====================

-- 插入默认成就数据
INSERT INTO "Achievement" ("id", "code", "name", "description", "icon", "category", "condition", "reward", "isActive", "createdAt") VALUES
    (gen_random_uuid(), 'first_game', '初出茅庐', '完成第一局游戏', '/images/achievements/first-game.png', 'GAMES', '{"type":"games","target":1,"operator":"gte"}', 10, true, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'score_1000', '高分新手', '单局得分超过 1000 分', '/images/achievements/score-1000.png', 'SCORE', '{"type":"score","target":1000,"operator":"gte"}', 20, true, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'score_2000', '高分选手', '单局得分超过 2000 分', '/images/achievements/score-2000.png', 'SCORE', '{"type":"score","target":2000,"operator":"gte"}', 50, true, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'score_5000', '得分大师', '单局得分超过 5000 分', '/images/achievements/score-5000.png', 'SCORE', '{"type":"score","target":5000,"operator":"gte"}', 100, true, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'combo_5', '连击新手', '达成 5 连击', '/images/achievements/combo-5.png', 'COMBO', '{"type":"combo","target":5,"operator":"gte"}', 15, true, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'combo_10', '连击高手', '达成 10 连击', '/images/achievements/combo-10.png', 'COMBO', '{"type":"combo","target":10,"operator":"gte"}', 30, true, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'combo_20', '连击大师', '达成 20 连击', '/images/achievements/combo-20.png', 'COMBO', '{"type":"combo","target":20,"operator":"gte"}', 80, true, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'games_10', '坚持不懈', '累计游戏 10 局', '/images/achievements/games-10.png', 'GAMES', '{"type":"games","target":10,"operator":"gte"}', 25, true, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'games_50', '游戏达人', '累计游戏 50 局', '/images/achievements/games-50.png', 'GAMES', '{"type":"games","target":50,"operator":"gte"}', 60, true, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'games_100', '资深玩家', '累计游戏 100 局', '/images/achievements/games-100.png', 'GAMES', '{"type":"games","target":100,"operator":"gte"}', 120, true, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'time_1hour', '时光飞逝', '累计游戏时长达到 1 小时', '/images/achievements/time-1hour.png', 'TIME', '{"type":"time","target":3600,"operator":"gte"}', 40, true, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'perfect_win', '完美通关', '不剩余步数的情况下达成目标分数', '/images/achievements/perfect-win.png', 'SPECIAL', '{"type":"special","code":"perfect_win"}', 150, true, CURRENT_TIMESTAMP);

-- ==================== 完成 ====================

-- 显示创建的表
SELECT
    tablename AS "表名",
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS "大小"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 显示创建的成就数量
SELECT COUNT(*) AS "成就数量" FROM "Achievement";

-- 执行完成提示
SELECT '✓ 数据库初始化完成！' AS "状态";
SELECT '✓ 已创建 7 张数据表' AS "详情";
SELECT '✓ 已插入 12 个默认成就' AS "详情";
