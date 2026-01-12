# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 **Next.js + PWA + Three.js** 的休闲游戏盒子项目，包含多个 3D/2D 移动端小游戏。

**技术栈:**
- **前端框架:** Next.js 16 (App Router) + React 19
- **3D 引擎:** Three.js + @react-three/fiber + @react-three/drei
- **状态管理:** Redux Toolkit (react-redux)
- **UI 组件库:** antd-mobile
- **样式方案:** Tailwind CSS 4
- **PWA 支持:** next-pwa
- **类型检查:** TypeScript 5

**部署信息:**
- 域名: www.gamebox.xingzdh.com
- 服务器 IP: 47.86.46.212
- 生产环境端口: 7006
- 服务器私钥: 项目中的 `id_rsa` 文件

---

## 开发命令

### 常用命令
```bash
# 开发
npm run dev          # 启动开发服务器 (http://localhost:3000)

# 构建和生产
npm run build        # 构建生产版本
npm start            # 启动生产服务器

# 代码检查
npm run lint         # 运行 ESLint 检查
```

### Git 提交要求
提交代码前必须:
1. 检查 TypeScript 错误
2. 检查 ESLint 错误
3. 检查代码漏洞并解决
4. 使用 gh 工具创建 GitHub PR

**提交格式规范:**
- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 重构
- `perf:` 性能优化
- `test:` 测试相关
- `chore:` 构建/工具相关

---

## 架构设计

### 目录结构
```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # 根布局（包含 Redux Provider）
│   ├── page.tsx            # 首页（游戏列表）
│   ├── globals.css         # 全局样式和 CSS 变量
│   ├── games/              # 游戏页面
│   └── api/                # API 路由
│       └── games/          # 游戏数据 API
│
├── components/             # React 组件
│   ├── ui/                 # 通用 UI 组件
│   ├── layout/             # 布局组件
│   ├── three/              # Three.js 组件
│   └── providers/          # Context Providers (ReduxProvider)
│
├── games/                  # 游戏实现
│
├── hooks/                  # 自定义 Hooks
│
├── stores/                 # Redux 状态管理
│   ├── index.ts            # Store 配置
│   ├── hooks.ts            # 类型化的 Redux Hooks
│   └── gameStore.ts        # 游戏状态切片
│
├── lib/                    # 工具库
│   └── data/               # 数据相关
│       └── games.ts        # 游戏数据
│
├── types/                  # TypeScript 类型定义
│   ├── index.ts
│   └── game.ts             # 游戏相关类型
│
└── utils/                  # 工具函数
```

### Next.js App Router 约定

**服务端组件 vs 客户端组件:**
- **默认使用服务端组件** - 用于数据获取、访问后端资源
- **客户端组件** (添加 `'use client'`) - 用于:
  - React Hooks (useState, useEffect 等)
  - 浏览器 API
  - 事件监听器
  - Three.js/WebGL 渲染
  - 交互式 UI 组件

**特殊文件:**
- `layout.tsx` - 布局组件
- `page.tsx` - 页面组件
- `loading.tsx` - 加载状态
- `error.tsx` - 错误边界
- `not-found.tsx` - 404 页面
- `route.ts` - API 路由处理器

### 状态管理架构

使用 **Redux Toolkit** 管理全局状态:

```typescript
// 在组件中使用类型化的 hooks
import { useAppDispatch, useAppSelector } from '@/stores/hooks';

function Component() {
  const dispatch = useAppDispatch();
  const gameState = useAppSelector((state) => state.game);
  // ...
}
```

**注意:** 项目使用 react-redux，不是 zustand

### Three.js 集成模式

**性能优化要点:**
1. **复用几何体和材质** - 使用 `useMemo` 避免重复创建
2. **实例化渲染** - 大量相同对象使用 `<instancedMesh>`
3. **使用 useFrame** - 动画和游戏循环
4. **条件渲染和 LOD** - 根据性能调整细节级别
5. **资源清理** - 使用 `useEffect` cleanup 清理资源

