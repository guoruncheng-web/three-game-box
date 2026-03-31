# 炸金花（Zhajinhua）游戏需求文档

> 文档版本：v1.0
> 创建日期：2026-03-30
> 项目：Three Game Box（休闲游戏盒子）

---

## 一、功能概述

### 1.1 游戏简介

炸金花（又称三张牌、赢三张）是一种流行的中国民间扑克牌游戏。每位玩家发 3 张牌，通过下注、比牌决定胜负。游戏核心在于对牌型大小的判断、下注策略以及心理博弈。

本项目实现的是 **多人在线对战** 版本，支持 2-6 人同桌，玩家通过房间系统进行匹配和游戏。

### 1.2 目标用户和使用场景

- **目标用户：** 休闲游戏玩家，喜欢扑克牌和策略博弈类游戏的用户
- **使用场景：** 移动端 PWA 应用，碎片时间娱乐，支持好友开房和快速匹配
- **筹码体系：** 使用虚拟筹码（金币），不涉及真实货币交易

---

## 二、核心规则

### 2.1 基本规则

- 使用一副标准扑克牌（去除大小王），共 52 张
- 每局 2-6 名玩家参与
- 每人发 3 张牌，牌面朝下
- 玩家可以选择「看牌」或「不看牌（闷牌）」进行下注
- 最终通过比牌决定胜负，牌型大者获胜

### 2.2 牌型大小（从大到小）

| 排名 | 牌型 | 英文标识 | 说明 | 示例 |
|------|------|---------|------|------|
| 1 | 豹子（三条） | `TRIPLE` | 三张点数相同的牌 | AAA、KKK |
| 2 | 顺金（同花顺） | `STRAIGHT_FLUSH` | 花色相同的连续三张牌 | 黑桃 J-Q-K |
| 3 | 金花（同花） | `FLUSH` | 花色相同但不连续 | 红心 3-7-K |
| 4 | 顺子（连牌） | `STRAIGHT` | 点数连续但花色不同 | 5-6-7 |
| 5 | 对子 | `PAIR` | 两张点数相同 + 一张单牌 | AA3、KK5 |
| 6 | 散牌（高牌） | `HIGH_CARD` | 不构成以上任何牌型 | 3-7-K 不同花色 |

### 2.3 牌型内部比较规则

- **豹子：** 比较点数大小。A > K > Q > ... > 3 > 2
- **顺金/顺子：** 比较最大牌点数。特殊顺序：A-2-3 是最小的顺子，Q-K-A 是最大的顺子。注意 K-A-2 不算顺子
- **金花：** 先比最大牌，再比第二大牌，最后比最小牌
- **对子：** 先比对子的点数，对子相同再比单牌
- **散牌：** 依次比较最大牌、第二大牌、最小牌
- **花色比较：** 当所有点数都相同时，按花色比较。花色大小：黑桃 > 红心 > 梅花 > 方块

### 2.4 特殊规则

- **235 通杀豹子：** 散牌 2-3-5（且不同花色）可以胜过任何豹子。这是唯一的特殊规则
- **235 仅克制豹子：** 235 散牌对阵其他非豹子牌型时，按散牌规则正常比较

### 2.5 点数大小

A > K > Q > J > 10 > 9 > 8 > 7 > 6 > 5 > 4 > 3 > 2

> 注意：A 在顺子/顺金中可作为最大牌（Q-K-A）或最小牌（A-2-3），但不能出现在中间（如 K-A-2 无效）。

### 2.6 下注规则

#### 下注模式

- **闷牌（未看牌）：** 玩家未查看自己的牌，下注金额为当前底注的 1 倍或 2 倍
- **看牌（已看牌）：** 玩家已查看自己的牌，下注金额为当前底注的 2 倍或 4 倍（即闷牌的 2 倍）

#### 可执行操作

| 操作 | 英文标识 | 说明 |
|------|---------|------|
| 看牌 | `LOOK` | 查看自己的 3 张牌，之后按「看牌」标准下注 |
| 跟注 | `CALL` | 跟上当前底注（闷牌 1x / 看牌 2x） |
| 加注 | `RAISE` | 提高底注金额（在允许的范围内） |
| 全押 | `ALL_IN` | 押上所有剩余筹码 |
| 比牌 | `COMPARE` | 主动与指定玩家比牌（需付 2 倍当前底注，看牌状态） |
| 弃牌 | `FOLD` | 放弃本局，损失已下注筹码 |

#### 下注限制

