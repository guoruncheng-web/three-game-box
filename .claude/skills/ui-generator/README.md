# UI 图片生成工具

自动生成游戏 UI 所需的图标、按钮、背景等图片资源。

## 📁 文件说明

| 文件 | 说明 | 依赖 |
|------|------|------|
| `generate_ui.py` | 基础版本（使用 Pillow） | `pip install pillow` |
| `generate_ui_ffmpeg.py` | FFmpeg 版本（性能更好） | FFmpeg（系统安装） |
| `generate_svg.py` | SVG 矢量图标生成 | 无需依赖 |

## 🚀 快速开始

### 方法 1：使用 Pillow 版本

```bash
# 安装依赖
pip install pillow

# 运行脚本
python scripts/ui-generator/generate_ui.py
```

**生成内容：**
- ✅ 图标（圆形、圆角方形）
- ✅ 按钮（带渐变效果）
- ✅ 渐变背景
- ✅ 占位图

### 方法 2：使用 FFmpeg 版本（推荐）

```bash
# 安装 FFmpeg
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# 运行脚本
python scripts/ui-generator/generate_ui_ffmpeg.py
```

**生成内容：**
- ✅ 纯色背景
- ✅ 渐变背景（垂直、水平、对角线）
- ✅ 圆形图标
- ✅ 圆角矩形按钮
- ✅ 占位图
- ✅ 图片合并

### 方法 3：生成 SVG 图标

```bash
# 无需安装依赖
python scripts/ui-generator/generate_svg.py
```

**生成内容：**
- ✅ 16+ 种常用图标
- ✅ 支持自定义图标
- ✅ 矢量格式（可无限缩放）

## 💡 使用示例

### 1. 生成图标 (Pillow)

```python
from generate_ui import UIGenerator

generator = UIGenerator()

# 生成圆形图标
generator.generate_icon(
    name="icon-game",
    size=64,
    bg_color="#667eea",
    emoji="🎮",
    style="circle"
)

# 生成圆角方形图标
generator.generate_icon(
    name="icon-trophy",
    size=64,
    bg_color="#f39c12",
    emoji="🏆",
    style="rounded_square"
)
```

### 2. 生成按钮

```python
# 主按钮
generator.generate_button(
    name="btn-start",
    width=200,
    height=60,
    bg_color="#667eea",
    text="开始游戏",
    text_color="#ffffff"
)

# 次要按钮
generator.generate_button(
    name="btn-settings",
    width=200,
    height=60,
    bg_color="#4ecdc4",
    text="设置"
)
```

### 3. 生成渐变背景

```python
# 垂直渐变
generator.generate_gradient_bg(
    name="bg-purple",
    width=800,
    height=600,
    color_start="#667eea",
    color_end="#764ba2",
    direction="vertical"
)

# 对角线渐变
generator.generate_gradient_bg(
    name="bg-ocean",
    width=800,
    height=600,
    color_start="#4ecdc4",
    color_end="#556270",
    direction="diagonal"
)
```

### 4. 使用 FFmpeg 生成

```python
from generate_ui_ffmpeg import FFmpegUIGenerator

generator = FFmpegUIGenerator()

# 生成圆形图标
generator.generate_circle("icon-purple", size=64, color="#667eea")

# 生成渐变背景
generator.generate_gradient(
    "bg-purple-gradient",
    width=800,
    height=600,
    color_start="#667eea",
    color_end="#764ba2",
    direction="vertical"
)

# 生成占位图
generator.generate_placeholder(
    "placeholder-game",
    width=400,
    height=300,
    text="Game Cover"
)
```

### 5. 生成 SVG 图标

```python
from generate_svg import SVGGenerator

generator = SVGGenerator()

# 生成预设图标
generator.generate_icon("icon-heart", "heart", size=24, color="#e74c3c")
generator.generate_icon("icon-star", "star", size=24, color="#f1c40f")
generator.generate_icon("icon-play", "play", size=24, color="#27ae60")

# 生成自定义 SVG
custom_path = '<circle cx="12" cy="12" r="10" fill="#667eea"/>'
generator.generate_custom_icon("icon-custom", custom_path)
```

## 🎨 支持的图标类型（SVG）

- `heart` ❤️ 心形
- `star` ⭐ 星星
- `circle` ⭕ 圆形
- `square` ⬜ 方形
- `check` ✓ 对勾
- `close` ✕ 关闭
- `arrow-right` → 右箭头
- `arrow-left` ← 左箭头
- `arrow-up` ↑ 上箭头
- `arrow-down` ↓ 下箭头
- `play` ▶ 播放
- `pause` ⏸ 暂停
- `music` 🎵 音乐
- `home` 🏠 首页
- `user` 👤 用户
- `settings` ⚙️ 设置
- `search` 🔍 搜索
- `trophy` 🏆 奖杯
- `gift` 🎁 礼物
- `gamepad` 🎮 手柄

## 📦 输出目录

默认输出路径：`public/images/generated/`

可以通过构造函数修改：

```python
generator = UIGenerator(output_dir="custom/path")
```

## 🎯 推荐使用场景

| 工具 | 适用场景 |
|------|---------|
| **Pillow 版本** | 需要 emoji、文字的图标和按钮 |
| **FFmpeg 版本** | 需要高性能批量生成，或复杂渐变效果 |
| **SVG 版本** | 需要矢量图标，可缩放不失真 |

## 🔧 自定义扩展

### 添加新的图标样式

在 `generate_ui.py` 中的 `generate_icon` 方法添加新样式：

```python
elif style == "hexagon":
    # 绘制六边形
    points = self._calculate_hexagon_points(size)
    draw.polygon(points, fill=rgb_color)
```

### 添加新的 SVG 图标

在 `generate_svg.py` 中的 `_get_svg_template` 方法添加：

```python
elif icon_type == "new-icon":
    path = '<path d="M..."></path>'
```

## ⚠️ 注意事项

1. **Emoji 支持：** Pillow 版本的 emoji 需要系统支持 emoji 字体
2. **FFmpeg 路径：** FFmpeg 版本需要系统已安装 FFmpeg，并在 PATH 中
3. **中文字体：** 如需显示中文，需要系统安装中文字体
4. **性能：** FFmpeg 版本适合批量生成，性能更好

## 📖 更多示例

查看各脚本的 `main()` 函数了解更多用法示例。

## 🤝 贡献

欢迎提交 PR 添加新功能！

## 📝 许可

MIT License