**基础场景结构:**
```typescript
'use client';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

function Game3D() {
  return (
    <Canvas camera={{ position: [0, 5, 10], fov: 75 }} shadows>
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
```

---

## 代码规范

### 命名约定
- **文件名:** kebab-case 或 PascalCase (组件)
- **组件名:** PascalCase
- **函数名:** camelCase
- **常量:** UPPER_SNAKE_CASE
- **类型/接口:** PascalCase
- **Hooks:** 以 `use` 开头

### 导入顺序
1. React 相关
2. Next.js 相关
3. 第三方库
4. 内部模块 (`@/` 别名)
5. 相对路径导入
6. 类型导入 (`import type`)

### TypeScript 规范

**类型定义位置:**
- 全局类型: `src/types/`
- 组件 Props: 与组件同文件
- API 响应: `src/types/api.ts`
- 游戏相关: `src/types/game.ts`

**使用规则:**
- 使用 `interface` 定义对象结构
- 使用 `type` 定义联合类型、交叉类型、工具类型
- 避免使用 `any`，使用 `unknown` 替代
- 启用严格模式 (`tsconfig.json` 中 `"strict": true`)

### 注释规范
```typescript
/**
 * 游戏卡片组件
 * @param game - 游戏数据对象
 * @param onClick - 点击回调函数
 */
export function GameCard({ game, onClick }: GameCardProps) {
  // 实现...
}
```

---

## 样式系统

### 设计风格
休闲游戏风格，轻松、愉悦、有趣:
- **圆角优先** - 使用大圆角 (16px-32px)
- **色彩丰富** - 明亮饱和的色彩组合
- **动效活泼** - 弹跳、摇晃、缩放等趣味动画
- **反馈明确** - 点击、得分、失败等有明显视觉反馈

### 主题色板
```css
/* CSS 变量位于 src/app/globals.css */
--game-primary: #667eea;
--game-secondary: #764ba2;
--game-accent: #f093fb;

/* 糖果色系 */
--candy-pink: #ff6b9d;
--candy-orange: #ffa726;
--candy-yellow: #ffee58;
--candy-green: #66bb6a;
--candy-blue: #42a5f5;
--candy-purple: #ab47bc;
```

### Tailwind 扩展

**自定义动画 (示例):**
- `animate-bounce-in` - 弹入效果
- `animate-wiggle` - 摇晃效果
- `animate-float` - 浮动效果
- `animate-pop` - 弹出效果
- `animate-score-pop` - 得分动画
- `animate-heartbeat` - 心跳效果
- `animate-sparkle` - 闪烁效果

**自定义圆角:**
- `rounded-3xl` - 2rem
- `rounded-4xl` - 2.5rem
- `rounded-blob` - 有机形状
- `rounded-bubble` - 气泡形状

**自定义阴影:**
- `shadow-card` - 卡片阴影
- `shadow-button` - 按钮阴影
- `shadow-candy` - 糖果色阴影
- `shadow-glow` - 发光效果

### 响应式设计
移动端优先，确保触摸友好:
- 所有可点击元素最小 44x44px
- 使用 `touch-manipulation` 禁用双击缩放
- 适配安全区域 (`pt-safe-top`, `pb-safe-bottom` 等)

---

## PWA 配置

### 开发环境
PWA 在开发环境下默认禁用以避免缓存问题

### Manifest
位置: `public/manifest.json`
- App 名称: Three Game Box
- 短名称: GameBox
- 主题色: #667eea
- 显示模式: standalone

### 元数据
在 `src/app/layout.tsx` 中配置:
```typescript
export const metadata: Metadata = {
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GameBox',
  },
};
```

---

## 开发最佳实践

### 测试流程
完成每个功能后:
1. 调用相关的 MCP 工具进行测试
2. 如果没有相关工具，按照自己的逻辑走一遍测试

### 文件操作
- **不要轻易删除文件** - 要先备份再操作

### 功能完成后
需要记录:
- 相关的思路
- 功能要点
- 遇到的问题和解决方案