- **最低底注：** 由房间配置决定（如 10、50、100）
- **最大加注倍数：** 当前底注的 1-4 倍（可由房间配置）
- **比牌条件：** 只有已看牌的玩家才能主动发起比牌
- **闷牌比牌：** 闷牌玩家不能主动发起比牌，但可以被其他看牌玩家选择比牌
- **强制比牌：** 当桌上只剩 2 名玩家时，可强制比牌
- **封顶轮次：** 可配置最大下注轮次（如 20 轮），达到上限后强制全员比牌

---

## 三、游戏流程

### 3.1 完整一局流程

```
1. 等待阶段 (WAITING)
   └─ 玩家加入房间，等待满足最低人数（2人）

2. 准备阶段 (READY)
   └─ 所有玩家点击准备，房间创建者（或系统）发起开始

3. 发牌阶段 (DEALING)
   ├─ 所有玩家扣除底注（ante）
   ├─ 系统洗牌并给每位玩家发 3 张牌（牌面朝下）
   └─ 确定首个行动玩家（庄家下一位，或随机）

4. 下注阶段 (BETTING)
   ├─ 从首个行动玩家开始，按顺时针轮流操作
   ├─ 每个玩家可执行：看牌 / 跟注 / 加注 / 全押 / 比牌 / 弃牌
   ├─ 弃牌的玩家退出本局
   ├─ 比牌失败的玩家退出本局
   ├─ 当只剩 1 名玩家时，该玩家获胜
   └─ 达到封顶轮次时，强制比牌

5. 比牌/结算阶段 (SHOWDOWN)
   ├─ 所有存活玩家亮牌
   ├─ 比较牌型大小
   ├─ 最大牌型的玩家获得奖池所有筹码
   └─ 平局时按花色比较（或平分奖池）

6. 结算阶段 (SETTLEMENT)
   ├─ 筹码结算并发放到玩家账户
   ├─ 记录游戏对局数据
   ├─ 更新玩家战绩统计
   └─ 返回等待/准备阶段，开始下一局
```

### 3.2 状态机设计

#### 房间状态（RoomStatus）

```
WAITING ──→ PLAYING ──→ WAITING
   │                        ↑
   └──→ CLOSED              │
         ↑                  │
         └──────────────────┘
```

| 状态 | 说明 |
|------|------|
| `WAITING` | 等待玩家加入或准备 |
| `PLAYING` | 游戏进行中 |
| `CLOSED` | 房间已关闭 |

#### 游戏状态（GameStatus）

```
DEALING ──→ BETTING ──→ SHOWDOWN ──→ SETTLEMENT ──→ (结束)
                │              ↑
                └──────────────┘ (只剩1人时直接结算)
```

| 状态 | 说明 |
|------|------|
| `DEALING` | 发牌中 |
| `BETTING` | 下注进行中 |
| `SHOWDOWN` | 亮牌比牌 |
| `SETTLEMENT` | 结算中 |

#### 玩家状态（PlayerStatus）

| 状态 | 说明 |
|------|------|
| `WAITING` | 等待中（未准备） |
| `READY` | 已准备 |
| `PLAYING` | 游戏中（未看牌） |
| `LOOKED` | 已看牌 |
| `FOLDED` | 已弃牌 |
| `ALL_IN` | 已全押 |
| `OUT` | 已出局（比牌失败） |

---

## 四、功能模块

### 4.1 房间系统

#### 创建房间
- 玩家设置房间参数（底注、最大人数、封顶轮次等）
- 生成唯一房间号（6 位数字）
- 创建者自动成为房主

#### 加入房间
- 通过房间号加入
- 验证房间状态（是否可加入）和玩家筹码（是否满足最低要求）

#### 快速匹配
- 系统根据玩家筹码量匹配合适的房间
- 如无合适房间，自动创建新房间

#### 离开房间
- 等待阶段可自由离开
- 游戏进行中离开视为弃牌
- 房主离开自动转移房主权限

### 4.2 游戏逻辑

#### 发牌
- 服务端洗牌算法（Fisher-Yates 洗牌）
- 每个玩家发 3 张牌，牌数据存储在服务端
- 客户端只有在玩家「看牌」后才能获取自己的牌面信息

#### 下注轮次
- 服务端维护当前行动玩家和操作超时
- 操作超时（如 30 秒）自动弃牌
- 每次操作后检查游戏是否结束

#### 比牌逻辑
- 服务端计算牌型和大小
- 比牌结果实时通知双方
- 失败方标记为出局

#### 结算
- 计算奖池总额
- 分配筹码给获胜玩家
- 记录对局详情

