# SSH MCP 工具配置问题修复

## 问题说明

错误信息显示：`@modelcontextprotocol/server-ssh` 包不存在（404 错误）

```
npm error 404  The requested resource '@modelcontextprotocol/server-ssh@*' could not be found
```

## 问题原因

`@modelcontextprotocol/server-ssh` 这个包可能不存在于 npm 仓库中，或者不是一个官方的 MCP 服务器包。

## 解决方案

### 方案 1: 使用替代包名（如果存在）

尝试使用以下可能的包名：

1. `mcp-server-ssh`
2. `@modelcontextprotocol/mcp-server-ssh`
3. `figma-ssh-mcp`

### 方案 2: 移除 SSH 配置（如果不需要）

如果项目不需要通过 MCP 工具执行 SSH 操作，可以删除 SSH 配置：

在 `/Users/mac/.cursor/mcp.json` 中删除 `ssh` 配置块。

### 方案 3: 使用其他方式实现 SSH 功能

如果需要 SSH 功能，可以考虑：

1. **直接使用命令行工具**：
   ```bash
   ssh -i /Users/mac/projects/oner/three-game/id_rsa -p 10022 root@47.86.46.212
   ```

2. **使用 Node.js 脚本**：
   创建一个脚本来执行 SSH 命令，而不是通过 MCP 工具。

3. **查找第三方 SSH MCP 服务器**：
   搜索是否有社区维护的 SSH MCP 服务器实现。

## 当前配置

当前 SSH 配置（需要修复）：

```json
{
  "ssh": {
    "command": "npx",
    "args": [
      "-y",
      "@modelcontextprotocol/server-ssh"  // 这个包不存在
    ],
    "env": {
      "SSH_HOST": "47.86.46.212",
      "SSH_PORT": "10022",
      "SSH_USER": "root",
      "SSH_PRIVATE_KEY_PATH": "/Users/mac/projects/oner/three-game/id_rsa"
    }
  }
}
```

## 建议

由于 `@modelcontextprotocol/server-ssh` 包不存在，建议：

1. **暂时移除 SSH 配置**，如果需要，等官方包发布后再添加
2. **或者使用替代实现**，比如通过命令行或脚本执行 SSH 操作

如果确实需要 SSH MCP 功能，可能需要：
- 等待官方发布 SSH MCP 服务器
- 或使用社区维护的替代方案
- 或自己实现一个简单的 SSH MCP 服务器
