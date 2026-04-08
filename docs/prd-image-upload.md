# 图片上传 + 头像上传 需求文档

> 版本: v1.0 | 日期: 2026-04-08 | 状态: 待开发

---

## 一、功能描述

为游戏盒子项目提供**通用图片上传能力**，首期落地场景为**用户头像上传**。用户可在个人资料编辑页点击头像区域，选择本地图片，经裁剪预览后上传至服务器，完成头像更换。

图片存储采用本地 `public` 目录方案（简单可控），预留云存储迁移接口。

---

## 二、用户故事

| 编号 | 角色 | 故事 | 验收条件 |
|------|------|------|----------|
| US-01 | 已登录用户 | 我想在个人资料页上传一张图片作为头像 | 点击头像触发文件选择，上传成功后头像实时更新 |
| US-02 | 已登录用户 | 我想在上传前预览并裁剪图片为正方形 | 弹出裁剪弹窗，可缩放/拖动，确认后上传 |
| US-03 | 已登录用户 | 我想知道上传失败的原因 | 文件过大、格式不对、网络错误等均有明确 Toast 提示 |
| US-04 | 开发者 | 我想复用图片上传 API 用于其他场景（如游戏封面） | API 设计为通用 `/api/upload/image`，通过 `category` 参数区分用途 |

---

## 三、交互流程

### 3.1 头像上传主流程

```
用户点击头像区域的 📷 按钮
       ↓
弹出系统文件选择器（accept: image/jpeg, image/png, image/webp）
       ↓
用户选择图片文件
       ↓
前端校验：格式 + 文件大小（≤ 5MB）
       ↓ 校验通过
弹出裁剪弹窗（圆形预览 + 正方形裁剪框）
  - 支持手势缩放、拖拽平移
  - 显示「确认」「取消」按钮
       ↓ 点击确认
前端将裁剪后的图片转为 Blob（目标尺寸: 256x256px, JPEG quality 0.85）
       ↓
调用 POST /api/upload/image（FormData: file + category=avatar）
  - 显示上传进度/loading 状态
       ↓
服务端处理：校验 → 压缩 → 存储 → 返回 URL
       ↓
前端拿到 URL，调用 PUT /api/user/profile 更新 avatar_url
       ↓
刷新用户状态，头像实时更新，显示成功 Toast
```

### 3.2 异常流程

| 场景 | 处理方式 |
|------|----------|
| 文件格式不支持 | 前端拦截，Toast 提示「仅支持 JPG/PNG/WebP 格式」 |
| 文件超过 5MB | 前端拦截，Toast 提示「图片大小不能超过 5MB」 |
| 网络超时 | Toast 提示「上传超时，请检查网络后重试」 |
| 服务端处理失败 | Toast 提示服务端返回的错误信息 |
| 存储空间不足 | 服务端返回 507，前端提示「服务器存储空间不足」 |

---

## 四、技术方案

### 4.1 新增 API

#### `POST /api/upload/image`

通用图片上传接口。

**请求：**
- Content-Type: `multipart/form-data`
- Headers: `Authorization: Bearer <token>`
- Body:
  - `file`: 图片文件（必填）
  - `category`: 用途分类（必填），枚举值: `avatar` | `game_cover` | `general`

**处理逻辑：**
1. JWT 鉴权
2. 校验 `category` 参数
3. 校验文件 MIME 类型（`image/jpeg`, `image/png`, `image/webp`）
4. 校验文件大小（≤ 5MB）
5. 使用 `sharp` 进行图片处理：
   - `avatar`: 裁剪为 256x256, JPEG, quality 80
   - `game_cover`: 裁剪为 640x360, JPEG, quality 85
   - `general`: 最大宽度 1920px 等比缩放, 保持原格式
6. 生成文件名: `{category}/{userId}_{timestamp}.{ext}`
7. 存储至 `public/uploads/{category}/`
8. 返回可访问的图片 URL

**响应：**
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "/uploads/avatar/42_1712563200000.jpg",
    "width": 256,
    "height": 256,
    "size": 28456
  }
}
```

**错误码：**
| HTTP 状态码 | code | 说明 |
|-------------|------|------|
| 400 | 400 | 缺少文件 / 格式不支持 / 超过大小限制 |
| 401 | 401 | 未授权 |
| 413 | 413 | 文件过大（兜底，Next.js body limit） |
| 500 | 500 | 服务端处理失败 |

### 4.2 前端裁剪组件

使用 `react-image-crop` 或 `react-easy-crop` 库实现裁剪功能。

**组件设计：**

```
<AvatarUploader>
  ├── <input type="file" hidden />      // 隐藏的文件选择器
  ├── <CropModal>                        // 裁剪弹窗
  │   ├── <Cropper />                    // 裁剪区域
  │   ├── <ZoomSlider />                 // 缩放滑块
  │   └── <ActionButtons />             // 确认/取消
  └── <UploadProgress />                 // 上传进度
```

**推荐方案: `react-easy-crop`**
- 轻量（~10KB gzip）
- 支持触摸手势（移动端友好）
- 支持圆形裁剪预览
- 输出裁剪区域坐标，前端用 Canvas 裁切

### 4.3 图片存储方案

**当前方案（Phase 1）: 本地文件存储**

```
public/
  └── uploads/
      ├── avatar/          # 用户头像
      ├── game_cover/      # 游戏封面
      └── general/         # 通用图片