### 性能考虑
- 避免不必要的重渲染
- 使用 `useMemo` 和 `useCallback` 优化性能
- 图片使用 Next.js Image 组件优化
- 3D 资源使用懒加载

### 错误处理
- 使用 try-catch 处理异步操作
- 提供有意义的错误信息
- 在 UI 层面优雅地展示错误状态

---

## 功能实现记录

### 水果消消乐 - 特殊水果系统 (2026-01-12)

#### 实现背景
用户需求：为水果消消乐游戏添加特殊水果功能，包括炸弹、彩虹和西瓜三种特殊水果，每种都具有独特的消除效果。

#### 核心功能

**1. 特殊水果类型** (`page.tsx:36-52`)
- 💣 **炸弹 (Bomb)**: 消除周围3x3区域的所有水果
- 🌈 **彩虹 (Rainbow)**: 消除所有与相邻普通水果同色的水果
- 🍈 **西瓜 (Melon)**: 十字消除，清除整行和整列

**2. 生成机制** (`page.tsx:137-231`)
- **4连消**: 自动在匹配序列中间位置生成炸弹 💣
- **5连消或以上**: 自动在匹配序列中间位置生成彩虹 🌈
- 支持横向和纵向匹配检测
- 保留特殊水果生成位置的水果，其余匹配水果消除

**3. 激活机制** (`page.tsx:459-514, 660-750`)
- **被动激活**: 特殊水果包含在匹配序列中时自动激活
- **主动激活**: 玩家交换特殊水果时立即触发效果
- 支持两个特殊水果同时激活（组合效果）

#### 技术实现

**类型系统设计**
```typescript
// 普通水果类型
type NormalFruitType = '🍇' | '🍋' | '🍉' | '🍊' | '🍎' | '🍒' | '🍓';

// 特殊水果类型
type SpecialFruitType = '💣' | '🌈' | '🍈';

// 联合类型
type FruitType = NormalFruitType | SpecialFruitType;

// 匹配结果
interface MatchResult {
  cells: Set<string>;                    // 匹配的单元格
  specialFruit?: {                       // 要生成的特殊水果
    type: SpecialFruitType;
    position: { row: number; col: number };
  };
}
```

**核心函数**

1. **findMatches** - 增强的匹配检测
   - 检测横向和纵向的3+连消
   - 识别4连消和5+连消模式
   - 返回匹配单元格和特殊水果生成信息

2. **activateSpecialFruit** - 特殊水果效果激活
   - 炸弹：遍历周围3x3区域标记消除
   - 彩虹：查找相邻普通水果颜色，遍历全网格消除同色
   - 西瓜：消除整行和整列

3. **processMatches** - 匹配处理流程
   - 递归处理所有匹配直到无新匹配
   - 在移除匹配水果前检查特殊水果生成
   - 保留特殊水果生成位置，替换为特殊水果

4. **canSwap** - 交换验证
   - 允许特殊水果与任意水果交换
   - 普通水果需验证交换后有匹配才允许

5. **performSwap** - 交换执行
   - 检测交换的水果是否为特殊水果
   - 特殊水果立即激活效果并处理连锁反应
   - 普通匹配走正常流程

#### 实现流程

```
用户交换水果
    ↓
canSwap 验证
    ↓
performSwap 执行
    ↓
检测特殊水果? ─── 否 ──→ 正常匹配流程
    │                        ↓
   是                   findMatches
    ↓                        ↓
activateSpecialFruit    removeMatches
    ↓                        ↓
removeMatches           dropFruits
    ↓                        ↓
dropFruits              processMatches (递归)
    ↓                        ↓
processMatches          生成特殊水果(如果4/5连消)
    ↓
更新分数和状态
```

#### 遇到的问题和解决方案

**问题1: 特殊水果被过早消除**
- **现象**: 生成特殊水果后立即被下一轮匹配消除
- **原因**: 特殊水果生成位置未从匹配列表中移除
- **解决**: 在 `processMatches` 中从 `matchResult.cells` 删除特殊水果位置
- **代码位置**: `page.tsx:596-601`