### 4.3 玩家系统

#### 筹码管理
- 玩家注册时获得初始筹码（如 10000）
- 每日登录赠送筹码
- 筹码不足时提示（不实现充值）

#### 战绩记录
- 总局数、胜局数、胜率
- 最大单局赢取筹码
- 各牌型出现次数统计

---

## 五、数据库设计建议

### 5.1 新增枚举类型

```prisma
// 房间状态
enum ZjhRoomStatus {
  WAITING   // 等待中
  PLAYING   // 游戏中
  CLOSED    // 已关闭
}

// 游戏状态
enum ZjhGameStatus {
  DEALING     // 发牌中
  BETTING     // 下注中
  SHOWDOWN    // 亮牌比牌
  SETTLEMENT  // 结算中
}

// 玩家游戏内状态
enum ZjhPlayerStatus {
  WAITING   // 等待中
  READY     // 已准备
  PLAYING   // 游戏中（未看牌）
  LOOKED    // 已看牌
  FOLDED    // 已弃牌
  ALL_IN    // 已全押
  OUT       // 已出局
}

// 操作类型
enum ZjhActionType {
  LOOK      // 看牌
  CALL      // 跟注
  RAISE     // 加注
  ALL_IN    // 全押
  COMPARE   // 比牌
  FOLD      // 弃牌
}

// 牌型
enum ZjhHandType {
  TRIPLE          // 豹子
  STRAIGHT_FLUSH  // 顺金
  FLUSH           // 金花
  STRAIGHT        // 顺子
  PAIR            // 对子
  HIGH_CARD       // 散牌
}
```

### 5.2 炸金花房间表（ZjhRoom）

存储房间的基本信息和配置。

```prisma
model ZjhRoom {
  id            String        @id @default(uuid())
  roomCode      String        @unique          // 6 位房间号
  ownerId       String                         // 房主用户 ID
  status        ZjhRoomStatus @default(WAITING)

  // 房间配置
  minPlayers    Int           @default(2)      // 最少玩家数
  maxPlayers    Int           @default(6)      // 最多玩家数
  baseAnte      Int           @default(10)     // 底注
  maxRounds     Int           @default(20)     // 封顶轮次
  turnTimeout   Int           @default(30)     // 操作超时（秒）
  minChips      Int           @default(100)    // 最低入场筹码

  currentPlayers Int          @default(0)      // 当前玩家数

  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  closedAt      DateTime?

  // 关系
  owner         User          @relation("ZjhRoomOwner", fields: [ownerId], references: [id])
  players       ZjhRoomPlayer[]
  games         ZjhGame[]

  @@index([roomCode])
  @@index([status])
  @@index([ownerId])
}
```

### 5.3 房间玩家表（ZjhRoomPlayer）

记录房间内玩家信息。

```prisma
model ZjhRoomPlayer {
  id          String    @id @default(uuid())
  roomId      String
  userId      String
  seatIndex   Int                              // 座位号 (0-5)
  chips       Int                              // 当前筹码
  isReady     Boolean   @default(false)
  isOnline    Boolean   @default(true)

  joinedAt    DateTime  @default(now())
  leftAt      DateTime?

  // 关系
  room        ZjhRoom   @relation(fields: [roomId], references: [id], onDelete: Cascade)
  user        User      @relation("ZjhRoomPlayers", fields: [userId], references: [id])

  @@unique([roomId, userId])
  @@unique([roomId, seatIndex])
  @@index([userId])
}
```

### 5.4 游戏对局表（ZjhGame）

每局游戏的记录。

```prisma
model ZjhGame {
  id            String        @id @default(uuid())
  roomId        String
  gameIndex     Int                            // 第几局
  status        ZjhGameStatus @default(DEALING)

  // 牌局数据
  deck          Json                           // 洗好的牌组（加密存储）
  pot           Int           @default(0)      // 当前奖池
  currentAnte   Int                            // 当前底注
  currentRound  Int           @default(0)      // 当前轮次
  currentTurn   String?                        // 当前行动玩家 ID
  dealerIndex   Int           @default(0)      // 庄家座位号

  winnerId      String?                        // 获胜者 ID
  winnerHand    ZjhHandType?                   // 获胜牌型

  startedAt     DateTime      @default(now())
  endedAt       DateTime?

  // 关系
  room          ZjhRoom       @relation(fields: [roomId], references: [id], onDelete: Cascade)
  players       ZjhGamePlayer[]
  actions       ZjhGameAction[]

  @@index([roomId])
  @@index([status])
}
```

