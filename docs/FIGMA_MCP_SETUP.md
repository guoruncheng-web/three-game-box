# Figma MCP 工具配置说明

## 一、获取 Figma API 访问令牌

### 步骤 1: 登录 Figma

1. 访问 [Figma](https://www.figma.com/) 并登录您的账户
2. 点击右上角的头像图标
3. 选择 **Settings**（设置）

### 步骤 2: 创建个人访问令牌

1. 在设置页面，找到 **Account**（账户）选项卡
2. 滚动到 **Personal access tokens**（个人访问令牌）部分
3. 点击 **Create new token**（创建新令牌）
4. 为令牌命名（例如：`MCP-Access` 或 `three-game-project`）
5. 点击 **Generate token**（生成令牌）
6. **重要**：立即复制令牌并妥善保存，因为它只会显示一次

## 二、配置 Figma MCP 工具

### 方式 1: 使用 npm 包（推荐）

已经在 `.mcp.json` 中配置了 Figma MCP 工具，您只需要：

1. **更新 `.mcp.json` 文件**，将 `FIGMA_ACCESS_TOKEN` 替换为您获取的 Figma API 令牌：

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": [
        "-y",
        "figma-developer-mcp"
      ],
      "env": {
        "FIGMA_ACCESS_TOKEN": "your_actual_figma_token_here"
      }
    }
  }
}
```

### 方式 2: 使用 Python 包（备选）

如果 npm 包不可用，可以使用 Python 包：

1. **安装 Python 包**：
   ```bash
   pip install figma-mcp-tools
   ```

2. **更新 `.mcp.json` 配置**：
   ```json
   {
     "mcpServers": {
       "figma": {
         "command": "python",
         "args": [
           "-m",
           "figma_mcp_tools"
         ],
         "env": {
           "FIGMA_API_KEY": "your_figma_token_here"
         }
       }
     }
   }
   ```

## 三、使用说明

### 基本功能

配置完成后，Figma MCP 工具可以：

- ✅ 获取 Figma 文件信息
- ✅ 读取设计节点和样式
- ✅ 获取组件和实例信息
- ✅ 导出设计资源
- ✅ 实现设计到代码的转换

### 使用示例

在 MCP 工具中，您可以：

1. **获取 Figma 文件**：
   ```
   获取 Figma 文件: https://www.figma.com/file/xxxxx/your-file
   ```

2. **获取节点信息**：
   ```
   获取节点: node_id_here
   ```

3. **导出设计资源**：
   ```
   导出图像: node_id, format=png
   ```

## 四、注意事项

### 安全建议

1. ⚠️ **不要在代码中硬编码 Figma Token**
   - 使用环境变量或配置文件
   - 确保 `.mcp.json` 不会被提交到公共仓库

2. ⚠️ **Token 权限**
   - 确保 Token 有足够的权限访问需要的文件
   - 只授予必要的权限，遵循最小权限原则

3. ⚠️ **定期轮换 Token**
   - 定期更新访问令牌
   - 如果 Token 泄露，立即撤销并创建新的

### 故障排除

#### 问题 1: 连接失败

**解决方案**：
- 检查 Figma Token 是否正确
- 确认 Token 是否已过期
- 验证网络连接是否正常

#### 问题 2: 包未找到

**解决方案**：
- 检查包名是否正确：`figma-developer-mcp`
- 尝试手动安装：`npm install -g figma-developer-mcp`
- 如果使用 Python 版本，确保 Python 环境正确配置

#### 问题 3: 权限不足

**解决方案**：
- 检查 Figma Token 的权限范围
- 确认要访问的文件是否对 Token 可见
- 尝试使用具有更多权限的 Token

## 五、常用命令

### 通过 MCP 工具执行

1. **列出文件**：
   ```
   list_files
   ```

2. **获取文件内容**：
   ```
   get_file: file_key
   ```

3. **获取节点**：
   ```
   get_node: file_key, node_id
   ```

4. **导出图像**：
   ```
   export_image: file_key, node_id, format=png
   ```

## 六、参考文档

- [Figma API 文档](https://www.figma.com/developers/api)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Figma MCP 工具 GitHub](https://github.com/example/figma-mcp)（如果存在）

## 七、更新日志

- **2024-01-09**: 初始配置 Figma MCP 工具
