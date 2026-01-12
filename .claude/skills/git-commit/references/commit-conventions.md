# Git Commit Message 规范

## Conventional Commits 格式

```
<type>: <subject>

<body>

<footer>
```

## Type 类型

- **feat:** 新功能（feature）
- **fix:** 修复 bug
- **docs:** 文档更新
- **style:** 代码格式调整（不影响代码运行的变动）
- **refactor:** 重构（既不是新增功能，也不是修改bug的代码变动）
- **perf:** 性能优化
- **test:** 测试相关
- **chore:** 构建过程或辅助工具的变动

## Subject 主题

- 简明扼要描述改动（50字以内）
- 使用祈使句，现在时态
- 不要句号结尾
- 中文或英文均可

## Body 正文（可选）

- 详细描述改动的内容和原因
- 可以分多行
- 解释"是什么"和"为什么"，而不是"怎么做"

## Footer 尾部（必需）

必须包含以下内容：

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## 示例

### 示例 1：新功能

```
feat: 添加水果消消乐游戏

实现了基于 Three.js 的 3D 水果消消乐游戏，包括：
- 8x8 游戏网格
- 水果匹配和消除逻辑
- 得分和移动步数系统

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### 示例 2：修复 bug

```
fix: 修复水果点击交互失效问题

- 为 Canvas 添加 100% 宽高填充
- 修复触摸事件处理逻辑
- 添加 onPointerDown 事件支持

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### 示例 3：文档更新

```
docs: 更新 README 使用说明

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## 注意事项

1. Type 必须小写
2. Subject 首字母不大写（中文除外）
3. 必须包含 Footer 标识
4. Body 和 Footer 之间空一行
5. 专注于"做了什么"而不是"如何做"