### 5.5 对局玩家表（ZjhGamePlayer）

每局游戏中每个玩家的状态和手牌。

```prisma
model ZjhGamePlayer {
  id            String          @id @default(uuid())
  gameId        String
  userId        String
  seatIndex     Int                              // 座位号
  status        ZjhPlayerStatus @default(PLAYING)

  // 手牌（JSON: [{suit: "spade", rank: "A"}, ...]）
  hand          Json                             // 玩家手牌（服务端加密）
  handType      ZjhHandType?                     // 牌型（比牌后填入）
  handRank      Int?                             // 牌型排名值（用于快速比较）

  hasLooked     Boolean         @default(false)  // 是否已看牌
  totalBet      Int             @default(0)      // 本局总下注
  chipsBeforeGame Int                            // 本局开始前筹码
  chipsChange   Int             @default(0)      // 本局筹码变化
  isWinner      Boolean         @default(false)

  // 关系
  game          ZjhGame         @relation(fields: [gameId], references: [id], onDelete: Cascade)

  @@unique([gameId, userId])
  @@unique([gameId, seatIndex])
  @@index([userId])
}
```

### 5.6 下注记录表（ZjhGameAction）

记录每一步操作。

```prisma
model ZjhGameAction {
  id          String        @id @default(uuid())
  gameId      String
  userId      String
  round       Int                              // 第几轮
  actionOrder Int                              // 本轮第几次操作

  actionType  ZjhActionType                    // 操作类型
  amount      Int           @default(0)        // 下注金额

  // 比牌相关
  targetUserId String?                         // 比牌目标（仅 COMPARE 类型）
  compareResult Boolean?                       // 比牌结果（true = 发起者赢）

  createdAt   DateTime      @default(now())

  // 关系
  game        ZjhGame       @relation(fields: [gameId], references: [id], onDelete: Cascade)

  @@index([gameId])
  @@index([gameId, round])
}
```

### 5.7 玩家炸金花战绩表（ZjhPlayerStats）

玩家的炸金花专属统计数据。

```prisma
model ZjhPlayerStats {
  id              String  @id @default(uuid())
  userId          String  @unique

  totalGames      Int     @default(0)          // 总局数
  totalWins       Int     @default(0)          // 胜局数
  totalChipsWon   Int     @default(0)          // 总赢取筹码
  totalChipsLost  Int     @default(0)          // 总损失筹码
  maxSingleWin    Int     @default(0)          // 单局最大赢取
  currentChips    Int     @default(10000)      // 当前筹码余额

  // 牌型统计
  tripleCount          Int @default(0)         // 豹子次数
  straightFlushCount   Int @default(0)         // 顺金次数
  flushCount           Int @default(0)         // 金花次数
  straightCount        Int @default(0)         // 顺子次数
  pairCount            Int @default(0)         // 对子次数
  highCardCount        Int @default(0)         // 散牌次数

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // 关系
  user            User     @relation("ZjhStats", fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([totalWins(sort: Desc)])
}
```

### 5.8 User 表新增关系

需要在现有 `User` 模型中添加以下关系字段：

```prisma
// 在 User 模型中追加
ownedZjhRooms    ZjhRoom[]       @relation("ZjhRoomOwner")
zjhRoomPlayers   ZjhRoomPlayer[] @relation("ZjhRoomPlayers")
zjhStats         ZjhPlayerStats? @relation("ZjhStats")
```

---

## 六、API 接口设计

所有接口统一前缀：`/api/zjh`

响应格式统一：

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### 6.1 房间相关接口

#### 6.1.1 创建房间

- **URL:** `POST /api/zjh/rooms`
- **描述:** 创建一个新的炸金花房间

**请求参数：**

```json
{
  "userId": "string",          // 必填，创建者用户 ID
  "maxPlayers": 6,             // 可选，最大玩家数，默认 6
  "baseAnte": 10,              // 可选，底注，默认 10
  "maxRounds": 20,             // 可选，封顶轮次，默认 20
  "turnTimeout": 30,           // 可选，操作超时秒数，默认 30
  "minChips": 100              // 可选，最低入场筹码，默认 100
}
```

**成功响应：**

```json
{
  "success": true,
  "data": {
    "roomId": "uuid",
    "roomCode": "123456",
    "ownerId": "string",
    "status": "WAITING",
    "maxPlayers": 6,
    "baseAnte": 10,
    "maxRounds": 20,
    "currentPlayers": 1
  }
}
```

---

#### 6.1.2 加入房间

