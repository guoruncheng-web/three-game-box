# PWA 功能说明

## 已实现的功能

### 1. PWA 安装提示弹窗 ✅

位置：`/components/PWAInstallPrompt.tsx`

**显示时机：**
- ✅ 用户成功登录后进入首页时显示
- ⏱️ 延迟 3 秒显示，让用户先体验应用
- 🎯 只在首页（GameHome）中触发，不在登录/注册页显示

**功能特点：**
- 自动检测浏览器是否支持 PWA 安装
- 监听 `beforeinstallprompt` 事件
- 卡通可爱的设计风格，符合应用主题
- 展示 PWA 三大优势：极速启动、离线畅玩、原生体验

**交互功能：**
- **立即安装**：调用浏览器原生安装提示
- **稍后提醒**：1小时后再次提醒
- **关闭按钮**：3天内不再提示

**智能提示逻辑：**
- 已安装的应用不显示提示
- 用户拒绝后 3 天内不再显示
- 选择"稍后提醒"的用户 1 小时后再次提醒
- 使用 localStorage 记录用户选择

### 2. Service Worker ✅

位置：`/public/sw.js`

**功能：**
- 缓存应用核心资源
- 离线访问支持
- 自动更新缓存
- 网络优先策略（优先使用缓存，失败时请求网络）

### 3. Web App Manifest ✅

位置：`/public/manifest.json`

**配置内容：**
- 应用名称：休闲游戏盒子
- 显示模式：独立应用（standalone）
- 主题色：紫色 (#a855f7)
- 背景色：白色
- 方向：竖屏优先
- 支持多种图标尺寸（72px - 512px）
- 应用截图配置
- 分类：游戏、娱乐

### 4. HTML Meta 标签 ✅

位置：`/index.html`

**配置内容：**
- PWA manifest 链接
- 主题色设置
- Apple 设备支持
- 视口配置
- SEO 优化

## 使用指南

### 开发环境测试

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **使用 HTTPS**
   - PWA 需要 HTTPS 环境（localhost 除外）
   - 使用 ngrok 或类似工具创建 HTTPS 隧道：
     ```bash
     npx ngrok http 5173
     ```

3. **Chrome DevTools 测试**
   - 打开 Chrome DevTools
   - 切换到 "Application" 标签
   - 查看 "Manifest" 和 "Service Workers" 部分
   - 使用 "Install" 按钮测试安装流程

### 生成图标

1. **方式一：使用生成器页面**
   - 访问 `/public/generate-icons.html`
   - 点击"下载全部图标"按钮
   - 将下载的图标放到 `/public` 目录

2. **方式二：使用在线工具**
   - 访问 https://realfavicongenerator.net/
   - 上传高清图标
   - 下载生成的图标包

3. **方式三：手动设计**
   - 使用 Figma/Sketch/Photoshop 设计
   - 导出所需尺寸：72, 96, 128, 144, 152, 192, 384, 512
   - 保存为 PNG 格式

### 部署到生产环境

1. **Vercel**
   ```bash
   npm run build
   vercel deploy --prod
   ```

2. **Netlify**
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. **自定义服务器**
   - 确保服务器支持 HTTPS
   - 配置正确的 MIME 类型
   - 启用 Gzip/Brotli 压缩

### 验证 PWA

使用 Google Lighthouse 检查：
1. 打开 Chrome DevTools
2. 切换到 "Lighthouse" 标签
3. 选择 "Progressive Web App"
4. 点击 "Generate report"
5. 查看评分和优化建议

## 浏览器支持

### 完整支持
- ✅ Chrome (Android)
- ✅ Edge (Android)
- ✅ Samsung Internet
- ✅ Opera (Android)

### 部分支持
- ⚠️ Safari (iOS 16.4+)
  - 支持添加到主屏幕
  - 不支持自动安装提示
  - 需要用户手动从分享菜单添加

- ⚠️ Firefox (Android)
  - 支持 Service Worker
  - 安装体验略有不同

### 不支持
- ❌ iOS Safari (< 16.4)
- ❌ 桌面版 Safari

## 功能展示

### 安装提示弹窗

**移动端：**
- 从底部滑入
- 全宽显示
- 圆角设计

**桌面端：**
- 居中显示
- 固定宽度
- 缩放动画

**视觉效果：**
- 漂浮的 emoji 装饰（⭐💫✨）
- 渐变背景光晕
- 图标弹跳动画
- 三个优势卡片
- 立即安装按钮（渐变 + hover 效果）
- 稍后提醒按钮（灰色）

### 应用图标

**设计元素：**
- 渐变背景（紫→粉→橙）
- 游戏手柄 emoji 🎮
- 装饰性星星 ✨⭐💫
- 圆角矩形
- 半透明内边距

## 注意事项

1. **HTTPS 必需**
   - 生产环境必须使用 HTTPS
   - localhost 开发可以使用 HTTP

2. **图标要求**
   - 必须提供至少 192x192 和 512x512 图标
   - PNG 格式
   - 正方形
   - 边缘留白避免裁切

3. **manifest.json**
   - 必须正确配置
   - MIME 类型：application/json
   - 所有图标路径必须正确

4. **Service Worker**
   - 作用域默认为注册位置
   - 更新后需要刷新页面
   - 开发时可以在 DevTools 中强制更新

5. **iOS 注意事项**
   - 需要 apple-touch-icon
   - 需要 apple-mobile-web-app-* meta 标签
   - 用户需要手动添加到主屏幕

## 未来优化

- [ ] 添加离线页面
- [ ] 实现后台同步
- [ ] 推送通知功能
- [ ] 应用更新提示
- [ ] 更多缓存策略
- [ ] 性能优化
- [ ] 应用截图

## 相关资源

- [PWA 官方文档](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Lighthouse PWA 检查](https://developers.google.com/web/tools/lighthouse/audits/pwa)