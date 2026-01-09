# Cursor MCP 服务器配置指南

## 当前可用的 MCP 服务器

### ✅ 已配置的服务器

1. **filesystem** - 文件系统操作
2. **puppeteer** - 浏览器自动化
3. **memory** - 内存管理
4. **fetch** - HTTP 请求
5. **postgres** - PostgreSQL 数据库（gameBox）
6. **postgres-admin** - PostgreSQL 管理（postgres）
7. **sequential-thinking** - 顺序思考
8. **github** - GitHub API
9. **figma** - Figma 设计工具（需要启用本地服务器）

## Figma MCP 服务器配置

### 方式 1: 使用 Figma 桌面版的官方本地服务器（推荐）

Figma 桌面版提供了官方的本地 MCP 服务器，这是最简单的方式：

#### 步骤 1: 启用 Figma 本地 MCP 服务器

1. **更新 Figma 桌面版**到最新版本
2. 打开任意 Figma 文件
3. 点击左上角的 **Figma 菜单**
4. 选择 **Preferences**（偏好设置）
5. 找到 **Enable local MCP server**（启用本地 MCP 服务器）
6. 启用后，底部会显示确认信息，指示服务器正在运行

#### 步骤 2: 配置 Cursor

已经在 `/Users/mac/.cursor/mcp.json` 中配置了：

```json
{
  "figma": {
    "url": "http://127.0.0.1:3845/mcp"
  }
}
```

#### 使用说明

启用后，可以在 Cursor 中：
- 获取 Figma 中当前选中内容的设计信息
- 读取 Figma 文件节点和样式
- 导出设计资源

### 方式 2: 使用社区实现（备选）

如果官方本地服务器不可用，可以使用社区实现：

1. **安装社区包**：
   ```bash
   npm install -g cursor-talk-to-figma-mcp
   ```

2. **启动服务器**：
   ```bash
   cursor-talk-to-figma-mcp
   ```

3. **配置 MCP**：
   ```json
   {
     "figma": {
       "url": "http://127.0.0.1:3845/sse"
     }
   }
   ```

## SSH MCP 服务器

### ❌ 目前没有官方的 SSH MCP 服务器

Model Context Protocol 官方**没有提供** SSH MCP 服务器包。

### 替代方案

如果需要 SSH 功能，可以使用以下方式：

#### 方案 1: 直接使用命令行

```bash
# 使用项目中的 id_rsa 连接服务器
ssh -i /Users/mac/projects/oner/three-game/id_rsa \
    -p 10022 \
    root@47.86.46.212

# 执行远程命令
ssh -i /Users/mac/projects/oner/three-game/id_rsa \
    -p 10022 \
    root@47.86.46.212 \
    'your_command_here'
```

#### 方案 2: 创建 Node.js SSH 脚本

如果需要自动化 SSH 操作：

1. **安装依赖**：
   ```bash
   npm install ssh2 @types/ssh2
   ```

2. **创建脚本**：
   ```javascript
   const { NodeSSH } = require('node-ssh');
   const ssh = new NodeSSH();
   
   await ssh.connect({
     host: '47.86.46.212',
     port: 10022,
     username: 'root',
     privateKey: require('fs').readFileSync('/Users/mac/projects/oner/three-game/id_rsa')
   });
   
   const result = await ssh.execCommand('your_command');
   console.log(result.stdout);
   ```

#### 方案 3: 等待官方支持

等待 Model Context Protocol 官方发布 SSH MCP 服务器。

## 官方 MCP 服务器列表

根据 Model Context Protocol 官方，目前可用的服务器包括：

- ✅ `@modelcontextprotocol/server-filesystem` - 文件系统
- ✅ `@modelcontextprotocol/server-puppeteer` - 浏览器自动化
- ✅ `@modelcontextprotocol/server-memory` - 内存管理
- ✅ `@modelcontextprotocol/server-fetch` - HTTP 请求
- ✅ `@modelcontextprotocol/server-postgres` - PostgreSQL
- ✅ `@modelcontextprotocol/server-sequential-thinking` - 顺序思考
- ✅ `@modelcontextprotocol/server-github` - GitHub
- ✅ Figma 本地服务器（通过 Figma 桌面版启用）
- ❌ SSH - **暂无官方支持**

## 故障排除

### Figma MCP 无法连接

1. **检查 Figma 桌面版是否运行**
2. **确认已启用本地 MCP 服务器**
3. **检查端口 3845 是否被占用**
4. **重启 Cursor**

### SSH 功能需求

如果确实需要通过 MCP 执行 SSH 操作，可以考虑：
- 使用命令行工具
- 创建自定义脚本
- 等待官方支持

## 参考链接

- [Model Context Protocol 官方文档](https://modelcontextprotocol.io/)
- [Figma 开发者文档](https://www.figma.com/developers/api)
- [Cursor MCP 文档](https://docs.cursor.com/zh/cli/mcp)