- **URL:** `POST /api/zjh/rooms/join`
- **描述:** 通过房间号加入房间

**请求参数：**

```json
{
  "userId": "string",          // 必填
  "roomCode": "123456"         // 必填，6 位房间号
}
```

**成功响应：**

```json
{
  "success": true,
  "data": {
    "roomId": "uuid",
    "seatIndex": 1,
    "players": [
      {
        "userId": "string",
        "username": "string",
        "avatar": "string",
        "seatIndex": 0,
        "chips": 10000,
        "isReady": true
      }
    ]
  }
}
```

**错误场景：**

| 状态码 | error | 说明 |
|--------|-------|------|
| 404 | 房间不存在 | 房间号无效 |
| 400 | 房间已满 | 人数已达上限 |
| 400 | 房间游戏中 | 无法中途加入 |
| 400 | 筹码不足 | 低于最低入场要求 |
| 400 | 已在房间中 | 重复加入 |

---

#### 6.1.3 离开房间

- **URL:** `POST /api/zjh/rooms/leave`
- **描述:** 离开当前房间

**请求参数：**

```json
{
  "userId": "string",
  "roomId": "string"
}
```

**成功响应：**

```json
{
  "success": true,
  "data": {
    "message": "已离开房间",
    "newOwnerId": "string | null"   // 如果房主离开，新房主 ID
  }
}
```

---

#### 6.1.4 获取房间信息

- **URL:** `GET /api/zjh/rooms/:roomId`
- **描述:** 获取房间详细信息

**成功响应：**

```json
{
  "success": true,
  "data": {
    "roomId": "uuid",
    "roomCode": "123456",
    "ownerId": "string",
    "status": "WAITING",
    "maxPlayers": 6,
    "baseAnte": 10,
    "maxRounds": 20,
    "turnTimeout": 30,
    "currentPlayers": 3,
    "players": [
      {
        "userId": "string",
        "username": "string",
        "avatar": "string",
        "seatIndex": 0,
        "chips": 10000,
        "isReady": true,
        "isOnline": true
      }
    ]
  }
}
```

---

#### 6.1.5 快速匹配

- **URL:** `POST /api/zjh/rooms/match`
- **描述:** 快速匹配一个合适的房间

**请求参数：**

```json
{
  "userId": "string"
}
```

**成功响应：**

```json
{
  "success": true,
  "data": {
    "roomId": "uuid",
    "roomCode": "123456",
    "isNewRoom": false,       // 是否是新创建的房间
    "seatIndex": 2
  }
}
```

---

#### 6.1.6 玩家准备

- **URL:** `POST /api/zjh/rooms/ready`
- **描述:** 玩家切换准备状态

**请求参数：**

```json
{
  "userId": "string",
  "roomId": "string",
  "isReady": true
}
```

**成功响应：**

```json
{
  "success": true,
  "data": {
    "isReady": true,
    "allReady": false          // 是否所有人都已准备
  }
}
```

---

### 6.2 游戏进行接口

#### 6.2.1 开始游戏

- **URL:** `POST /api/zjh/games/start`
- **描述:** 房主发起开始游戏（需所有玩家已准备且满足最低人数）

**请求参数：**

```json
{
  "userId": "string",          // 必须是房主
  "roomId": "string"
}
```

**成功响应：**

```json
{
  "success": true,
  "data": {
    "gameId": "uuid",
    "gameIndex": 1,
    "dealerIndex": 0,
    "currentTurn": "userId",
    "pot": 60,                 // 底注 * 人数
    "currentAnte": 10,
    "players": [
      {
        "userId": "string",
        "seatIndex": 0,
        "status": "PLAYING",
        "chips": 9990,
        "hasLooked": false
      }
    ]
  }
}
```

---

#### 6.2.2 看牌

- **URL:** `POST /api/zjh/games/look`
- **描述:** 查看自己的手牌

**请求参数：**

```json
{
  "userId": "string",
  "gameId": "string"
}
```

**成功响应：**

```json
{
  "success": true,
  "data": {
    "hand": [
      { "suit": "spade", "rank": "A" },
      { "suit": "spade", "rank": "K" },
      { "suit": "spade", "rank": "Q" }
    ],
    "handType": "STRAIGHT_FLUSH",
    "handTypeDisplay": "顺金"
  }
}
```

---

#### 6.2.3 玩家操作（下注/加注/跟注/全押/弃牌）

- **URL:** `POST /api/zjh/games/action`
- **描述:** 执行游戏操作

**请求参数：**

