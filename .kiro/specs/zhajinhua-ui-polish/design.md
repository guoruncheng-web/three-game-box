# 设计文档：炸金花 UI 精修（zhajinhua-ui-polish）

## 概述

本设计文档描述如何在不改变任何游戏逻辑的前提下，对炸金花游戏页面进行纯视觉与交互层面的精修。所有改动均限于 Tailwind CSS 类名、内联样式和组件结构调整，不涉及 API、状态管理或游戏规则。

技术栈：Next.js 15 + React 19 + Tailwind CSS v4 + antd-mobile

---

## 架构

本次精修采用**就地修改**策略，不引入新的组件层级或状态管理。改动范围：

```
src/components/zhajinhua/
├── zhajinhua-app.tsx        ← 大厅、房间、结算、Header、比牌弹层、加注面板
├── zhajinhua-table-board.tsx ← 牌桌视图（座位、奖池）
├── poker-card.tsx           ← 扑克牌正面质感升级
└── zjh-image-button.tsx     ← 操作按钮（最小高度调整）
```

不新增文件，不修改 API 层、类型定义或游戏逻辑。

---

## 组件与接口

### 1. PokerCard（`poker-card.tsx`）

**现状**：正面仅有居中的点数 + 花色符号，缺乏真实扑克牌质感。

**改动**：

```
┌─────────────────┐
│ A  ♠            │  ← 左上角：点数 + 花色（11px，竖排）
│                 │
│       ♠         │  ← 中央：大号花色（24px）
│                 │
│            ♠  A │  ← 右下角：旋转 180° 的点数 + 花色
└─────────────────┘
```

- 卡面背景：`bg-white` + 细微纸张纹理（CSS `background-image: repeating-linear-gradient`）
- 左上角：`absolute top-1 left-1.5`，点数 `text-[11px] font-black`，花色 `text-[10px]`
- 中央花色：`text-[24px]`，绝对居中
- 右下角：`absolute bottom-1 right-1.5 rotate-180`，与左上角镜像
- 红色花色：`text-red-600`；黑色花色：`text-zinc-900`
- 尺寸保持不变：`w-[52px] h-[72px] sm:w-[58px] sm:h-[80px]`

**接口不变**：`PokerCardProps { faceDown?, card?, className? }` 无需修改。

---

### 2. ZjhImageButton（`zjh-image-button.tsx`）

**改动**：将 `min-h-[48px]` 改为 `min-h-[56px]`，其余不变。

---

### 3. 大厅（Lobby）— `zhajinhua-app.tsx` 中 `phase === 'lobby'` 分支

#### 封面图区域

```tsx
// 改动：max-w-[280px] → max-w-[360px]，添加金色光晕
<div className="relative w-full max-w-[360px] mx-auto aspect-square rounded-3xl overflow-hidden
  shadow-[0_0_48px_rgba(234,179,8,0.35)] ring-2 ring-amber-400/30">
```

#### 按钮区域

三个入口按钮统一高度 `min-h-[52px]`，样式如下：

| 按钮 | 背景 | 边框 | 文字 |
|------|------|------|------|
| 人机对战 | `linear-gradient(135deg, #f59e0b, #d97706)` | 无 | `text-white font-bold` |
| 快速匹配 | `rgba(255,255,255,0.08)` | `border border-amber-400/50` | `text-amber-100 font-bold` |
| 加入（按钮） | `linear-gradient(135deg, #f59e0b, #d97706)` | 无 | `text-white font-bold` |

#### 加入房间输入框

```tsx
<div className="flex gap-2 items-center">
  <input
    className="flex-1 h-[52px] rounded-xl bg-white/8 border border-white/20
      px-4 text-white placeholder:text-white/40 text-sm focus:outline-none
      focus:border-amber-400/60"
    placeholder="输入房间号"
  />
  <button className="h-[52px] px-5 rounded-xl font-bold text-white
    bg-gradient-to-r from-amber-500 to-amber-600 active:scale-[0.97]
    transition-transform touch-manipulation">
    加入
  </button>
</div>
```

