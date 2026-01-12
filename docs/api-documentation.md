```markdown
# 水果消消乐游戏 API 文档

## 基础信息

- **Base URL**: `http://localhost:7006/api` (开发环境)
- **Content-Type**: `application/json`
- **认证**: 暂未实现（后续可添加 JWT）

## 响应格式

所有 API 响应都遵循统一格式：

### 成功响应
```json
{
  "success": true,
  "data": { ... }
}
```

### 错误响应
```json
{
  "success": false,
  "error": "错误信息"
}
```

---

## 用户相关 API

### 1. 创建游客用户

**POST** `/api/users/guest`

创建一个新的游客用户账号。

**请求体**: 无

**响应**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "guestToken": "uuid",
    "isGuest": true
  }
}
```

**示例**:
```bash
curl -X POST http://localhost:7006/api/users/guest
```

---

### 2. 获取用户信息

**GET** `/api/users/:id`

获取指定用户的详细信息。

**路径参数**:
- `id` (string): 用户 ID

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "玩家123",
    "avatar": "https://...",
    "isGuest": false,
    "totalScore": 15000,
    "gamesPlayed": 50,
    "highestScore": 2500,
    "totalPlayTime": 3600,
    "level": 5,
    "createdAt": "2026-01-12T00:00:00.000Z"
  }
}
```

**示例**:
```bash
curl http://localhost:7006/api/users/[user-id]
```

---

### 3. 更新用户信息

**PUT** `/api/users/:id`

更新用户的个人信息（用户名、头像等）。

**路径参数**:
- `id` (string): 用户 ID

**请求体**:
```json
{
  "username": "新用户名",
  "avatar": "https://new-avatar-url.com/avatar.png"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "新用户名",
    "avatar": "https://new-avatar-url.com/avatar.png",
    "isGuest": false
  }
}
```

---

## 游戏记录 API

### 4. 提交游戏记录

**POST** `/api/game-records`

提交一局游戏的记录，自动更新用户统计和排行榜。

**请求体**:
```json
{
  "userId": "uuid",
  "score": 1500,
  "moves": 5,
  "targetScore": 1000,
  "isWon": true,
  "playTime": 180,
  "maxCombo": 8,
  "totalMatches": 25,
  "gameData": {
    "gridSize": 8,
    "fruitsUsed": ["🍇", "🍋", "🍉"],
    "moveHistory": []
  }
}
```

**字段说明**:
- `userId` (string, 必需): 用户 ID
- `score` (number, 必需): 得分
- `moves` (number, 必需): 剩余步数
- `targetScore` (number): 目标分数，默认 1000
- `isWon` (boolean, 必需): 是否胜利
- `playTime` (number, 必需): 游戏时长（秒）
- `maxCombo` (number): 最大连击数
- `totalMatches` (number): 总消除次数
- `gameData` (object): 游戏详细数据（可选）

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "score": 1500,
    "moves": 5,
    "isWon": true,
    "createdAt": "2026-01-12T00:00:00.000Z"
  }
}
```

**示例**:
```bash
curl -X POST http://localhost:7006/api/game-records \
  -H "Content-Type: application/json" \
  -d '{"userId":"...","score":1500,"moves":5,"isWon":true,"playTime":180}'
```

---

### 5. 获取游戏历史

**GET** `/api/game-records?userId=xxx&limit=10&offset=0`

获取用户的游戏历史记录。

**查询参数**:
- `userId` (string, 必需): 用户 ID
- `limit` (number): 每页数量，默认 10
- `offset` (number): 偏移量，默认 0

**响应**:
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "uuid",
        "score": 1500,
        "moves": 5,
        "targetScore": 1000,
        "isWon": true,
        "playTime": 180,
        "maxCombo": 8,
        "totalMatches": 25,
        "createdAt": "2026-01-12T00:00:00.000Z"
      }
    ],
    "total": 50,
    "limit": 10,
    "offset": 0
  }
}
```

---

### 6. 获取游戏统计

**GET** `/api/game-records/stats?userId=xxx`

获取用户的游戏统计信息。

**查询参数**:
- `userId` (string, 必需): 用户 ID

**响应**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "gamesPlayed": 50,
      "totalScore": 15000,
      "highestScore": 2500,
      "totalPlayTime": 3600,
      "level": 5,
      "winRate": 68.5
    },
    "averages": {
      "avgScore": 300,
      "avgPlayTime": 72,
      "avgCombo": 6.5
    },
    "records": {
      "maxScore": 2500,
      "maxCombo": 15,
      "totalGames": 50
    },
    "recentGames": [...]
  }
}
```

---

## 排行榜 API

### 7. 获取排行榜

**GET** `/api/leaderboard?type=ALL_TIME&limit=100&userId=xxx`

获取排行榜数据。

**查询参数**:
- `type` (string): 排行榜类型
  - `ALL_TIME`: 历史总榜（默认）
  - `DAILY`: 每日榜
  - `WEEKLY`: 每周榜
  - `MONTHLY`: 每月榜
- `limit` (number): 返回数量，默认 100
- `userId` (string): 可选，如果提供则返回该用户的排名

**响应**:
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "id": "uuid",
        "userId": "uuid",
        "score": 5000,
        "rank": 1,
        "user": {
          "id": "uuid",
          "username": "玩家A",
          "avatar": "https://...",
          "isGuest": false
        }
      }
    ],
    "userRank": {
      "rank": 25,
      "score": 1500,
      "user": { ... }
    },
    "type": "ALL_TIME",
    "period": "all"
  }
}
```

