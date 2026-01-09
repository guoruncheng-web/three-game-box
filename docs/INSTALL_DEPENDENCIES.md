# 安装依赖说明

## 问题

如果遇到 `Module not found: Can't resolve 'bcryptjs'` 或其他模块找不到的错误，说明 `node_modules` 中的依赖没有正确安装。

## 解决方案

### 方法 1: 安装所有依赖（推荐）

在项目根目录运行：

```bash
npm install
```

这会安装 `package.json` 中定义的所有依赖。

### 方法 2: 只安装缺失的依赖

如果只需要安装特定的包：

```bash
npm install bcryptjs @types/bcryptjs
```

## 常见依赖包

项目需要的主要依赖：

- `bcryptjs` - 密码加密
- `pg` - PostgreSQL 客户端
- `ioredis` - Redis 客户端
- `jsonwebtoken` - JWT Token
- `zod` - 数据验证
- `@reduxjs/toolkit` - Redux 状态管理
- `react-redux` - React Redux 绑定
- `antd-mobile` - UI 组件库
- `next` - Next.js 框架
- `react` / `react-dom` - React 库
- `three` - Three.js 3D 引擎
- `@react-three/fiber` - React Three.js 绑定
- `@react-three/drei` - Three.js 辅助库
- `tailwindcss` - Tailwind CSS
- `next-pwa` - PWA 支持

## 安装后验证

安装完成后，检查 `node_modules` 目录：

```bash
ls node_modules/bcryptjs
```

如果目录存在，说明安装成功。

## 如果安装失败

1. **清理缓存后重试**：
   ```bash
   npm cache clean --force
   npm install
   ```

2. **删除 node_modules 和 package-lock.json 后重装**：
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **检查 Node.js 版本**：
   ```bash
   node --version
   ```
   确保使用 Node.js 18 或更高版本。

4. **使用 yarn 替代**（如果 npm 有问题）：
   ```bash
   yarn install
   ```

## 注意事项

- 确保网络连接正常（需要从 npm registry 下载包）
- 某些包可能需要编译原生模块（如 `bcryptjs`），确保系统有编译工具
- 如果使用代理，确保 npm 代理配置正确
