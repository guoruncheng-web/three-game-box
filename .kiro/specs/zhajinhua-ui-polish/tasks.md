# 实施计划：炸金花 UI 精修（zhajinhua-ui-polish）

## 概述

将炸金花游戏页面升级为高端赌场风格的移动端界面。所有改动均为纯视觉层，不涉及游戏逻辑。按组件粒度拆分，每步可独立验证。

## 任务

- [x] 1. 升级 PokerCard 正面样式
  - 修改 `src/components/zhajinhua/poker-card.tsx`
  - 在正面卡片中添加左上角（点数+花色，`text-[11px]`）和右下角（旋转 180°）的角落标注
  - 在卡面中央添加大号花色符号（`text-[24px]`）
  - 通过 CSS `repeating-linear-gradient` 添加细微纸张纹理背景
  - 保持卡片尺寸不变（`w-[52px] h-[72px] sm:w-[58px] sm:h-[80px]`）
  - 背面样式（`faceDown=true`）保持不变
  - _需求：3.1、3.2、3.3、3.4、3.5、3.6_

  - [x] 1.1 为 PokerCard 编写属性测试
    - **属性 1：PokerCard 正面渲染完整性**
    - **验证：需求 3.2、3.3**
    - 使用 fast-check 生成随机 Card（suit × rank 全组合），验证渲染后 DOM 包含点数文本和花色符号
    - **属性 2：PokerCard 红黑花色颜色正确性**
    - **验证：需求 3.4**
    - 对任意 Card，验证 heart/diamond 使用 `text-red-600`，spade/club 使用 `text-zinc-900`
    - **属性 3：PokerCard 背面不渲染点数**
    - **验证：需求 3.6**
    - 对任意 `faceDown=true` 的 PokerCard，验证 DOM 不包含点数或花色符号文本
    - 测试文件：`src/components/zhajinhua/__tests__/poker-card.test.tsx`
    - 每个属性运行不少于 100 次迭代
    - _需求：3.2、3.3、3.4、3.6_

- [x] 2. 精修大厅（Lobby）页面
  - 修改 `src/components/zhajinhua/zhajinhua-app.tsx` 中 `phase === 'lobby'` 分支
  - 封面图容器：`max-w-[280px]` → `max-w-[360px]`，添加 `shadow-[0_0_48px_rgba(234,179,8,0.35)]`
  - 「人机对战」按钮：改为金色渐变背景（`from-amber-500 to-amber-600`），`min-h-[52px]`，移除 antd-mobile `color="primary"` 的绿色覆盖
  - 「快速匹配」按钮：改为半透明深色背景（`bg-white/8`）+ 金色边框（`border-amber-400/50`），`min-h-[52px]`
  - 「加入房间」输入框：将 antd-mobile `<Input>` 替换为原生 `<input>`，样式 `bg-white/8 border border-white/20 rounded-xl h-[52px] px-4 text-white placeholder:text-white/40`
  - 「加入」按钮：金色渐变，`h-[52px] px-5 rounded-xl`
  - 按钮间距统一为 `gap-3`，内容区底部 padding 不少于 `pb-28`
  - 所有按钮添加 `active:scale-[0.97] transition-transform touch-manipulation`
  - _需求：1.1、1.2、1.3、1.4、1.5、1.6、1.7、8.2、8.5_

- [x] 3. 精修房间（Room）页面
  - 修改 `src/components/zhajinhua/zhajinhua-app.tsx` 中 `phase === 'room'` 分支
  - 房间信息卡片：添加 `border border-amber-400/30 backdrop-blur-sm`，背景改为 `bg-black/40`
  - 玩家列表卡片：添加 `border border-white/10`，在名称左侧添加状态指示点（已准备 `bg-emerald-400`，未准备 `bg-white/30`），房主添加 `text-amber-300 text-xs font-bold` 标签
  - 「准备」按钮（未准备）：金色渐变，`min-h-[52px]`
  - 「准备」按钮（已准备）：`bg-transparent border border-amber-400/50 text-amber-200`，`min-h-[52px]`
  - 「开始游戏」按钮：`from-red-500 to-rose-600` 渐变，`min-h-[52px]`，禁用时显示「人数不足」提示
  - 「离开房间」按钮：`border border-white/25 text-white/70`，`min-h-[44px]`
  - _需求：2.1、2.2、2.3、2.4、2.5、2.6、2.7_