**问题2: 特殊水果无法交换**
- **现象**: 点击特殊水果无法与普通水果交换
- **原因**: `canSwap` 只检查普通匹配逻辑
- **解决**: 在 `canSwap` 开头添加特殊水果判断，直接返回 true
- **代码位置**: `page.tsx:636-642`

**问题3: 彩虹水果无目标颜色**
- **现象**: 彩虹水果激活后无效果
- **原因**: 交换后彩虹位置周围可能没有普通水果
- **解决**: 在 `activateSpecialFruit` 中搜索3x3区域找到第一个普通水果作为目标
- **代码位置**: `page.tsx:476-500`

**问题4: 特殊水果交换后无效果**
- **现象**: 特殊水果交换后不激活效果
- **原因**: `performSwap` 只调用 `processMatches`，特殊水果需要主动激活
- **解决**: 在 `performSwap` 中检测特殊水果并立即调用 `activateSpecialFruit`
- **代码位置**: `page.tsx:691-717`

#### 性能优化

1. **Set 数据结构**: 使用 `Set<string>` 存储匹配单元格，避免重复，O(1) 查找
2. **useCallback 优化**: 所有核心函数使用 `useCallback` 缓存，避免不必要的重渲染
3. **类型判断优化**: 使用 `Object.values(SPECIAL_FRUITS).includes()` 快速判断特殊水果

#### 代码文件位置

**主要修改文件**: `/src/app/games/fruit-match/page.tsx`

- **类型定义**: Lines 36-94
- **匹配检测**: Lines 137-231 (`findMatches`)
- **特殊效果**: Lines 459-514 (`activateSpecialFruit`)
- **匹配处理**: Lines 576-628 (`processMatches`)
- **交换验证**: Lines 631-657 (`canSwap`)
- **交换执行**: Lines 660-750 (`performSwap`)

#### 测试要点

1. ✅ 4连消生成炸弹
2. ✅ 5连消生成彩虹
3. ✅ 炸弹激活清除3x3区域
4. ✅ 彩虹激活清除所有同色
5. ✅ 西瓜激活清除十字
6. ✅ 特殊水果可以交换
7. ✅ 特殊水果交换立即激活
8. ✅ 连锁反应正确处理
9. ✅ 分数正确计算

#### 未来优化方向

1. **更多特殊水果**: 可以添加其他特殊水果类型（如闪电、星星等）
2. **特殊组合效果**: 两个特殊水果交换可以产生特殊组合效果
3. **视觉效果增强**: 为特殊水果添加粒子效果和动画
4. **音效增强**: 为不同特殊水果添加独特音效
5. **西瓜生成**: 目前西瓜未自动生成，可以考虑为L型或T型匹配生成西瓜

---

## Cursor 规则集成

本项目在 `.cursor/rules/` 目录下有详细的开发规则:
- `general.mdc` - 通用开发规则
- `nextjs.mdc` - Next.js App Router 规范
- `threejs.mdc` - Three.js 使用指南
- `typescript.mdc` - TypeScript 规范
- `styling.mdc` - 样式和 UI 设计系统
- `pwa.mdc` - PWA 配置
- `git.mdc` - Git 提交规范
- `server.mdc` - 服务器信息

这些规则提供了更详细的实现指南和代码示例。

---

## 重要提醒

1. **状态管理:** 使用 react-redux，不是 zustand
2. **UI 组件:** 使用 antd-mobile
3. **Three.js:** 所有 3D 组件必须是客户端组件 (`'use client'`)
4. **路径别名:** 使用 `@/` 引用 `src/` 目录
5. **代码提交:** 必须检查 TS/ESLint 错误并创建 PR
6. **服务器私钥:** 不要在代码中暴露 `id_rsa` 内容

# 部署项目的时候不要去改动其他域名的nginx配置文件

## 编写任何文档或者指令文件要追加中文说明