```json
{
  "userId": "string",
  "gameId": "string",
  "actionType": "CALL | RAISE | ALL_IN | FOLD",
  "amount": 20                 // RAISE 时必填
}
```

**成功响应：**

```json
{
  "success": true,
  "data": {
    "actionType": "CALL",
    "amount": 20,
    "pot": 200,
    "currentAnte": 10,
    "currentTurn": "nextUserId",
    "round": 2,
    "playerStatus": "LOOKED",
    "remainingChips": 9800,
    "gameOver": false          // 是否只剩一人
  }
}
```

**错误场景：**

| 状态码 | error | 说明 |
|--------|-------|------|
| 400 | 不是你的回合 | 非当前行动玩家 |
| 400 | 筹码不足 | 余额不够下注 |
| 400 | 无效操作 | 状态不允许该操作 |
| 400 | 加注金额无效 | 不在允许范围内 |

---

#### 6.2.4 比牌

- **URL:** `POST /api/zjh/games/compare`
- **描述:** 与指定玩家比牌

**请求参数：**

```json
{
  "userId": "string",          // 发起者（必须已看牌）
  "gameId": "string",
  "targetUserId": "string"     // 比牌目标
}
```

**成功响应：**

```json
{
  "success": true,
  "data": {
    "initiator": {
      "userId": "string",
      "hand": [
        { "suit": "spade", "rank": "A" },
        { "suit": "heart", "rank": "A" },
        { "suit": "club", "rank": "K" }
      ],
      "handType": "PAIR",
      "handTypeDisplay": "对子"
    },
    "target": {
      "userId": "string",
      "hand": [
        { "suit": "diamond", "rank": "J" },
        { "suit": "heart", "rank": "10" },
        { "suit": "club", "rank": "9" }
      ],
      "handType": "STRAIGHT",
      "handTypeDisplay": "顺子"
    },
    "winnerId": "string",
    "loserId": "string",
    "cost": 20,                 // 比牌花费
    "pot": 220,
    "currentTurn": "nextUserId",
    "gameOver": false
  }
}
```

---

#### 6.2.5 获取游戏状态

- **URL:** `GET /api/zjh/games/:gameId`
- **描述:** 获取当前对局的完整状态

**查询参数：**
- `userId` - 当前查询的用户 ID（用于控制是否返回手牌信息）

**成功响应：**

```json
{
  "success": true,
  "data": {
    "gameId": "uuid",
    "roomId": "uuid",
    "status": "BETTING",
    "pot": 200,
    "currentAnte": 10,
    "currentRound": 3,
    "currentTurn": "userId",
    "dealerIndex": 0,
    "maxRounds": 20,
    "players": [
      {
        "userId": "string",
        "username": "string",
        "avatar": "string",
        "seatIndex": 0,
        "status": "LOOKED",
        "hasLooked": true,
        "totalBet": 30,
        "hand": null,            // 非本人且未亮牌时为 null
        "handType": null
      },
      {
        "userId": "currentUserId",
        "seatIndex": 1,
        "status": "LOOKED",
        "hasLooked": true,
        "totalBet": 40,
        "hand": [                // 本人已看牌时返回
          { "suit": "spade", "rank": "A" },
          { "suit": "heart", "rank": "K" },
          { "suit": "club", "rank": "Q" }
        ],
        "handType": "HIGH_CARD"
      }
    ],
    "recentActions": [
      {
        "userId": "string",
        "actionType": "CALL",
        "amount": 20,
        "round": 3,
        "createdAt": "2026-03-30T10:00:00Z"
      }
    ]
  }
}
```

---

#### 6.2.6 获取对局结果

- **URL:** `GET /api/zjh/games/:gameId/result`
- **描述:** 获取已结束对局的完整结果

**成功响应：**

```json
{
  "success": true,
  "data": {
    "gameId": "uuid",
    "winnerId": "string",
    "winnerHand": "STRAIGHT_FLUSH",
    "pot": 500,
    "players": [
      {
        "userId": "string",
        "username": "string",
        "hand": [
          { "suit": "spade", "rank": "J" },
          { "suit": "spade", "rank": "Q" },
          { "suit": "spade", "rank": "K" }
        ],
        "handType": "STRAIGHT_FLUSH",
        "handTypeDisplay": "顺金",
        "totalBet": 120,
        "chipsChange": 380,
        "isWinner": true,
        "status": "LOOKED"
      },
      {
        "userId": "string",
        "username": "string",
        "hand": [
          { "suit": "heart", "rank": "5" },
          { "suit": "club", "rank": "5" },
          { "suit": "diamond", "rank": "9" }
        ],
        "handType": "PAIR",
        "handTypeDisplay": "对子",
        "totalBet": 80,
        "chipsChange": -80,
        "isWinner": false,
        "status": "FOLDED"
      }
    ],
    "totalRounds": 8,
    "duration": 180
  }
}
```

