# 水果消消乐背景生成器使用指南

## 📁 文件位置

- **HTML 生成器**: `public/generate_fruit_bg.html`
- **Python 脚本**: `.claude/skills/ui-generator/generate_fruit_match_bg.py` (需要 Pillow 库)

## 🎨 使用方法

### 方法 1: HTML 生成器（推荐）

这是最简单的方法，不需要任何依赖：

1. **启动开发服务器**:
   ```bash
   npm run dev
   ```

2. **访问生成器页面**:
   ```
   http://localhost:3000/generate_fruit_bg.html
   ```

3. **生成背景**:
   - 选择风格: fresh（清新）、sweet（甜美）、vibrant（活力）
   - 点击"生成背景"按钮
   - 点击"下载图片"保存

### 方法 2: Python 脚本

如果你的系统有 Pillow 库：

```bash
# 确保安装 Pillow
pip3 install pillow

# 运行脚本
python3 .claude/skills/ui-generator/generate_fruit_match_bg.py
```

## 🎨 可用风格

### Fresh（清新绿色系）
- 配色: 薄荷绿 → 浅黄绿
- 适合: 自然主题、清新风格
- 颜色: #a8e6cf, #dcedc1
- 特点: 舒适、放松、自然

### Sweet（甜美粉色系）
- 配色: 浅粉 → 米粉
- 适合: 梦幻主题、女性向
- 颜色: #ffd6e8, #ffe4e1
- 特点: 温柔、梦幻、甜美

### Vibrant（活力彩虹系）
- 配色: 亮黄 → 珊瑚橙
- 适合: 欢快主题、儿童向
- 颜色: #ffeaa7, #fab1a0
- 特点: 活泼、明亮、欢快

## 📐 生成规格

- **尺寸**: 800 × 1200 像素
- **格式**: PNG（支持透明度）
- **质量**: 高质量（95%）
- **特性**:
  - 垂直渐变背景
  - 装饰性圆点（30个）
  - 光晕效果（8个）
  - 微妙的纹理

## 🎯 设计特点

1. **渐变背景**
   - 从上到下自然过渡
   - 色彩柔和舒适

2. **装饰圆点**
   - 随机分布
   - 半透明效果
   - 增加层次感

3. **光晕效果**
   - 径向渐变
   - 梦幻氛围
   - 高斯模糊

4. **微妙纹理**
   - 噪点效果
   - 增加质感
   - 不影响可读性

## 💡 使用建议

### 游戏面板背景
```css
.game-board {
  background-image: url('/images/generated/fruit-match-bg-fresh.png');
  background-size: cover;
  background-position: center;
}
```

### 响应式设计
```css
.game-container {
  background-image: url('/images/generated/fruit-match-bg-fresh.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center top;
}
```

### 叠加内容
```css
.game-board {
  position: relative;
  background-image: url('/images/generated/fruit-match-bg-fresh.png');
}

.game-board::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(2px);
}
```

## 🔧 自定义修改

### 修改尺寸
编辑 HTML 文件中的 canvas 尺寸：
```javascript
<canvas id="bgCanvas" width="800" height="1200"></canvas>
```

### 修改颜色
编辑 `colorSchemes` 对象：
```javascript
const colorSchemes = {
  fresh: {
    gradient: ['#a8e6cf', '#dcedc1'],
    accents: ['#ffaaa5', '#ffd3b6', '#a8e6cf', '#dcedc1']
  }
};
```

### 调整装饰元素
修改 `drawDecorativeDots` 函数中的 dots 数组。

## 📝 注意事项

1. **文件大小**: 生成的 PNG 文件约 100-200KB
2. **性能**: HTML 生成器在浏览器中运行，速度快
3. **兼容性**: 支持所有现代浏览器
4. **移动端**: 可以在移动端浏览器中使用

## 🚀 快速开始

最快的方式：
```bash
# 1. 启动开发服务器
npm run dev

# 2. 打开浏览器访问
# http://localhost:3000/generate_fruit_bg.html

# 3. 选择风格并下载
```

## 📦 输出示例

生成的文件可以保存到：
```
public/images/generated/
├── fruit-match-bg-fresh.png
├── fruit-match-bg-sweet.png
└── fruit-match-bg-vibrant.png
```

---

**更新时间**: 2026-01-11
**版本**: v1.0.0
