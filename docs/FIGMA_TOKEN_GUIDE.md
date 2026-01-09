# Figma API Token 获取指南

## 快速步骤

### 1. 登录 Figma

访问 [https://www.figma.com](https://www.figma.com) 并登录您的账户

### 2. 进入设置页面

1. 点击右上角的头像图标 👤
2. 选择 **Settings**（设置）

### 3. 创建个人访问令牌

1. 在左侧菜单选择 **Account**（账户）
2. 滚动到页面底部的 **Personal access tokens**（个人访问令牌）部分
3. 点击 **Create new token**（创建新令牌）按钮
4. 输入令牌名称（例如：`three-game-mcp`）
5. 点击 **Create token**（创建令牌）

### 4. 复制并保存令牌

**⚠️ 重要提示**：
- 令牌**只会显示一次**
- 立即复制并保存到安全的地方
- 如果丢失，需要创建新的令牌

### 5. 更新 MCP 配置

将复制的令牌粘贴到 `.mcp.json` 文件中：

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
        "FIGMA_ACCESS_TOKEN": "粘贴您的令牌到这里"
      }
    }
  }
}
```

## 令牌权限说明

Figma API Token 默认包含以下权限：

- ✅ **文件内容读取**：可以访问文件的节点和样式
- ✅ **图像导出**：可以导出设计资源为图像
- ✅ **组件信息**：可以获取组件和实例信息

## 安全建议

1. ⚠️ **不要将 Token 提交到 Git**
   - 确保 `.mcp.json` 在 `.gitignore` 中
   - 或使用环境变量

2. ⚠️ **定期轮换 Token**
   - 建议每 90 天更新一次
   - 如果怀疑泄露，立即撤销并创建新的

3. ⚠️ **限制权限**
   - 只授予必要的权限
   - 使用专门的 Token 用于 MCP 工具

## 验证配置

配置完成后，可以在 MCP 工具中测试：

```
获取 Figma 文件: https://www.figma.com/file/xxxxx/test
```

如果配置正确，应该能够获取文件信息。

## 故障排除

### 问题 1: Token 无效

**错误信息**：`Invalid token` 或 `401 Unauthorized`

**解决方案**：
- 检查 Token 是否正确复制（没有多余空格）
- 确认 Token 未过期
- 重新创建新的 Token

### 问题 2: 权限不足

**错误信息**：`403 Forbidden` 或 `Insufficient permissions`

**解决方案**：
- 确认要访问的文件对 Token 可见
- 检查文件权限设置
- 使用具有足够权限的 Token

### 问题 3: 包未找到

**错误信息**：`Cannot find package 'figma-developer-mcp'`

**解决方案**：
- 确认包名是否正确
- 尝试使用 Python 版本的 `figma-mcp-tools`
- 查看是否有其他替代包

## 参考链接

- [Figma Settings](https://www.figma.com/settings)
- [Figma API Documentation](https://www.figma.com/developers/api)
- [Personal Access Tokens](https://www.figma.com/developers/api#access-tokens)
