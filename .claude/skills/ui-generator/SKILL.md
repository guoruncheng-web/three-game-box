---
name: ui-generator
description: 自动生成游戏 UI 所需的图标、按钮、背景等图片资源。当用户需要生成 SVG/PNG 图标、按钮、背景或占位图时使用此技能。支持 17+ 种预设图标类型、自定义颜色和尺寸。
---

# UI 图片生成器 Skill

## 技能描述

自动生成游戏 UI 所需的图标、按钮、背景等图片资源。

## 技能类型

工具脚本（Python）

## 文件位置

- **技能目录：** `.claude/skills/ui-generator/`
- **输出目录：** `public/images/generated/`

## 可用工具

### 1. SVG 图标生成器

**脚本：** `.claude/skills/ui-generator/generate_svg.py`

**功能：**
- 生成矢量 SVG 图标
- 17+ 种预设图标类型
- 支持自定义颜色和尺寸
- 无需额外依赖

**使用：**
```bash
python3 .claude/skills/ui-generator/generate_svg.py
```

**API：**
```python
from generate_svg import SVGGenerator

gen = SVGGenerator(output_dir="public/images/generated")
gen.generate_icon("icon-name", "heart", size=24, color="#e74c3c")
```

### 2. Pillow 位图生成器

**脚本：** `.claude/skills/ui-generator/generate_ui.py`

**功能：**
- 生成 PNG 图标（支持 emoji）
- 生成带文字的按钮
- 生成渐变背景
- 生成占位图

**依赖：**
```bash
pip install pillow
```

**使用：**
```bash
python3 .claude/skills/ui-generator/generate_ui.py
```

### 3. FFmpeg 高性能生成器

**脚本：** `.claude/skills/ui-generator/generate_ui_ffmpeg.py`

**功能：**
- 高性能批量生成
- 复杂渐变效果
- 图片合并
- 纯色/渐变背景

**依赖：**
```bash
brew install ffmpeg  # macOS
```

**使用：**
```bash
python3 .claude/skills/ui-generator/generate_ui_ffmpeg.py
```

## 支持的图标类型

| 图标 | 类型 | 颜色建议 |
|------|------|----------|
| `heart` | ❤️ | `#e74c3c` |
| `star` | ⭐ | `#f1c40f` |
| `play` | ▶ | `#27ae60` |
| `pause` | ⏸ | `#f39c12` |
| `home` | 🏠 | `#667eea` |
| `settings` | ⚙️ | `#95a5a6` |
| `trophy` | 🏆 | `#f1c40f` |
| `gamepad` | 🎮 | `#667eea` |
| `check` | ✓ | `#27ae60` |
| `close` | ✕ | `#e74c3c` |

完整列表见：`.claude/skills/ui-generator/README.md`

## 项目色板

### 主色调（CLAUDE.md）

```python
"#667eea"  # 主紫色
"#764ba2"  # 深紫色
"#f093fb"  # 亮紫色
```

### 糖果色系

```python
"#ff6b9d"  # 粉色
"#ffa726"  # 橙色
"#ffee58"  # 黄色
"#66bb6a"  # 绿色
"#42a5f5"  # 蓝色
"#ab47bc"  # 紫色
```

## 常见任务

### 任务 1：为新游戏生成图标

```bash
# 使用 SVG 生成器
python3 .claude/skills/ui-generator/generate_svg.py
```

### 任务 2：生成自定义图标

```python
from generate_svg import SVGGenerator

gen = SVGGenerator(output_dir="public/images/my-game")
gen.generate_icon("life", "heart", size=48, color="#e74c3c")
gen.generate_icon("coin", "circle", size=48, color="#f1c40f")
gen.generate_icon("level", "trophy", size=48, color="#667eea")
```

### 任务 3：批量生成游戏按钮

```python
from generate_ui import UIGenerator

gen = UIGenerator()

buttons = [
    ("btn-start", "开始游戏", "#667eea"),
    ("btn-pause", "暂停", "#f39c12"),
    ("btn-restart", "重新开始", "#e74c3c"),
]

for name, text, color in buttons:
    gen.generate_button(name, 200, 60, color, text)
```

## 输出示例

运行脚本后，图片生成到：

```
public/images/generated/
├── icon-heart.svg
├── icon-star.svg
├── icon-play.svg
├── btn-primary.png
├── bg-purple-gradient.png
└── placeholder-400x300.png
```

## 生成的图片最后都要转换为png
## 生成的图片要符合游戏主题

## 文档

- **完整文档：** `.claude/skills/ui-generator/README.md`
- **快速开始：** `.claude/skills/ui-generator/QUICKSTART.md`

## 更新日期

2026-01-11

## 版本

v1.0.0