> 注意：antd-mobile 的 `<Input>` 默认白色背景难以覆盖，改用原生 `<input>` 并手动绑定 `value/onChange`，保持与现有逻辑一致。

---

### 4. 房间（Room）— `zhajinhua-app.tsx` 中 `phase === 'room'` 分支

#### 房间信息卡片

```tsx
<div className="rounded-2xl p-4 text-white backdrop-blur-sm
  bg-black/40 border border-amber-400/30">
```

#### 玩家列表卡片

```tsx
<div className="flex items-center justify-between rounded-xl px-3 py-2.5
  bg-white/8 border border-white/10 text-white">
  <div className="flex items-center gap-2">
    {/* 状态指示点 */}
    <span className={`w-2 h-2 rounded-full shrink-0 ${
      p.isReady ? 'bg-emerald-400' : 'bg-white/30'
    }`} />
    <span>{shortName(p.userId, p.username)}</span>
    {p.userId === ownerId && (
      <span className="text-amber-300 text-xs font-bold">房主</span>
    )}
  </div>
  <span className={`text-sm font-bold ${
    p.isReady ? 'text-emerald-300' : 'text-white/50'
  }`}>
    {p.isReady ? '已准备' : '未准备'}
  </span>
</div>
```

#### 按钮样式

| 按钮 | 样式 |
|------|------|
| 准备（未准备状态） | 金色渐变 `from-amber-500 to-amber-600`，`min-h-[52px]` |
| 准备（已准备状态） | `bg-transparent border border-amber-400/50 text-amber-200`，`min-h-[52px]` |
| 开始游戏 | `from-red-500 to-rose-600`，`min-h-[52px]` |
| 离开房间 | `bg-transparent border border-white/25 text-white/70`，`min-h-[44px]` |

---

### 5. 对局操作区（ActionBar）— `zhajinhua-app.tsx` 中 `phase === 'playing'` 分支

#### 加注面板

```tsx
{raiseOptionsOpen && isMyTurn && (
  <div className="rounded-2xl border border-amber-400/30 bg-black/60 backdrop-blur-md p-3 animate-slide-up">
    <p className="text-center text-sm font-bold text-amber-200 mb-2">选择加注金额</p>
    <div className="grid grid-cols-3 gap-2">
      <button className="h-[44px] rounded-xl border border-white/30 text-white text-sm font-bold
        active:scale-[0.97] transition-transform touch-manipulation">
        小 {minBet}
      </button>
      <button className="h-[44px] rounded-xl bg-gradient-to-r from-amber-500 to-amber-600
        text-white text-sm font-bold active:scale-[0.97] transition-transform touch-manipulation">
        中 {mid}
      </button>
      <button className="h-[44px] rounded-xl bg-gradient-to-r from-orange-500 to-red-500
        text-white text-sm font-bold active:scale-[0.97] transition-transform touch-manipulation">
        大 {maxBet}
      </button>
    </div>
    <p className="text-center text-[11px] text-white/55 mt-2">当前底注 {ante}，点击档位加注</p>
  </div>
)}
```

---

### 6. 比牌弹层（CompareSheet）— `zhajinhua-app.tsx`

```tsx
<div className="w-full max-w-md rounded-t-3xl p-4 pb-[max(16px,env(safe-area-inset-bottom))] text-white"
  style={{ background: 'linear-gradient(180deg, #3d2666 0%, #1a0f2e 100%)' }}>
  {/* 拖拽指示条 */}
  <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mb-4" />
  <p className="text-center font-bold text-amber-200 mb-3">选择比牌对象</p>
  {/* 玩家按钮列表 */}
  {candidates.length === 0 ? (
    <p className="text-center text-white/50 text-sm py-4">暂无可比牌对象</p>
  ) : (
    <div className="flex flex-col gap-2">
      {candidates.map(p => (
        <button key={p.userId}
          className="h-[48px] rounded-xl border border-amber-400/50 text-amber-100 font-bold
            active:scale-[0.97] transition-transform touch-manipulation">
          {shortName(p.userId, p.username)}
        </button>
      ))}
    </div>
  )}
  <button className="mt-3 w-full h-[44px] rounded-xl border border-white/20 text-white/70
    active:scale-[0.97] transition-transform touch-manipulation">
    取消
  </button>
</div>
```

