# 需求文档：炸金花 UI 精修（zhajinhua-ui-polish）

## 简介

本需求文档描述对炸金花游戏页面（`/games/zhajinhua`）进行视觉与交互层面的全面精修。目标是在不改变任何游戏逻辑的前提下，将现有界面升级为具有高端赌场氛围的移动端游戏体验：深色主题、金色强调、流畅动画、清晰视觉层次。

## 词汇表

- **大厅（Lobby）**：游戏入口页面，包含封面图、三个入口按钮
- **房间（Room）**：等待区，显示玩家列表与准备状态
- **对局（Playing）**：牌桌视图，包含环形座位、奖池、操作按钮
- **结算（Settled）**：本局结束后的结果展示页面
- **PokerCard**：单张扑克牌组件，支持正面（显示点数花色）和背面（牌背图）
- **ZjhImageButton**：使用 PNG 图片资源的操作按钮组件
- **操作区（ActionBar）**：对局底部固定的操作按钮区域（看牌、跟注、加注、弃牌、全押、比牌）
- **加注面板（RaisePanel）**：加注时弹出的金额选择面板
- **比牌弹层（CompareSheet）**：选择比牌对象的底部弹层
- **筹码显示区（ChipDisplay）**：顶部导航栏中显示当前筹码数量的区域
- **Header**：顶部导航栏，包含返回按钮、游戏 Logo、玩法说明按钮、筹码显示区

---

## 需求

### 需求 1：大厅页面视觉优化

**用户故事：** 作为玩家，我希望大厅页面具有高端赌场氛围，以便在进入游戏前就感受到沉浸式体验。

#### 验收标准

1. THE 大厅页面 SHALL 将游戏封面图展示区域的最大宽度从 `max-w-[280px]` 扩大至 `max-w-[360px]`，并保持 `aspect-square` 比例
2. THE 大厅页面 SHALL 为封面图容器添加金色光晕效果（`shadow` 使用 `rgba(234,179,8,0.35)` 色调）
3. THE 大厅页面 SHALL 将「人机对战」按钮样式统一为金色渐变主色调（从 `#f59e0b` 到 `#d97706`），高度不低于 52px
4. THE 大厅页面 SHALL 将「快速匹配」按钮样式改为半透明深色背景（`rgba(255,255,255,0.08)`）配金色边框（`rgba(234,179,8,0.5)`），高度不低于 52px
5. THE 大厅页面 SHALL 将「加入房间」的 Input + Button 组合替换为统一风格的深色输入框（`bg-white/8 border border-white/20`）配金色「加入」按钮
6. THE 大厅页面 SHALL 在三个入口按钮之间添加不少于 12px 的间距，整体内容区域底部 padding 不少于 112px
7. WHEN 玩家点击任意入口按钮时，THE 大厅页面 SHALL 在按钮上显示加载状态（spinner 或 loading 动画）直到跳转完成

### 需求 2：房间页面视觉优化

**用户故事：** 作为玩家，我希望房间等待页面清晰展示房间信息和玩家状态，以便我能快速了解当前局面。

#### 验收标准

1. THE 房间信息卡片 SHALL 使用金色渐变边框（`border border-amber-400/30`）和半透明深色背景（`bg-black/40 backdrop-blur-sm`）
2. THE 玩家列表卡片 SHALL 为已准备玩家显示绿色状态指示点（`bg-emerald-400` 圆点），未准备玩家显示灰色指示点（`bg-white/30`）
3. THE 玩家列表卡片 SHALL 为房主玩家添加金色「房主」标签（`text-amber-300 text-xs`）
4. THE 房间页面 SHALL 将「准备」按钮样式改为金色渐变（已准备状态改为 outline 样式），高度不低于 52px
5. THE 房间页面 SHALL 将「开始游戏」按钮样式改为红色渐变（`from-red-500 to-rose-600`），高度不低于 52px
6. THE 房间页面 SHALL 将「离开房间」按钮样式改为半透明白色 outline，高度不低于 44px
7. WHEN 房间内玩家数量未达到最低开局人数时，THE 开始游戏按钮 SHALL 显示为禁用状态并附带提示文案「人数不足」

### 需求 3：扑克牌组件（PokerCard）视觉升级

**用户故事：** 作为玩家，我希望扑克牌具有真实质感，以便获得更沉浸的游戏体验。

#### 验收标准

1. THE PokerCard 正面 SHALL 在白色卡面基础上添加细微纸张纹理效果（通过 CSS `background-image` 实现，不依赖外部图片）
2. THE PokerCard 正面 SHALL 在左上角和右下角（旋转 180°）各显示点数与花色符号，字号不小于 11px
3. THE PokerCard 正面 SHALL 在卡面中央显示大号花色符号，字号不小于 20px
4. THE PokerCard 正面 SHALL 为红色花色（红心♥、方块♦）使用 `text-red-600`，黑色花色（黑桃♠、梅花♣）使用 `text-zinc-900`
5. THE PokerCard SHALL 为卡片添加细微阴影（`shadow-md`）和圆角（`rounded-lg`），整体尺寸保持与现有代码一致（52×72px / 58×80px）
6. WHEN PokerCard 处于背面状态时，THE PokerCard SHALL 继续使用 `zjhAssets.cardBack` 图片资源，不改变背面样式