- [x] 4. 精修对局操作区（ActionBar）与弹出面板
  - 修改 `src/components/zhajinhua/zhajinhua-app.tsx` 中 `phase === 'playing'` 的操作区部分
  - 修改 `src/components/zhajinhua/zjh-image-button.tsx`：`min-h-[48px]` → `min-h-[56px]`
  - 加注面板：替换现有 `grid grid-cols-3` 为带样式的容器（`rounded-2xl border border-amber-400/30 bg-black/60 backdrop-blur-md p-3`）
  - 加注面板顶部添加「选择加注金额」标题（`text-amber-200 text-sm font-bold`）
  - 三个金额按钮：小（`border border-white/30 text-white h-[44px]`）、中（金色渐变 `h-[44px]`）、大（橙红渐变 `h-[44px]`）
  - 加注面板添加 `animate-slide-up` 动画
  - _需求：4.1、4.2、4.3、4.4、4.5、4.6_

- [x] 5. 精修比牌弹层（CompareSheet）
  - 修改 `src/components/zhajinhua/zhajinhua-app.tsx` 中 `compareOpen` 弹层部分
  - 弹层容器：`rounded-t-3xl`，背景改为 `linear-gradient(180deg, #3d2666 0%, #1a0f2e 100%)`
  - 顶部添加拖拽指示条：`<div className="w-10 h-1 bg-white/30 rounded-full mx-auto mb-4" />`
  - 标题改为 `text-amber-200 font-bold`
  - 玩家按钮：`h-[48px] rounded-xl border border-amber-400/50 text-amber-100 font-bold active:scale-[0.97] touch-manipulation`
  - 空状态：当候选列表为空时显示「暂无可比牌对象」（`text-white/50 text-sm py-4 text-center`）
  - 「取消」按钮：`h-[44px] rounded-xl border border-white/20 text-white/70`
  - _需求：5.1、5.2、5.3、5.4、5.5_

  - [x] 5.1 为比牌弹层编写单元测试
    - 验证空状态：候选列表为空时渲染「暂无可比牌对象」（属性 6）
    - 验证过滤逻辑：已弃牌（FOLDED）和已出局（OUT）玩家不出现在候选列表
    - 测试文件：`src/components/zhajinhua/__tests__/compare-sheet.test.tsx`
    - _需求：5.4_

- [x] 6. 精修结算（Settled）页面
  - 修改 `src/components/zhajinhua/zhajinhua-app.tsx` 中 `phase === 'settled'` 分支
  - 提取 `getResultIcon(winnerId: string | null, userId: string): string` 纯函数，返回 🏆/💔/🤝
  - 在结算卡片标题上方添加胜负图标（`text-4xl`）
  - 当前用户为胜利者时，卡片添加 `shadow-[0_0_60px_rgba(234,179,8,0.4)]`
  - 玩家筹码变化：`isWinner` 使用 `text-emerald-300`，非胜利者使用 `text-red-400`
  - 「返回房间」按钮：金色渐变，`min-h-[52px]`
  - 「返回大厅」按钮：`border border-white/25 text-white/70`，`min-h-[44px]`
  - _需求：6.1、6.2、6.3、6.4、6.5、6.6_

  - [x] 6.1 为结算图标逻辑编写属性测试
    - **属性 5：结算胜负图标一致性**
    - **验证：需求 6.2**
    - 使用 fast-check 生成随机 `(winnerId: string | null, userId: string)` 组合
    - 验证三种情况互斥且完备：winnerId===userId → 🏆，!winnerId → 🤝，其他 → 💔
    - 测试文件：`src/components/zhajinhua/__tests__/settled.test.ts`
    - 运行不少于 100 次迭代
    - _需求：6.2_

- [x] 7. 精修顶部导航栏（Header）
  - 修改 `src/components/zhajinhua/zhajinhua-app.tsx` 中 `<header>` 部分
  - 筹码显示区：添加 `border border-amber-400/40 tabular-nums`，背景保持 `rgba(0,0,0,0.40)`
  - 筹码图标尺寸：从 `w-7 h-7` 缩小为 `w-5 h-5`（与精修后的紧凑布局匹配）
  - 「玩法说明」按钮：边框改为 `border-amber-400/50`，确保 `active:scale-95 touch-manipulation`
  - 返回按钮：保持现有样式不变
  - _需求：7.1、7.2、7.3、7.4、7.5_

- [x] 8. 检查点 — 确保所有测试通过
  - 确保所有测试通过，如有问题请告知。

## 备注

- 标有 `*` 的子任务为可选项，可跳过以优先完成核心视觉改动（当前所有测试均为必须执行）
- 每个任务均引用具体需求编号，便于追溯
- 所有改动均为纯视觉层，不涉及游戏逻辑或 API
- 属性测试使用 fast-check，单元测试使用 Vitest + @testing-library/react