---

### 7. 结算页面（Settled）— `zhajinhua-app.tsx`

```tsx
// 胜负图标逻辑
const isWinner = result.winnerId === userId;
const isDraw = !result.winnerId;
const resultIcon = isDraw ? '🤝' : isWinner ? '🏆' : '💔';

<div className={`w-full max-w-sm rounded-3xl p-6 text-white text-center space-y-3
  ${isWinner ? 'shadow-[0_0_60px_rgba(234,179,8,0.4)]' : ''}`}
  style={{
    backgroundImage: `url(${zjhAssets.victoryPopupBg})`,
    backgroundSize: 'cover',
    backgroundColor: 'rgba(0,0,0,0.45)',
  }}>
  <div className="text-4xl">{resultIcon}</div>
  <h2 className="text-xl font-black text-amber-200">本局结束</h2>
  {/* ... 胜者、奖池、玩家列表 ... */}
  {/* 返回房间按钮：金色渐变，min-h-[52px] */}
  {/* 返回大厅按钮：outline，min-h-[44px] */}
</div>
```

---

### 8. 顶部导航栏（Header）— `zhajinhua-app.tsx`

#### 筹码显示区

```tsx
<div className="rounded-full pl-2 pr-3 py-1.5 text-sm font-bold text-amber-200
  flex items-center gap-1.5 border border-amber-400/40 tabular-nums"
  style={{ background: 'rgba(0,0,0,0.40)' }}>
  <span className="relative w-5 h-5 shrink-0">
    <Image src={zjhAssets.chip1000} alt="" fill className="object-contain" unoptimized />
  </span>
  {chips}
</div>
```

---

## 数据模型

本次精修不引入新的数据模型。所有改动均为纯视觉层，复用现有的 `GameStateResponse`、`RoomInfo`、`GameResultResponse` 等类型。

---

## 正确性属性

*属性（Property）是在系统所有有效执行中都应成立的特征或行为——本质上是对系统应做什么的形式化陈述。属性是人类可读规范与机器可验证正确性保证之间的桥梁。*

### 属性 1：PokerCard 正面渲染完整性

*对于任意* 有效的 `Card` 对象（suit ∈ {spade, heart, club, diamond}，rank ∈ 有效点数集合），调用 `PokerCard` 渲染后，输出的 DOM 中应同时包含点数文本和花色符号文本。

**验证：需求 3.2、3.3、3.4**

---

### 属性 2：PokerCard 红黑花色颜色正确性

*对于任意* Card，若 suit 为 heart 或 diamond，则渲染出的花色符号元素应带有红色 CSS 类（`text-red-600`）；若 suit 为 spade 或 club，则应带有深色 CSS 类（`text-zinc-900`）。

**验证：需求 3.4**

---

### 属性 3：PokerCard 背面不渲染点数

*对于任意* `faceDown=true` 或 `card=undefined` 的 PokerCard，渲染结果中不应出现任何点数或花色符号文本（即不泄露牌面信息）。

**验证：需求 3.6**

---

### 属性 4：按钮触控响应性

*对于任意* 带有 `touch-manipulation` 属性的按钮元素，其 CSS `touch-action` 计算值应为 `manipulation`，确保移动端 300ms 延迟被消除。

**验证：需求 8.5**

---

### 属性 5：结算胜负图标一致性

*对于任意* 结算结果，若 `result.winnerId === userId` 则显示 🏆，若 `!result.winnerId` 则显示 🤝，否则显示 💔——三种情况互斥且完备。

**验证：需求 6.2**

---

### 属性 6：比牌弹层空状态处理

*对于任意* 游戏状态，当可比牌对象列表（未弃牌且非本人的玩家）为空时，比牌弹层应渲染「暂无可比牌对象」提示，而非空列表。

**验证：需求 5.4**

---

## 错误处理

本次精修为纯视觉改动，不引入新的错误路径。以下为与样式相关的降级策略：