---

### 6.3 玩家数据接口

#### 6.3.1 获取玩家战绩

- **URL:** `GET /api/zjh/stats/:userId`
- **描述:** 获取玩家的炸金花战绩统计

**成功响应：**

```json
{
  "success": true,
  "data": {
    "userId": "string",
    "currentChips": 15000,
    "totalGames": 100,
    "totalWins": 45,
    "winRate": 0.45,
    "totalChipsWon": 50000,
    "totalChipsLost": 35000,
    "netProfit": 15000,
    "maxSingleWin": 5000,
    "handStats": {
      "triple": 2,
      "straightFlush": 5,
      "flush": 12,
      "straight": 15,
      "pair": 30,
      "highCard": 36
    }
  }
}
```

---

#### 6.3.2 获取对局历史

- **URL:** `GET /api/zjh/stats/:userId/history`
- **描述:** 获取玩家的对局历史记录

**查询参数：**
- `limit` - 每页条数，默认 10
- `offset` - 偏移量，默认 0

**成功响应：**

```json
{
  "success": true,
  "data": {
    "records": [
      {
        "gameId": "uuid",
        "roomCode": "123456",
        "handType": "FLUSH",
        "handTypeDisplay": "金花",
        "chipsChange": 200,
        "isWinner": true,
        "totalPlayers": 4,
        "createdAt": "2026-03-30T10:00:00Z"
      }
    ],
    "total": 100,
    "limit": 10,
    "offset": 0
  }
}
```

---

#### 6.3.3 每日筹码领取

- **URL:** `POST /api/zjh/stats/daily-bonus`
- **描述:** 领取每日登录赠送筹码

**请求参数：**

```json
{
  "userId": "string"
}
```

**成功响应：**

```json
{
  "success": true,
  "data": {
    "bonusAmount": 1000,
    "currentChips": 11000,
    "nextBonusAt": "2026-03-31T00:00:00Z"
  }
}
```

**错误场景：**

| 状态码 | error | 说明 |
|--------|-------|------|
| 400 | 今日已领取 | 每日只能领取一次 |

---

### 6.4 接口汇总表

| 方法 | URL | 描述 |
|------|-----|------|
| `POST` | `/api/zjh/rooms` | 创建房间 |
| `POST` | `/api/zjh/rooms/join` | 加入房间 |
| `POST` | `/api/zjh/rooms/leave` | 离开房间 |
| `GET` | `/api/zjh/rooms/:roomId` | 获取房间信息 |
| `POST` | `/api/zjh/rooms/match` | 快速匹配 |
| `POST` | `/api/zjh/rooms/ready` | 玩家准备 |
| `POST` | `/api/zjh/games/start` | 开始游戏 |
| `POST` | `/api/zjh/games/look` | 看牌 |
| `POST` | `/api/zjh/games/action` | 玩家操作 |
| `POST` | `/api/zjh/games/compare` | 比牌 |
| `GET` | `/api/zjh/games/:gameId` | 获取游戏状态 |
| `GET` | `/api/zjh/games/:gameId/result` | 获取对局结果 |
| `GET` | `/api/zjh/stats/:userId` | 获取玩家战绩 |
| `GET` | `/api/zjh/stats/:userId/history` | 获取对局历史 |
| `POST` | `/api/zjh/stats/daily-bonus` | 每日筹码领取 |

---

## 七、涉及文件

### 7.1 需要新增的文件