**示例**:
```bash
# 获取历史总榜 Top 100
curl "http://localhost:7006/api/leaderboard?type=ALL_TIME&limit=100"

# 获取每日榜并查看我的排名
curl "http://localhost:7006/api/leaderboard?type=DAILY&userId=[user-id]"
```

---

## 成就 API

### 8. 获取所有成就

**GET** `/api/achievements`

获取系统中所有可用的成就列表。

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "first_game",
      "name": "初出茅庐",
      "description": "完成第一局游戏",
      "icon": "/images/achievements/first-game.png",
      "category": "GAMES",
      "condition": {
        "type": "games",
        "target": 1,
        "operator": "gte"
      },
      "reward": 10,
      "isActive": true
    }
  ]
}
```

---

### 9. 获取用户成就

**GET** `/api/achievements/user/:userId`

获取用户的成就解锁进度。

**路径参数**:
- `userId` (string): 用户 ID

**响应**:
```json
{
  "success": true,
  "data": {
    "achievements": [
      {
        "id": "uuid",
        "code": "first_game",
        "name": "初出茅庐",
        "description": "完成第一局游戏",
        "icon": "/images/achievements/first-game.png",
        "category": "GAMES",
        "condition": { ... },
        "reward": 10,
        "progress": 100,
        "isUnlocked": true,
        "unlockedAt": "2026-01-12T00:00:00.000Z"
      }
    ],
    "stats": {
      "total": 12,
      "unlocked": 5,
      "progress": 42,
      "totalReward": 130
    }
  }
}
```

---

### 10. 检查并解锁成就

**POST** `/api/achievements/check`

检查用户是否满足成就条件，并自动解锁。

**请求体**:
```json
{
  "userId": "uuid",
  "gameData": {
    "score": 1500,
    "maxCombo": 8,
    "moves": 5,
    "isWon": true
  }
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "unlockedCount": 2,
    "unlockedAchievements": [
      {
        "id": "uuid",
        "userId": "uuid",
        "achievementId": "uuid",
        "progress": 100,
        "isUnlocked": true,
        "unlockedAt": "2026-01-12T00:00:00.000Z",
        "achievement": {
          "code": "score_1000",
          "name": "高分新手",
          "reward": 20
        }
      }
    ]
  }
}
```

---

## 错误码

| HTTP 状态码 | 说明 |
|------------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 使用流程示例

### 完整游戏流程

```javascript
// 1. 创建游客用户
const createUser = async () => {
  const res = await fetch('/api/users/guest', { method: 'POST' });
  const { data } = await res.json();
  return data.userId;
};

// 2. 开始游戏
const userId = await createUser();
// ... 玩游戏 ...

// 3. 游戏结束，提交记录
const submitGame = async (gameResult) => {
  await fetch('/api/game-records', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      score: gameResult.score,
      moves: gameResult.moves,
      isWon: gameResult.isWon,
      playTime: gameResult.playTime,
      maxCombo: gameResult.maxCombo,
      totalMatches: gameResult.totalMatches,
    }),
  });
};

// 4. 检查成就
const checkAchievements = async (gameResult) => {
  const res = await fetch('/api/achievements/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      gameData: gameResult,
    }),
  });
  const { data } = await res.json();
  return data.unlockedAchievements;
};

// 5. 查看排行榜
const getLeaderboard = async () => {
  const res = await fetch(`/api/leaderboard?type=ALL_TIME&limit=100&userId=${userId}`);
  const { data } = await res.json();
  return data;
};
```

---

## 注意事项

1. **游客用户**: 首次访问时应创建游客用户，将 `userId` 和 `guestToken` 保存到 localStorage
2. **错误处理**: 所有 API 调用都应包含错误处理逻辑
3. **性能**: 排行榜数据建议实现客户端缓存（5 分钟）
4. **并发**: 提交游戏记录和检查成就可以并发调用
5. **认证**: 生产环境应添加 JWT 认证机制

---

## 未来扩展

- [ ] 用户注册/登录
- [ ] JWT 认证
- [ ] 好友系统
- [ ] 每日挑战
- [ ] 游戏回放
- [ ] WebSocket 实时排行榜更新
```
