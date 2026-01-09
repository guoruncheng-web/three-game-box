# Figma 启用本地 MCP 服务器详细步骤

## ✅ 前提条件

1. **Figma 桌面版**（必须是桌面版，网页版不支持）
   - 确保已安装最新版本的 Figma Desktop App
   - 如果没有安装，从 [Figma 官网](https://www.figma.com/downloads/) 下载

2. **Figma 账户**
   - 需要登录 Figma 账户

3. **更新到最新版本**
   - 确保 Figma 桌面版已更新到最新版本
   - 检查更新：菜单栏 → **Help** → **Check for Updates**

## 🚀 详细启用步骤

### 步骤 1: 打开 Figma 桌面版

1. 启动 **Figma Desktop App**（不是浏览器版本）
2. 确保已登录 Figma 账户

### 步骤 2: 打开任意 Figma 文件

1. 打开一个现有的 Figma 文件，或创建一个新文件
2. **重要**：必须打开文件才能启用 MCP 服务器，不能在空白界面启用

### 步骤 3: 打开 Preferences（偏好设置）

**方法 A: 通过菜单栏（推荐）**

1. 点击左上角的 **Figma 菜单图标**（左上角的 Figma Logo 或菜单按钮）
2. 选择 **Settings**（设置）→ **Preferences**（偏好设置）

**方法 B: 通过快捷键（最快）**

- macOS: 按 `Cmd + ,`（Command + 逗号）
- Windows/Linux: 按 `Ctrl + ,`（Control + 逗号）

### 步骤 4: 找到并启用 Dev Mode MCP Server

在 Preferences 窗口中：

1. 查找 **"Enable Dev Mode MCP Server"** 选项
   - 可能在 **General**（常规）选项卡
   - 也可能在 **Developer**（开发者）或 **Dev Mode**（开发模式）相关设置中
   - 搜索框中输入 "MCP" 快速查找

2. **勾选** **"Enable Dev Mode MCP Server"** 复选框

3. 如果找不到该选项，可能是：
   - Figma 版本过旧，需要更新到最新版本
   - 功能可能在不同版本中的位置不同
   - 尝试查找包含 "MCP"、"Dev Mode" 或 "Local Server" 的选项

### 步骤 5: 确认服务器运行

启用后，您应该看到：

1. **Figma 底部状态栏**显示：
   ```
   MCP server running on http://127.0.0.1:3845/sse
   ```
   或类似的确认信息

2. **或者 Preferences 窗口**中显示：
   ```
   Dev Mode MCP Server: Enabled
   ```

3. **服务器地址**：`http://127.0.0.1:3845/sse`（注意是 `/sse` 不是 `/mcp`）

## ✅ 验证服务器是否运行

### 方法 1: 检查 Figma 界面

启用后，Figma 界面应该会显示服务器运行状态，通常在：
- 底部状态栏
- Preferences 窗口中的服务器状态

### 方法 2: 检查端口（命令行）

在终端中检查端口 3845 是否被占用：

```bash
# macOS/Linux
lsof -i :3845

# 或者使用 netstat
netstat -an | grep 3845
```

如果看到进程监听在 `127.0.0.1:3845`，说明服务器正在运行。

### 方法 3: 测试连接（命令行）

使用 curl 测试连接：

```bash
# 测试 SSE 端点
curl http://127.0.0.1:3845/sse

# 或者测试根路径
curl http://127.0.0.1:3845/
```

如果返回响应或连接成功，说明服务器正常运行。

## 📝 配置 Cursor

### 更新 MCP 配置

启用 Figma 本地 MCP 服务器后，确保 Cursor 配置正确。

在 `/Users/mac/.cursor/mcp.json` 中已配置：

```json
{
  "mcpServers": {
    "figma": {
      "url": "http://127.0.0.1:3845/sse"
    }
  }
}
```

**重要提示**：
- ✅ URL 地址：`http://127.0.0.1:3845/sse`（注意是 `/sse` 不是 `/mcp`）
- ✅ 确保 Figma 桌面版正在运行并且已启用 MCP 服务器
- ✅ 重启 Cursor 以使配置生效

### 重启 Cursor

配置完成后，**重启 Cursor** 以使更改生效。

## 🎯 使用示例

### 在 Cursor 中使用 Figma MCP

启用并配置后，可以在 Cursor 中：

1. **获取 Figma 设计信息**
   ```
   获取 Figma 文件: https://www.figma.com/file/xxxxx/your-file
   ```

2. **获取当前选中的内容**
   ```
   获取 Figma 中当前选中的设计元素
   ```

3. **导出设计资源**
   ```
   从 Figma 导出图像: node_id, format=png
   ```

4. **获取文件节点**
   ```
   获取 Figma 文件节点: file_key, node_id
   ```

## ❌ 故障排除

### 问题 1: 找不到 "Enable Dev Mode MCP Server" 选项

**可能原因**：
- Figma 桌面版版本过旧
- 功能可能在不同版本中的位置不同

**解决方案**：
1. **更新 Figma** 到最新版本
   - 菜单栏 → **Help** → **Check for Updates**
   - 或从 [Figma 官网](https://www.figma.com/downloads/) 下载最新版本

2. **检查是否在文件内**
   - 确保已打开一个 Figma 文件（不是空白界面）
   - 某些功能只能在文件打开时使用

3. **查找替代名称**
   - 搜索 "MCP"
   - 搜索 "Dev Mode"
   - 搜索 "Local Server"

### 问题 2: 启用后无法连接

**可能原因**：
- 端口被占用
- 防火墙阻止
- Cursor 配置不正确

**解决方案**：
1. **检查端口是否被占用**：
   ```bash
   lsof -i :3845
   ```
   如果被占用，关闭占用端口的程序

2. **检查防火墙设置**：
   - 确保本地连接（127.0.0.1）未被阻止

3. **确认 Cursor 配置正确**：
   - URL 应该是：`http://127.0.0.1:3845/sse`（注意是 `/sse`）
   - 确保 Figma 桌面版正在运行

4. **重启服务**：
   - 重启 Figma 桌面版
   - 重启 Cursor

### 问题 3: 功能不可用

**可能原因**：
- Figma 版本不支持
- 需要特定的 Figma 账户权限
- MCP 服务器未正确启动

**解决方案**：
1. **更新到最新版本**
   - 确保使用最新版本的 Figma Desktop App

2. **确认使用的是桌面版**
   - 必须使用 Figma Desktop App，不是网页版

3. **检查服务器状态**
   - 确认底部状态栏显示服务器运行信息
   - 验证端口 3845 是否被监听

## ⚠️ 注意事项

1. **必须使用桌面版**：网页版不支持本地 MCP 服务器
2. **保持 Figma 运行**：需要保持 Figma 桌面版打开并运行
3. **端口冲突**：确保端口 3845 未被其他程序占用
4. **版本要求**：可能需要较新版本的 Figma Desktop App
5. **URL 格式**：服务器地址是 `http://127.0.0.1:3845/sse`（注意是 `/sse`）

## 📚 参考链接

- [Figma Desktop Downloads](https://www.figma.com/downloads/)
- [Figma API Documentation](https://www.figma.com/developers/api)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Cursor MCP Documentation](https://docs.cursor.com/zh/cli/mcp)

## 📋 快速检查清单

- [ ] Figma 桌面版已安装并更新到最新版本
- [ ] 已登录 Figma 账户
- [ ] 已打开一个 Figma 文件（不是空白界面）
- [ ] 已通过 Preferences 启用 "Enable Dev Mode MCP Server"
- [ ] 看到底部状态栏显示服务器运行信息
- [ ] 端口 3845 正在被监听
- [ ] Cursor 配置中的 URL 是 `http://127.0.0.1:3845/sse`
- [ ] 已重启 Cursor

完成以上所有步骤后，Figma MCP 工具应该可以正常使用了！