```

- 通过 Next.js 静态文件服务直接访问: `/uploads/avatar/42_xxx.jpg`
- 优点: 零配置，部署简单
- 缺点: 不适合大规模使用，Vercel 部署时 `public` 目录只读

**未来方案（Phase 2）: 云存储**

预留 `StorageAdapter` 接口，后续可无缝切换到阿里云 OSS / AWS S3：

```typescript
interface StorageAdapter {
  upload(file: Buffer, path: string): Promise<string>;  // 返回 URL
  delete(path: string): Promise<void>;
}
```

**Vercel 部署兼容方案：**
- Vercel 环境下 `public` 目录只读，需要替代方案
- Phase 1 可用 `/tmp` + 外部存储（如 Vercel Blob）
- 或直接跳到 Phase 2 使用云存储
- 建议: 开发环境用本地存储，生产环境通过环境变量切换到 Vercel Blob 或 OSS

### 4.4 依赖安装

```bash
# 图片处理（服务端）
npm install sharp

# 前端裁剪
npm install react-easy-crop
```

### 4.5 Next.js 配置调整

`next.config.ts` 中增加 body 大小限制：

```typescript
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '6mb',  // 略大于前端限制，留余量
    },
  },
};
```

---

## 五、涉及文件清单

### 新增文件

| 文件路径 | 说明 |
|----------|------|
| `src/app/api/upload/image/route.ts` | 通用图片上传 API |
| `src/components/ui/avatar-uploader.tsx` | 头像上传组件（含裁剪弹窗） |
| `src/components/ui/image-crop-modal.tsx` | 图片裁剪弹窗组件 |
| `src/hooks/useImageUpload.ts` | 图片上传自定义 Hook |
| `src/lib/storage/index.ts` | 存储适配器接口 + 本地实现 |
| `src/lib/storage/local.ts` | 本地文件存储实现 |
| `public/uploads/.gitkeep` | 上传目录占位 |

### 修改文件

| 文件路径 | 修改内容 |
|----------|----------|
| `src/app/profile/page.tsx` | 替换头像区域的占位 Toast 为 `<AvatarUploader>` 组件 |
| `src/app/settings/page.tsx` | 头像展示区域支持点击上传（可选） |
| `src/app/api/user/profile/route.ts` | `avatar_url` 字段增加对 `/uploads/` 路径的校验支持（当前仅校验完整 URL） |
| `next.config.ts` | 配置 API body size limit |
| `package.json` | 新增 `sharp`、`react-easy-crop` 依赖 |
| `.gitignore` | 添加 `public/uploads/` 排除规则（不提交用户上传文件） |

---

## 六、数据库变更

**无需变更。** 现有 `users` 表的 `avatar_url` 字段（VARCHAR, nullable）已满足需求，存储图片访问路径即可。

> 注意: Prisma schema 中字段名为 `avatar`，SQL 表中字段名为 `avatar_url`，前端类型中使用 `avatar_url`。确认以 SQL 表实际字段名为准。

---

## 七、安全考虑

1. **文件类型校验**: 服务端双重校验 —— MIME type + 文件头魔数（magic bytes）
2. **文件大小限制**: 前端 5MB + 服务端 6MB（防绕过）
3. **文件名安全**: 服务端生成文件名，不使用用户原始文件名（防路径穿越）
4. **存储隔离**: 按 `category` 分目录，按 `userId` 前缀命名
5. **鉴权**: 所有上传必须携带有效 JWT Token
6. **旧文件清理**: 上传新头像时删除旧头像文件（避免存储膨胀）
7. **频率限制**: 头像上传限制 1 次/分钟（防滥用）

---

## 八、验收标准

### 功能验收

- [ ] 点击头像编辑按钮可打开文件选择器
- [ ] 仅能选择 JPG/PNG/WebP 格式图片
- [ ] 超过 5MB 的图片被拦截并提示
- [ ] 选择图片后弹出裁剪弹窗
- [ ] 裁剪弹窗支持手势缩放和拖拽
- [ ] 裁剪弹窗显示圆形预览效果
- [ ] 点击确认后显示上传 loading 状态
- [ ] 上传成功后头像实时更新（无需刷新页面）
- [ ] 上传成功后显示成功 Toast
- [ ] 上传失败时显示对应错误提示
- [ ] 头像 URL 正确写入数据库
- [ ] 其他页面（设置页、我的页）头像同步更新

### API 验收

- [ ] `POST /api/upload/image` 正确处理 multipart 文件上传
- [ ] 无 Token 请求返回 401
- [ ] 无效文件格式返回 400
- [ ] 文件超限返回 400
- [ ] 上传成功返回图片 URL、尺寸、大小信息
- [ ] 图片通过返回的 URL 可正常访问
- [ ] 上传新头像时旧文件被清理

### 兼容性验收

- [ ] iOS Safari 正常工作
- [ ] Android Chrome 正常工作
- [ ] 微信内置浏览器正常工作（可选）
- [ ] PWA 模式下正常工作

---

## 九、里程碑

| 阶段 | 内容 | 预估工时 |
|------|------|----------|
| P1 | 后端上传 API + 本地存储 | 3h |
| P2 | 前端裁剪组件 + 头像上传集成 | 4h |
| P3 | 联调测试 + 异常处理完善 | 2h |
| P4 | Vercel 部署适配（可选切换 Vercel Blob） | 2h |
| **合计** | | **11h** |

---

## 十、开放问题

1. **Vercel 部署**: 生产环境 `public` 目录只读，是否直接采用 Vercel Blob Storage 作为 Phase 1 方案？
2. **旧头像清理策略**: 是否保留历史头像（如最近 3 张），还是每次上传直接覆盖？
3. **默认头像**: 是否提供一组预设头像供用户选择（无需上传）？
4. **图片 CDN**: 是否需要配置 CDN 加速图片访问？

<!-- 中文说明：本文档为游戏盒子项目「图片上传 + 头像上传」功能的产品需求文档，包含功能描述、用户故事、交互流程、技术方案、文件清单和验收标准。 -->
