# PM2 启动失败故障排查指南

## 🔍 问题已修复

已修复以下问题：
1. ✅ 端口配置：`package.json` 中的 start 脚本现在使用端口 7006
2. ✅ PM2 配置：直接使用 Next.js 二进制文件而不是 npm 包装器
3. ✅ 部署脚本：统一使用 `ecosystem.config.js` 启动
4. ✅ 构建检查：部署前检查 `.next` 目录是否存在

## 📋 服务器端手动修复步骤

如果 CI/CD 部署后 PM2 仍然失败，请登录服务器执行以下步骤：

### 1. 登录服务器
```bash
ssh root@47.86.46.212
```

### 2. 进入项目目录
```bash
cd /var/www/three-game
```

### 3. 检查构建状态
```bash
# 检查 .next 目录是否存在
ls -la .next

# 如果不存在，手动构建
npm run build
```

### 4. 检查 PM2 进程状态
```bash
# 查看所有 PM2 进程
pm2 list

# 查看详细日志
pm2 logs three-game --lines 100

# 查看错误日志
pm2 logs three-game --err --lines 50
```

### 5. 停止并删除旧进程
```bash
# 停止进程
pm2 stop three-game

# 删除进程
pm2 delete three-game
```

### 6. 使用新配置启动
```bash
# 使用 ecosystem.config.js 启动
pm2 start ecosystem.config.js

# 保存 PM2 进程列表
pm2 save

# 查看状态
pm2 status
```

### 7. 测试应用是否正常运行
```bash
# 测试本地端口
curl http://localhost:7006

# 或使用浏览器访问
# http://www.gamebox.xingzdh.com
```

## 🐛 常见错误和解决方案

### 错误 1: "Error: Could not find a production build in the '.next' directory"
**原因**：缺少构建产物

**解决方案**：
```bash
cd /var/www/three-game
npm run build
pm2 restart three-game
```

### 错误 2: "EADDRINUSE: address already in use :::7006"
**原因**：端口 7006 被占用

**解决方案**：
```bash
# 查找占用端口的进程
lsof -i :7006

# 或使用
netstat -tlnp | grep 7006

# 杀死占用端口的进程
kill -9 <PID>

# 然后重启
pm2 restart three-game
```

### 错误 3: "npm ERR! missing script: start"
**原因**：PM2 配置使用了错误的启动方式

**解决方案**：
确保使用最新的 `ecosystem.config.js`，已修改为直接调用 Next.js

### 错误 4: "Error: Cannot find module 'next'"
**原因**：依赖未安装

**解决方案**：
```bash
cd /var/www/three-game
npm ci
npm run build
pm2 restart three-game
```

### 错误 5: 内存不足
**原因**：构建或运行时内存耗尽

**解决方案**：
```bash
# 临时增加 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# 或在 ecosystem.config.js 中已设置 max_memory_restart: '1G'
```

## 📊 PM2 常用命令

```bash
# 查看所有进程
pm2 list

# 查看进程详情
pm2 show three-game

# 实时日志
pm2 logs three-game

# 重启进程
pm2 restart three-game

# 重载进程（零停机）
pm2 reload three-game

# 停止进程
pm2 stop three-game

# 删除进程
pm2 delete three-game

# 监控仪表板
pm2 monit

# 清空日志
pm2 flush

# 保存进程列表（重启后自动恢复）
pm2 save

# 复活保存的进程
pm2 resurrect
```

## 🔄 完全重新部署

如果以上方法都不行，执行完全重新部署：

```bash
# 1. 停止并删除所有 three-game 进程
pm2 delete three-game

# 2. 清理项目目录
cd /var/www/three-game
rm -rf .next node_modules

# 3. 重新安装依赖
npm ci

# 4. 构建项目
npm run build

# 5. 启动应用
pm2 start ecosystem.config.js
pm2 save

# 6. 查看状态
pm2 status
pm2 logs three-game --lines 50
```

## 📝 日志位置

- **PM2 错误日志**: `/var/log/pm2/three-game-error.log`
- **PM2 输出日志**: `/var/log/pm2/three-game-out.log`
- **Nginx 访问日志**: `/var/log/nginx/gamebox-access.log`
- **Nginx 错误日志**: `/var/log/nginx/gamebox-error.log`

## ✅ 验证部署成功

运行以下命令验证：
```bash
# 1. 检查 PM2 状态
pm2 status
# 应该看到 three-game 进程状态为 "online"

# 2. 检查端口监听
netstat -tlnp | grep 7006
# 应该看到端口 7006 被 node 进程监听

# 3. 测试 HTTP 响应
curl -I http://localhost:7006
# 应该返回 HTTP 200

# 4. 检查 Nginx 代理
curl -I http://www.gamebox.xingzdh.com
# 应该返回 HTTP 200
```

## 🆘 如果问题仍未解决

查看完整日志并分享错误信息：
```bash
# 导出最近 200 行日志
pm2 logs three-game --lines 200 --nostream > ~/three-game-logs.txt

# 查看系统资源使用
pm2 monit

# 检查 Node.js 版本
node -v  # 应该是 v20.x

# 检查磁盘空间
df -h
```
