---
name: git-commit
description: 自动化 Git 提交流程，包含代码检查、commit message 生成和推送。当用户请求提交代码时使用，例如"帮我提交代码"、"创建一个 commit"、"提交这些更改"或"commit 并 push"。自动执行 TypeScript 检查、ESLint 检查、漏洞扫描，生成符合规范的 commit message，并完成提交和推送操作。
---

# Git Commit 自动化技能

自动化 Git 提交工作流程，确保代码质量并生成规范的 commit message。

## 工作流程

执行以下步骤来完成自动化提交：

### 1. 运行提交前检查

使用 `scripts/pre_commit_check.sh` 执行所有必需的代码质量检查：

```bash
bash .claude/skills/git-commit/scripts/pre_commit_check.sh
```

该脚本会依次执行：
- TypeScript 类型检查（`npx tsc --noEmit`）
- ESLint 代码规范检查（`npm run lint`）
- npm audit 漏洞扫描（高危漏洞检测）

**如果任何检查失败**：
- 停止流程
- 向用户报告具体错误
- 提供修复建议
- 等待用户修复后再继续

**如果所有检查通过**：
- 继续下一步

### 2. 分析代码变更

运行以下命令获取变更信息：

```bash
# 查看暂存的文件
git status

# 查看详细的代码变更
git diff --staged
```

如果没有暂存的文件，先暂存所有变更：

```bash
git add .
```

### 3. 生成 Commit Message

根据代码变更内容，参考 `references/commit-conventions.md` 生成符合规范的 commit message。

**生成规则**：

1. **选择合适的 type**：
   - `feat:` - 新功能或特性
   - `fix:` - Bug 修复
   - `docs:` - 文档更新
   - `style:` - 代码格式调整
   - `refactor:` - 重构
   - `perf:` - 性能优化
   - `test:` - 测试相关
   - `chore:` - 构建/工具相关

2. **撰写简洁的 subject**（50字以内）
   - 清晰描述"做了什么"
   - 使用祈使句，现在时态
   - 不要句号结尾

3. **添加 body**（如果变更较多）
   - 详细说明变更内容
   - 解释"是什么"和"为什么"

4. **必须添加 footer**：
   ```
   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>
   ```

**示例 commit message**：

```
feat: 添加用户登录功能

实现了用户登录系统，包括：
- 登录表单组件
- JWT token 验证
- 用户状态管理

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### 4. 执行 Git Commit

使用 HEREDOC 格式执行 commit，确保多行 message 正确格式化：

```bash
git commit -m "$(cat <<'EOF'
<生成的 commit message>
EOF
)"
```

### 5. 推送到远程仓库

提交成功后，自动推送到远程：

```bash
git push
```

如果是首次推送新分支：

```bash
git push -u origin <branch-name>
```

### 6. 向用户报告结果

完成后，向用户报告：
- ✅ 所有检查已通过
- ✅ 代码已提交
- ✅ 已推送到远程
- 显示 commit hash 和 message

## 错误处理

### TypeScript 或 ESLint 错误

- 停止流程
- 展示具体错误信息
- 建议用户：
  - 运行 `npm run lint` 查看详细错误
  - 修复错误后重新提交

### npm audit 发现漏洞

- 展示漏洞详情
- 建议运行 `npm audit fix`
- 询问用户是否要继续提交（高危漏洞应该修复）

### Git 推送失败

- 可能原因：
  - 远程有新提交（需要先 pull）
  - 没有推送权限
  - 网络问题
- 建议用户手动处理冲突或检查权限

## 注意事项

1. **不要跳过检查**：所有检查必须通过才能提交
2. **Commit message 质量**：确保 message 清晰、准确、符合规范
3. **Footer 必需**：每个 commit 必须包含 Claude Code 标识
4. **分支保护**：不要强制推送到 main/master 分支
5. **敏感信息**：检查是否意外提交了 .env、密钥等敏感文件

## 快速参考

- **检查脚本**：`scripts/pre_commit_check.sh`
- **Commit 规范**：`references/commit-conventions.md`
- **Conventional Commits**：https://www.conventionalcommits.org/
