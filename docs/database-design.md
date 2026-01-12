# 水果消消乐数据库设计

## 数据库选择
- **开发/测试**: SQLite
- **生产环境**: PostgreSQL
- **ORM**: Prisma

## 表结构设计

### 1. User (用户表)
存储用户基本信息和游戏统计数据

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | String | 用户ID | PK, UUID |
| username | String | 用户名 | Unique, 可选 |
| email | String | 邮箱 | Unique, 可选 |
| avatar | String | 头像URL | 可选 |
| isGuest | Boolean | 是否游客 | 默认 true |
| guestToken | String | 游客标识 | Unique, 可选 |
| totalScore | Int | 总得分 | 默认 0 |
| gamesPlayed | Int | 游戏次数 | 默认 0 |
| highestScore | Int | 最高分 | 默认 0 |
| totalPlayTime | Int | 总游戏时长(秒) | 默认 0 |
| level | Int | 用户等级 | 默认 1 |
| createdAt | DateTime | 创建时间 | 自动 |
| updatedAt | DateTime | 更新时间 | 自动 |

**索引**:
- guestToken (unique)
- email (unique)
- username (unique)

---

### 2. GameRecord (游戏记录表)
记录每局游戏的详细信息

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | String | 记录ID | PK, UUID |
| userId | String | 用户ID | FK -> User.id |
| score | Int | 得分 | 必填 |
| moves | Int | 剩余步数 | 必填 |
| targetScore | Int | 目标分数 | 默认 1000 |
| isWon | Boolean | 是否胜利 | 必填 |
| playTime | Int | 游戏时长(秒) | 必填 |
| maxCombo | Int | 最大连击数 | 默认 0 |
| totalMatches | Int | 总消除次数 | 默认 0 |
| gameData | Json | 游戏详细数据 | 可选 |
| createdAt | DateTime | 创建时间 | 自动 |

**gameData JSON 结构**:
```json
{
  "gridSize": 8,
  "fruitsUsed": ["🍇", "🍋", "🍉"],
  "moveHistory": [
    { "from": [0, 0], "to": [0, 1], "score": 30 }
  ],
  "specialMoves": {
    "fourMatch": 2,
    "fiveMatch": 1
  }
}
```

**索引**:
- userId
- score (降序)
- createdAt (降序)
- userId + score (复合索引)

---

### 3. Leaderboard (排行榜表)
存储排行榜数据（支持多种类型）

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | String | 记录ID | PK, UUID |
| userId | String | 用户ID | FK -> User.id |
| type | Enum | 排行榜类型 | 必填 |
| score | Int | 分数 | 必填 |
| rank | Int | 排名 | 必填 |
| period | String | 周期标识 | 必填 |
| metadata | Json | 额外信息 | 可选 |
| createdAt | DateTime | 创建时间 | 自动 |
| updatedAt | DateTime | 更新时间 | 自动 |

**type 枚举值**:
- `ALL_TIME` - 历史总榜
- `DAILY` - 每日榜
- `WEEKLY` - 每周榜
- `MONTHLY` - 每月榜

**period 格式**:
- ALL_TIME: "all"
- DAILY: "2026-01-12"
- WEEKLY: "2026-W02"
- MONTHLY: "2026-01"

**索引**:
- type + period + score (复合索引)
- userId + type + period (复合唯一索引)

---

### 4. Achievement (成就表)
定义所有可获得的成就

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | String | 成就ID | PK, UUID |
| code | String | 成就代码 | Unique |
| name | String | 成就名称 | 必填 |
| description | String | 成就描述 | 必填 |
| icon | String | 图标URL | 必填 |
| category | Enum | 成就类别 | 必填 |
| condition | Json | 解锁条件 | 必填 |
| reward | Int | 奖励积分 | 默认 0 |
| isActive | Boolean | 是否启用 | 默认 true |
| createdAt | DateTime | 创建时间 | 自动 |

**category 枚举值**:
- `SCORE` - 分数相关
- `COMBO` - 连击相关
- `GAMES` - 游戏次数相关
- `TIME` - 时间相关
- `SPECIAL` - 特殊成就

**condition JSON 结构**:
```json
{
  "type": "score",
  "target": 5000,
  "operator": "gte"
}
```

**成就示例**:
- 初出茅庐: 完成第一局游戏
- 高分选手: 单局得分超过 2000
- 连击大师: 达成 10 连击
- 坚持不懈: 累计游戏 100 局

**索引**:
- code (unique)
- category

---