- **图片加载失败**：`zjhAssets.victoryPopupBg` 加载失败时，结算卡片通过 `backgroundColor: 'rgba(0,0,0,0.45)'` 降级为纯色背景，不影响内容展示。
- **CSS 变量不支持**：Tailwind v4 的任意值语法（如 `shadow-[0_0_60px_rgba(234,179,8,0.4)]`）在极老旧浏览器上可能不生效，降级为无光晕效果，不影响功能。
- **antd-mobile Input 样式覆盖**：加入房间输入框改用原生 `<input>`，避免 antd-mobile 默认白色背景难以覆盖的问题。

---

## 测试策略

### 单元测试

针对以下具体行为编写示例测试：

- `PokerCard` 正面渲染：给定 `{ suit: 'heart', rank: 'A' }`，验证输出包含 `♥` 和 `A`
- `PokerCard` 背面渲染：给定 `faceDown=true`，验证输出不包含花色符号
- 结算图标选择函数：给定 `(winnerId, userId)` 的三种组合，验证返回正确 emoji
- 比牌候选人过滤：给定包含已弃牌玩家的列表，验证过滤后不包含弃牌玩家

### 属性测试

使用 **fast-check**（TypeScript 的属性测试库）对上述属性进行验证，每个属性测试运行不少于 **100 次**迭代。

**属性测试配置**：

```typescript
import fc from 'fast-check';

// 属性 1 & 2：PokerCard 渲染完整性与颜色正确性
// Feature: zhajinhua-ui-polish, Property 1 & 2: PokerCard face rendering completeness and color correctness
fc.assert(
  fc.property(
    fc.record({
      suit: fc.constantFrom('spade', 'heart', 'club', 'diamond'),
      rank: fc.constantFrom('A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'),
    }),
    (card) => {
      const { container } = render(<PokerCard card={card as Card} />);
      // 验证点数和花色都存在
      expect(container.textContent).toContain(card.rank);
      const suitChar = SUIT_CHAR[card.suit as Card['suit']];
      expect(container.textContent).toContain(suitChar);
      // 验证颜色类
      const isRed = card.suit === 'heart' || card.suit === 'diamond';
      const colorClass = isRed ? 'text-red-600' : 'text-zinc-900';
      expect(container.querySelector(`.${colorClass}`)).toBeTruthy();
    }
  ),
  { numRuns: 100 }
);

// 属性 3：背面不泄露牌面
// Feature: zhajinhua-ui-polish, Property 3: Face-down card does not reveal card info
fc.assert(
  fc.property(
    fc.record({
      suit: fc.constantFrom('spade', 'heart', 'club', 'diamond'),
      rank: fc.constantFrom('A', '2', '3', 'K'),
    }),
    (card) => {
      const { container } = render(<PokerCard faceDown card={card as Card} />);
      expect(container.textContent).not.toContain(card.rank);
    }
  ),
  { numRuns: 100 }
);

// 属性 5：结算胜负图标一致性
// Feature: zhajinhua-ui-polish, Property 5: Settlement result icon consistency
fc.assert(
  fc.property(
    fc.option(fc.string({ minLength: 1 }), { nil: null }),  // winnerId
    fc.string({ minLength: 1 }),                             // userId
    (winnerId, userId) => {
      const icon = getResultIcon(winnerId, userId);
      if (!winnerId) expect(icon).toBe('🤝');
      else if (winnerId === userId) expect(icon).toBe('🏆');
      else expect(icon).toBe('💔');
    }
  ),
  { numRuns: 100 }
);
```

**单元测试**（使用 Vitest + @testing-library/react）：

```typescript
// 比牌候选人过滤（属性 6）
it('比牌弹层：弃牌玩家不出现在候选列表', () => {
  const players = [
    { userId: 'u1', status: 'FOLDED', username: '玩家1' },
    { userId: 'u2', status: 'ACTIVE', username: '玩家2' },
  ];
  const candidates = players.filter(
    p => p.userId !== 'me' && p.status !== 'FOLDED' && p.status !== 'OUT'
  );
  expect(candidates).toHaveLength(1);
  expect(candidates[0].userId).toBe('u2');
});
```

**测试文件位置**：`src/components/zhajinhua/__tests__/`