### 需求 4：对局操作区（ActionBar）优化

**用户故事：** 作为玩家，我希望对局底部操作区域在小屏幕上也能清晰易用，以便快速做出决策。

#### 验收标准

1. THE 操作区 SHALL 在 2×2 网格布局中，每个 ZjhImageButton 的最小高度不低于 56px
2. THE 操作区 SHALL 在屏幕宽度小于 375px 时，将按钮网格间距缩小至 6px（默认 8px）
3. THE 加注面板 SHALL 使用半透明深色背景（`bg-black/60 backdrop-blur-md`）和金色边框（`border border-amber-400/30`），圆角不小于 16px
4. THE 加注面板 SHALL 将三个金额按钮（小/中/大）的高度统一为不低于 44px，并分别使用不同颜色区分（小：白色 outline，中：金色，大：橙红色）
5. THE 加注面板 SHALL 在面板顶部显示「选择加注金额」标题文字（`text-amber-200 text-sm font-bold`）
6. WHEN 加注面板展开时，THE 操作区 SHALL 通过 `animate-slide-up` 动画从底部滑入

### 需求 5：比牌弹层（CompareSheet）优化

**用户故事：** 作为玩家，我希望比牌弹层清晰展示可选对象，以便快速选择目标。

#### 验收标准

1. THE 比牌弹层 SHALL 使用深紫色渐变背景（`from-[#3d2666] to-[#1a0f2e]`）和顶部圆角（`rounded-t-3xl`）
2. THE 比牌弹层 SHALL 在顶部显示拖拽指示条（`w-10 h-1 bg-white/30 rounded-full mx-auto`）
3. THE 比牌弹层 SHALL 为每个可选玩家显示金色 outline 按钮，高度不低于 48px，并在按钮内显示玩家名称
4. THE 比牌弹层 SHALL 在玩家列表为空时显示「暂无可比牌对象」提示文字
5. THE 比牌弹层 SHALL 在底部显示「取消」按钮，使用半透明白色样式

### 需求 6：结算页面视觉优化

**用户故事：** 作为玩家，我希望结算页面具有庆祝感，以便清晰感知本局结果。

#### 验收标准

1. THE 结算卡片 SHALL 使用 `zjhAssets.victoryPopupBg` 作为背景图，并叠加半透明深色遮罩（`bg-black/45`）
2. THE 结算卡片 SHALL 在标题「本局结束」上方显示胜负图标：胜利时显示 🏆，失败时显示 💔，平局时显示 🤝
3. THE 结算卡片 SHALL 为胜利玩家的筹码变化显示绿色文字（`text-emerald-300`），失败玩家显示红色文字（`text-red-400`）
4. THE 结算卡片 SHALL 将「返回房间」按钮样式改为金色渐变，高度不低于 52px
5. THE 结算卡片 SHALL 将「返回大厅」按钮样式改为半透明 outline，高度不低于 44px
6. WHEN 当前用户为本局胜利者时，THE 结算页面 SHALL 在卡片周围显示金色光晕效果（`shadow-[0_0_60px_rgba(234,179,8,0.4)]`）

### 需求 7：顶部导航栏（Header）精修

**用户故事：** 作为玩家，我希望顶部导航栏精致美观，以便在游戏过程中随时查看筹码信息。

#### 验收标准

1. THE 筹码显示区 SHALL 使用金色渐变边框（`border border-amber-400/40`）和半透明深色背景（`bg-black/40`）
2. THE 筹码显示区 SHALL 在筹码数字左侧显示筹码图标（`zjhAssets.chip1000`），图标尺寸为 20×20px
3. THE 筹码显示区 SHALL 使用 `tabular-nums` 字体特性确保数字宽度稳定，避免布局抖动
4. THE 玩法说明按钮 SHALL 使用金色边框（`border-amber-400/50`）和半透明背景，在 active 状态下缩放至 0.95
5. THE 返回按钮 SHALL 保持现有的 `w-11 h-11 rounded-2xl bg-white/10` 样式，不做改动

### 需求 8：通用动画与过渡效果

**用户故事：** 作为玩家，我希望页面切换和元素出现时有流畅的动画，以便获得更好的游戏体验。

#### 验收标准

1. WHEN 页面从大厅切换到房间或对局时，THE 页面 SHALL 通过 CSS opacity 过渡（duration 200ms）实现淡入效果
2. THE 大厅入口按钮 SHALL 在 active 状态下缩放至 0.97（`active:scale-[0.97]`），过渡时长 150ms
3. THE 房间玩家列表卡片 SHALL 在 mount 时通过 `animate-fade-in-up` 动画依次出现，每张卡片延迟 50ms
4. WHEN 结算卡片出现时，THE 结算卡片 SHALL 通过 `animate-zjh-dealer-pop-in`（已有动画）或等效的 scale+opacity 动画从中心弹出
5. THE 所有可点击按钮 SHALL 在 `touch-manipulation` 属性下确保移动端 300ms 点击延迟被消除