### 5. UserAchievement (用户成就关联表)
记录用户获得的成就

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | String | 记录ID | PK, UUID |
| userId | String | 用户ID | FK -> User.id |
| achievementId | String | 成就ID | FK -> Achievement.id |
| progress | Int | 进度 | 默认 0 |
| isUnlocked | Boolean | 是否解锁 | 默认 false |
| unlockedAt | DateTime | 解锁时间 | 可选 |
| createdAt | DateTime | 创建时间 | 自动 |

**索引**:
- userId + achievementId (复合唯一索引)
- userId + isUnlocked

---

### 6. DailyChallenge (每日挑战表)
每日特殊挑战任务

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | String | 挑战ID | PK, UUID |
| date | DateTime | 日期 | Unique |
| name | String | 挑战名称 | 必填 |
| description | String | 挑战描述 | 必填 |
| targetScore | Int | 目标分数 | 必填 |
| targetMoves | Int | 限定步数 | 必填 |
| reward | Int | 完成奖励 | 默认 100 |
| config | Json | 特殊配置 | 可选 |
| isActive | Boolean | 是否激活 | 默认 true |
| createdAt | DateTime | 创建时间 | 自动 |

**config JSON 结构**:
```json
{
  "gridSize": 8,
  "fruitsLimit": ["🍇", "🍋", "🍉", "🍊"],
  "specialRules": {
    "timedMode": true,
    "timeLimit": 180
  }
}
```

**索引**:
- date (unique)
- isActive

---

### 7. UserDailyChallenge (用户每日挑战记录)
记录用户完成每日挑战的情况

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | String | 记录ID | PK, UUID |
| userId | String | 用户ID | FK -> User.id |
| challengeId | String | 挑战ID | FK -> DailyChallenge.id |
| score | Int | 得分 | 必填 |
| isCompleted | Boolean | 是否完成 | 默认 false |
| attempts | Int | 尝试次数 | 默认 1 |
| completedAt | DateTime | 完成时间 | 可选 |
| createdAt | DateTime | 创建时间 | 自动 |

**索引**:
- userId + challengeId (复合唯一索引)
- userId + isCompleted

---

## 关系图

```
User (1) ----< (N) GameRecord
User (1) ----< (N) Leaderboard
User (1) ----< (N) UserAchievement
User (1) ----< (N) UserDailyChallenge

Achievement (1) ----< (N) UserAchievement

DailyChallenge (1) ----< (N) UserDailyChallenge
```

---

## 数据迁移策略

### 初始数据种子 (Seed Data)

1. **默认成就**:
```sql
INSERT INTO Achievement VALUES
  ('初出茅庐', '完成第一局游戏', 'GAMES', {"type": "games", "target": 1}),
  ('高分新手', '单局得分超过1000', 'SCORE', {"type": "score", "target": 1000}),
  ('高分选手', '单局得分超过2000', 'SCORE', {"type": "score", "target": 2000}),
  ('连击新手', '达成5连击', 'COMBO', {"type": "combo", "target": 5}),
  ('连击大师', '达成10连击', 'COMBO', {"type": "combo", "target": 10});
```

2. **每日挑战生成**:
   - 每天自动生成新的挑战
   - 可通过定时任务 (Cron Job) 实现

---

## 性能优化建议

1. **索引优化**:
   - 为常用查询字段添加索引
   - 复合索引用于多字段查询

2. **数据归档**:
   - 游戏记录超过 3 个月自动归档
   - 保留统计数据，归档详细记录

3. **缓存策略**:
   - 排行榜数据使用 Redis 缓存
   - 缓存过期时间: 5 分钟

4. **分表策略** (可选，大规模时):
   - GameRecord 按月分表
   - Leaderboard 按类型分表

---

## 查询示例

### 获取全球排行榜 Top 100
```sql
SELECT u.username, l.score, l.rank
FROM Leaderboard l
JOIN User u ON l.userId = u.id
WHERE l.type = 'ALL_TIME' AND l.period = 'all'
ORDER BY l.rank ASC
LIMIT 100;
```

### 获取用户游戏统计
```sql
SELECT
  COUNT(*) as total_games,
  MAX(score) as highest_score,
  AVG(score) as avg_score,
  SUM(playTime) as total_time
FROM GameRecord
WHERE userId = ?;
```

### 获取用户待解锁成就
```sql
SELECT a.*
FROM Achievement a
LEFT JOIN UserAchievement ua ON a.id = ua.achievementId AND ua.userId = ?
WHERE ua.id IS NULL OR ua.isUnlocked = false;
```