```
prisma/
└── schema.prisma                                # 修改：新增炸金花相关表和枚举

src/
├── app/
│   ├── api/
│   │   └── zjh/                                 # 新增：炸金花 API 路由
│   │       ├── rooms/
│   │       │   ├── route.ts                     # POST 创建房间
│   │       │   ├── join/route.ts                # POST 加入房间
│   │       │   ├── leave/route.ts               # POST 离开房间
│   │       │   ├── match/route.ts               # POST 快速匹配
│   │       │   ├── ready/route.ts               # POST 玩家准备
│   │       │   └── [roomId]/route.ts            # GET 房间信息
│   │       ├── games/
│   │       │   ├── start/route.ts               # POST 开始游戏
│   │       │   ├── look/route.ts                # POST 看牌
│   │       │   ├── action/route.ts              # POST 玩家操作
│   │       │   ├── compare/route.ts             # POST 比牌
│   │       │   └── [gameId]/
│   │       │       ├── route.ts                 # GET 游戏状态
│   │       │       └── result/route.ts          # GET 对局结果
│   │       └── stats/
│   │           ├── daily-bonus/route.ts         # POST 每日领取
│   │           └── [userId]/
│   │               ├── route.ts                 # GET 玩家战绩
│   │               └── history/route.ts         # GET 对局历史
│   │
│   └── games/
│       └── zhajinhua/                           # 新增：炸金花前端页面（后续开发）
│           └── page.tsx
│
├── lib/
│   └── zjh/                                     # 新增：炸金花核心逻辑
│       ├── constants.ts                         # 常量定义（牌型、花色等）
│       ├── deck.ts                              # 牌组管理（洗牌、发牌）
│       ├── hand-evaluator.ts                    # 牌型判定和比较
│       ├── game-engine.ts                       # 游戏引擎（状态管理、流程控制）
│       └── room-manager.ts                      # 房间管理逻辑
│
├── types/
│   └── zjh.ts                                   # 新增：炸金花类型定义
│
└── lib/data/
    └── games.ts                                 # 修改：新增炸金花游戏数据
```

### 7.2 需要修改的文件

| 文件 | 修改内容 |
|------|----------|
| `prisma/schema.prisma` | 新增炸金花相关的 6 个表和 6 个枚举 |
| `src/lib/data/games.ts` | 在 `presetGames` 数组中添加炸金花游戏条目 |
| `src/types/game.ts` | `GameCategory` 中添加 `'card'` 分类 |

---

## 八、验收标准

### 8.1 房间系统

- [ ] 能够成功创建房间，生成唯一 6 位房间号
- [ ] 能够通过房间号加入房间，正确分配座位
- [ ] 房间满员或游戏中时，拒绝新玩家加入并返回明确错误
- [ ] 玩家筹码不足时，拒绝加入并返回明确错误
- [ ] 玩家可以正常离开房间，房主离开后自动转移
- [ ] 所有玩家离开后，房间自动关闭
- [ ] 快速匹配能找到合适房间或自动创建新房间
- [ ] 玩家准备状态切换正确

### 8.2 游戏流程

- [ ] 所有玩家准备后，房主能成功开始游戏
- [ ] 发牌后每位玩家获得 3 张牌，牌组不重复
- [ ] 未看牌的玩家无法通过接口获取牌面信息
- [ ] 看牌后正确返回手牌和牌型
- [ ] 下注金额根据看牌/未看牌状态正确计算
- [ ] 操作回合正确轮转，非当前玩家无法操作
- [ ] 弃牌后玩家正确退出本局
- [ ] 只剩一人时自动结算，该玩家获胜
- [ ] 达到封顶轮次时触发强制比牌

### 8.3 比牌逻辑

- [ ] 六种牌型判定全部正确（豹子、顺金、金花、顺子、对子、散牌）
- [ ] 同牌型内部比较规则正确
- [ ] A-2-3 顺子为最小顺子，Q-K-A 为最大顺子
- [ ] K-A-2 不被判定为顺子
- [ ] 235 散牌通杀豹子规则正确
- [ ] 235 对阵非豹子牌型时按散牌规则比较
- [ ] 花色比较规则正确（黑桃 > 红心 > 梅花 > 方块）
- [ ] 已看牌玩家才能主动发起比牌
- [ ] 比牌扣费正确（2 倍底注）

### 8.4 结算与数据

- [ ] 获胜玩家正确获得奖池筹码
- [ ] 对局结果正确记录到数据库
- [ ] 玩家战绩统计正确更新（胜局、筹码变化、牌型统计）
- [ ] 对局历史可以正确查询和分页
- [ ] 每日筹码领取功能正常，每天限领一次

### 8.5 异常处理

- [ ] 所有接口参数校验完整，缺少必填字段返回 400
- [ ] 不存在的房间/游戏返回 404
- [ ] 权限不足（非房主开始游戏等）返回 403
- [ ] 服务端异常返回 500 并记录日志
- [ ] 并发操作不会导致数据不一致（如同时下注）

---

> **文档说明：** 本文档为炸金花游戏的后端需求文档，前端页面（Three.js 3D 渲染、动画效果、UI 交互等）将在后续需求中单独定义。当前阶段聚焦于数据库设计和 RESTful API 接口实现。
