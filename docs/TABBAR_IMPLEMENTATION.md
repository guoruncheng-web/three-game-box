# TabBar 底部导航栏实现说明

## 当前状态

已创建基础的 TabBar 组件和页面结构，等待从 Figma 获取完整设计。

## 已完成

1. ✅ 创建 `TabBar` 组件 (`src/components/layout/TabBar.tsx`)
2. ✅ 在 `page.tsx` 中集成 TabBar
3. ✅ 创建图标目录 `public/images/tabbar/`
4. ✅ 实现基础的 tab 切换功能

## 待完成

### 1. 从 Figma 获取设计

**步骤：**
1. 在 Figma 中打开设计文件
2. 选中 tabBar 节点（底部导航栏）
3. 告诉我已选中，我会使用 Figma MCP 工具获取设计

**需要获取的内容：**
- TabBar 的完整样式（颜色、尺寸、圆角等）
- "首页" tab 的图标（激活和未激活状态）
- "我的" tab 的图标（激活和未激活状态）
- 激活状态的背景样式
- 文字样式和颜色

### 2. 导出图标

获取设计后，需要导出以下图标：
- `home.svg` - 首页图标（未激活）
- `home-active.svg` - 首页图标（激活）
- `mine.svg` - 我的图标（未激活）
- `mine-active.svg` - 我的图标（激活）

### 3. 完善样式

根据 Figma 设计调整：
- 激活状态的背景颜色和样式
- 图标大小和间距
- 文字颜色和字体
- 整体布局和间距

## 当前组件结构

### TabBar 组件

```typescript
interface TabItem {
  key: string;
  label: string;
  icon?: string;
  activeIcon?: string;
  path: string;
}
```

### 使用方式

```tsx
import { TabBar } from '@/components/layout/TabBar';

const tabs = [
  {
    key: 'home',
    label: '首页',
    icon: '/images/tabbar/home.svg',
    activeIcon: '/images/tabbar/home-active.svg',
    path: '/',
  },
  {
    key: 'mine',
    label: '我的',
    icon: '/images/tabbar/mine.svg',
    activeIcon: '/images/tabbar/mine-active.svg',
    path: '/mine',
  },
];

<TabBar tabs={tabs} />
```

## 下一步

1. **在 Figma 中选中 tabBar 节点**
2. 告诉我已选中，我会：
   - 获取完整的设计代码
   - 导出图标到 `public/images/tabbar/`
   - 根据设计完善组件样式
   - 确保完全匹配 Figma 设计

## 设计要点（根据截图描述）

- 两个 tab："首页" 和 "我的"
- 激活状态：紫色背景 (`#9810fa`)，白色图标
- 未激活状态：白色背景，灰色图标 (`#6a7282`)
- 激活状态有圆角背景效果
- 底部固定定位，带阴影
