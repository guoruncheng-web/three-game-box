# 输出模式

当技能需要产生一致的高质量输出时，使用这些模式。

## 模板模式

提供输出格式的模板。将严格程度与您的需求相匹配。

**对于严格要求（如 API 响应或数据格式）：**

```markdown
## 报告结构

始终使用这个确切的模板结构：

# [分析标题]

## 执行摘要
[关键发现的一段概述]

## 关键发现
- 发现 1 及支持数据
- 发现 2 及支持数据
- 发现 3 及支持数据

## 建议
1. 具体可行的建议
2. 具体可行的建议
```

**对于灵活指导（当适应有用时）：**

```markdown
## 报告结构

这是一个合理的默认格式，但请使用您的最佳判断：

# [分析标题]

## 执行摘要
[概述]

## 关键发现
[根据您发现的内容调整部分]

## 建议
[根据特定上下文量身定制]

根据特定分析类型的需要调整部分。
```

## 示例模式

对于输出质量取决于查看示例的技能，提供输入/输出对：

```markdown
## 提交消息格式

遵循这些示例生成提交消息：

**示例 1:**
输入：使用 JWT 令牌添加用户身份验证
输出：
```
feat(auth): implement JWT-based authentication

Add login endpoint and token validation middleware
```

**示例 2:**
输入：修复报告中日期显示不正确的错误
输出：
```
fix(reports): correct date formatting in timezone conversion

Use UTC timestamps consistently across report generation
```

遵循此样式：type(scope): 简要描述，然后详细说明。
```

示例帮助 Claude 比单独的描述更清楚地理解所需的样式和详细程度。
