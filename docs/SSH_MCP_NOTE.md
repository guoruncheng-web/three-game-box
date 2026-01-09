# SSH MCP 工具说明

## 问题说明

`@modelcontextprotocol/server-ssh` 这个包**不存在**于 npm 仓库中。

根据 Model Context Protocol 官方服务器列表，目前**没有官方的 SSH MCP 服务器**。

## 已移除配置

由于包不存在，已经从 `/Users/mac/.cursor/mcp.json` 中移除了 SSH 配置。

## 替代方案

如果需要通过 MCP 工具执行 SSH 操作，可以考虑以下方案：

### 方案 1: 使用命令行工具

直接在终端中执行 SSH 命令：

```bash
# 使用项目中的 id_rsa 私钥连接服务器
ssh -i /Users/mac/projects/oner/three-game/id_rsa \
    -p 10022 \
    root@47.86.46.212

# 执行远程命令
ssh -i /Users/mac/projects/oner/three-game/id_rsa \
    -p 10022 \
    root@47.86.46.212 \
    '命令'
```

### 方案 2: 创建 Node.js 脚本

创建一个脚本通过 `ssh2` 包连接服务器：

```bash
npm install ssh2 @types/ssh2
```

然后创建脚本执行 SSH 操作。

### 方案 3: 使用其他 MCP 工具

如果确实需要通过 MCP 工具执行 SSH 操作，可以：

1. **等待官方发布** SSH MCP 服务器
2. **使用社区实现**（如果有的话）
3. **自己实现**一个简单的 SSH MCP 服务器

## 当前可用的 MCP 服务器

根据配置，当前可用的 MCP 服务器包括：

- ✅ `@modelcontextprotocol/server-filesystem` - 文件系统操作
- ✅ `@modelcontextprotocol/server-puppeteer` - 浏览器自动化
- ✅ `@modelcontextprotocol/server-memory` - 内存管理
- ✅ `@modelcontextprotocol/server-fetch` - HTTP 请求
- ✅ `@modelcontextprotocol/server-postgres` - PostgreSQL 数据库
- ✅ `@modelcontextprotocol/server-sequential-thinking` - 顺序思考
- ✅ `@modelcontextprotocol/server-github` - GitHub API
- ❌ `@modelcontextprotocol/server-ssh` - **不存在**

## 参考链接

- [Model Context Protocol 官方文档](https://modelcontextprotocol.io/)
- [MCP 服务器列表](https://github.com/modelcontextprotocol/servers)（如果有的话）
