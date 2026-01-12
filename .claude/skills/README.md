# Claude 技能库

这个目录包含 Claude 可以使用的技能和工具。

## 📁 目录结构

```
.claude/skills/
├── README.md                # 本文件 - 技能库总览
├── ui-generator/            # UI 图片生成器技能
│   └── skill.md            # 技能说明文档
└── frontend-design/         # 前端设计技能（待开发）
```

## 🎯 可用技能列表

| 技能名称 | 功能描述 | 状态 | 位置 |
|---------|---------|------|------|
| **UI 图片生成器** | 自动生成游戏 UI 所需的图标、按钮、背景等图片资源 | ✅ 可用 | `.claude/skills/ui-generator/` |
| **前端设计工具** | 前端设计相关辅助工具 | 🚧 规划中 | `.claude/skills/frontend-design/` |

## 📖 什么是技能（Skill）？

技能是 Claude 可以调用的工具或能力，通常包括三部分：

1. **可执行脚本** - 实际的程序文件（Python、Shell 等）
2. **技能描述** - 记录工具的功能、用法、API（本目录中的 `skill.md`）
3. **使用文档** - 详细的使用说明、示例代码

## 🏗️ 目录组织原则

### 统一管理

所有技能相关的文件（脚本、文档、配置）都统一放在 **`.claude/skills/`** 目录下：

- **技能描述** - `skill.md` 文件
- **可执行脚本** - Python、Shell 等脚本文件
- **使用文档** - README、快速开始指南等

### 示例：UI 生成器

```
.claude/skills/ui-generator/
├── skill.md                 # 技能说明（Claude 读取）
├── generate_svg.py          # SVG 图标生成脚本
├── generate_ui.py           # PNG 图片生成脚本
├── generate_ui_ffmpeg.py    # FFmpeg 版本脚本
├── README.md                # 完整使用文档
└── QUICKSTART.md            # 快速开始指南
```

## 🚀 如何添加新技能

### 第 1 步：创建技能目录

在 `.claude/skills/` 下创建新技能目录：

```bash
mkdir -p .claude/skills/我的工具
cd .claude/skills/我的工具
```

### 第 2 步：创建脚本和文档

在技能目录下创建所需文件：

```bash
touch skill.md              # 技能描述
touch main.py              # 主脚本
touch README.md            # 使用文档
```

### 第 3 步：编写 skill.md

技能描述文件应包含以下内容：

```markdown
# 我的工具技能

## 技能描述
简短说明工具的核心功能

## 文件位置
- **技能目录：** `.claude/skills/我的工具/`
- **输出目录：** `output/路径/`

## 使用方法

### 命令行
\`\`\`bash
python3 .claude/skills/我的工具/main.py
\`\`\`

### Python API
\`\`\`python
from 我的工具 import MyTool
tool = MyTool()
tool.执行任务()
\`\`\`

## 功能列表
1. 功能一
2. 功能二
3. 功能三

## 依赖环境
- Python 3.x
- 其他依赖...

## 示例
提供实际使用示例
```

### 第 4 步：更新技能列表

在本文件的"可用技能列表"表格中添加新技能的信息。

## 💡 开发规范

### 1. 命名约定

- **目录命名：** 使用 kebab-case（短横线分隔）
  - ✅ 正确：`ui-generator`、`code-formatter`、`image-optimizer`
  - ❌ 错误：`UIGenerator`、`code_formatter`、`imageOptimizer`

- **描述清晰：** 名称应准确反映功能
  - ✅ 好：`ui-generator`（UI 生成器）
  - ❌ 差：`tool1`（不明确）

### 2. 文档要求

每个技能**必须**包含：

- ✅ `skill.md` - 技能说明文档
- ✅ 功能描述 - 清晰说明能做什么
- ✅ 使用方法 - 命令行和 API 调用示例
- ✅ 依赖说明 - 列出所需的环境和库

文档维护：

- 修改脚本功能时，同步更新 `skill.md`
- 保持示例代码的准确性
- 及时记录新增的功能

### 3. 脚本要求

- 脚本文件与技能描述放在同一目录
- 提供清晰的 `README.md` 使用说明
- 包含实际的使用示例
- 添加必要的错误处理
- 脚本添加执行权限（`chmod +x *.py`）

### 4. 依赖管理

在 `skill.md` 中明确说明：

- 运行环境要求（Python 版本、Node.js 版本等）
- 必需的第三方库
- 安装命令（如 `pip install xxx`）
- 可选依赖及其用途

## 📋 技能模板

创建新技能时，可以复制以下模板：

```markdown
# [技能名称]

## 技能描述
[一句话说明这个技能是做什么的]

## 文件位置
- **技能目录：** `.claude/skills/技能名称/`
- **输出目录：** `输出路径/`

## 功能特性
- ✅ 功能点 1
- ✅ 功能点 2
- ✅ 功能点 3

## 使用方法

### 快速开始
\`\`\`bash
python3 .claude/skills/技能名称/main.py
\`\`\`

### API 调用
\`\`\`python
from 技能名称 import Tool
tool = Tool()
result = tool.执行()
\`\`\`

## 依赖环境
- Python 3.x
- 依赖包：`pip install xxx`

## 使用示例
[提供 2-3 个实际使用场景的示例]

## 输出说明
[说明生成的文件/数据格式]

## 常见问题
[列出常见问题和解决方案]

## 更新日期
YYYY-MM-DD

## 版本
vX.X.X
```

## 🔗 相关资源

- **项目总文档：** `CLAUDE.md`
- **技能目录：** `.claude/skills/`
- **Cursor 编辑器规则：** `.cursor/rules/`
- **开发规范：** `.cursor/rules/general.mdc`

## 📝 贡献指南

欢迎添加新的技能！

**添加流程：**
1. 按照上述规范创建脚本和文档
2. 在本文件中更新技能列表
3. 测试确保功能正常
4. 提交代码

**注意事项：**
- 保持代码简洁易读
- 提供充分的注释
- 编写清晰的使用文档
- 遵循项目现有的代码风格
