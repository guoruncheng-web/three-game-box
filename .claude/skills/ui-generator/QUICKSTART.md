# UI 图片生成工具 - 快速开始

## 🚀 一键生成

### 1. 生成 SVG 图标（推荐，无需依赖）

```bash

python3 .claude/skills/ui-generator/generate_svg.py
```

**输出：** 17 个常用 SVG 图标到 `public/images/generated/`

---

### 2. 生成位图（PNG）- Pillow 版本

```bash
# 安装依赖
pip3 install pillow

# 运行
python3 .claude/skills/ui-generator/generate_ui.py
```

**输出：**
- 图标（PNG，带 emoji）
- 按钮（PNG，带文字）
- 渐变背景
- 占位图

---

### 3. 生成位图（PNG）- FFmpeg 版本

```bash
# 检查 FFmpeg（macOS 通常已安装）
ffmpeg -version

# 如果未安装
brew install ffmpeg  # macOS
# sudo apt-get install ffmpeg  # Ubuntu

# 运行
python3 .claude/skills/ui-generator/generate_ui_ffmpeg.py
```

**输出：**
- 纯色背景
- 渐变背景
- 圆形图标
- 圆角矩形按钮

---

## 💡 自定义生成

### 快速脚本

创建 `my_icons.py`：

```python
#!/usr/bin/env python3
import sys
sys.path.append('scripts/ui-generator')

from generate_svg import SVGGenerator

# 初始化
gen = SVGGenerator(output_dir="public/images/my-icons")

# 生成游戏图标
gen.generate_icon("game-start", "play", size=32, color="#667eea")
gen.generate_icon("game-pause", "pause", size=32, color="#f39c12")
gen.generate_icon("game-home", "home", size=32, color="#3498db")

print("✅ Done!")
```

运行：
```bash
python3 my_icons.py
```

---

## 📋 常用图标列表

| 图标 | 类型 | 用途 |
|------|------|------|
| `play` | ▶ | 开始游戏 |
| `pause` | ⏸ | 暂停 |
| `home` | 🏠 | 返回首页 |
| `settings` | ⚙️ | 设置 |
| `trophy` | 🏆 | 成就/排行榜 |
| `star` | ⭐ | 收藏/评分 |
| `heart` | ❤️ | 喜欢/生命值 |
| `check` | ✓ | 确认 |
| `close` | ✕ | 关闭 |
| `arrow-right` | → | 下一步 |
| `arrow-left` | ← | 返回 |

---

## 🎨 颜色参考

### 游戏色板（CLAUDE.md）

```python
# 主色
"#667eea"  # 主紫色
"#764ba2"  # 深紫色
"#f093fb"  # 亮紫色

# 糖果色
"#ff6b9d"  # 粉色
"#ffa726"  # 橙色
"#ffee58"  # 黄色
"#66bb6a"  # 绿色
"#42a5f5"  # 蓝色
"#ab47bc"  # 紫色
```

---

## 🔥 实战示例

### 示例 1：生成游戏按钮

```python
from generate_ui import UIGenerator

gen = UIGenerator()

# 开始游戏按钮
gen.generate_button(
    "btn-start-game",
    width=240,
    height=72,
    bg_color="#667eea",
    text="开始游戏",
    text_color="#ffffff"
)

# 设置按钮
gen.generate_button(
    "btn-settings",
    width=200,
    height=60,
    bg_color="#4ecdc4",
    text="设置"
)
```

### 示例 2：批量生成游戏图标

```python
from generate_svg import SVGGenerator

gen = SVGGenerator(output_dir="public/images/game-icons")

icons = {
    "life": ("heart", "#e74c3c"),
    "coin": ("circle", "#f1c40f"),
    "score": ("star", "#ffa726"),
    "level": ("trophy", "#667eea"),
    "time": ("circle", "#3498db"),
}

for name, (icon_type, color) in icons.items():
    gen.generate_icon(f"icon-{name}", icon_type, size=48, color=color)

print(f"✅ Generated {len(icons)} icons!")
```

### 示例 3：生成游戏背景

```python
from generate_ui_ffmpeg import FFmpegUIGenerator

gen = FFmpegUIGenerator()

# 主菜单背景
gen.generate_gradient(
    "bg-main-menu",
    width=1920,
    height=1080,
    color_start="#667eea",
    color_end="#764ba2",
    direction="diagonal"
)

# 游戏结束背景
gen.generate_gradient(
    "bg-game-over",
    width=1920,
    height=1080,
    color_start="#e74c3c",
    color_end="#c0392b",
    direction="vertical"
)
```

---

## ✅ 测试生成结果

```bash
# 查看生成的文件
ls -lh public/images/generated/

# 在浏览器中预览 SVG
open public/images/generated/icon-heart.svg  # macOS
```

---

## 🆘 故障排除

### 问题 1：找不到 ffmpeg
```bash
# macOS 安装
brew install ffmpeg

# 验证
ffmpeg -version
```

### 问题 2：Emoji 不显示
Pillow 版本的 emoji 需要系统字体支持。如果不显示，会自动使用简单图形替代。

### 问题 3：中文不显示
确保系统安装了中文字体（如 PingFang SC）。

---

## 📖 完整文档

查看 [README.md](README.md) 了解完整 API 文档。

---

## 🎯 下一步

1. ✅ 运行 `generate_svg.py` 生成基础图标
2. 📝 根据需要修改颜色和尺寸
3. 🎨 在项目中使用生成的图标
4. 🚀 扩展脚本添加自定义图标

祝你玩得开心！🎮
