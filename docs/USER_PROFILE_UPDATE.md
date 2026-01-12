# 用户信息修改功能文档

## 概述

本文档说明用户信息修改功能的使用方法，包括 API 接口和前端页面的使用。

## 功能特性

- ✅ 修改用户昵称
- ✅ 修改邮箱地址
- ✅ 修改手机号
- ✅ 修改头像链接
- ✅ 实时表单验证
- ✅ 友好的错误提示
- ✅ 自动更新 Redux 状态和 localStorage
- ✅ 漂亮的渐变 UI 设计

## API 接口

### 1. 更新用户信息

**PUT** `/api/user/profile`

需要在请求头中携带 Token：

```
Authorization: Bearer {token}
```

**请求体：**
```json
{
  "nickname": "新昵称",
  "email": "new@example.com",
  "phone": "13800138000",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

所有字段都是可选的，只需要传入需要修改的字段。

**成功响应：**
```json
{
  "code": 200,
  "message": "用户信息更新成功",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "new@example.com",
    "nickname": "新昵称",
    "phone": "13800138000",
    "avatar_url": "https://example.com/avatar.jpg",
    "status": "active",
    "role": "user",
    "created_at": "2026-01-12T00:00:00.000Z",
    "updated_at": "2026-01-12T01:00:00.000Z"
  }
}
```

**错误响应示例：**

邮箱已被使用：
```json
{
  "code": 400,
  "message": "该邮箱已被其他用户使用",
  "data": null
}
```

手机号已被使用：
```json
{
  "code": 400,
  "message": "该手机号已被其他用户使用",
  "data": null
}
```

未登录：
```json
{
  "code": 401,
  "message": "未授权访问",
  "data": null
}
```

### 2. 获取当前用户信息

**GET** `/api/user/profile`

需要在请求头中携带 Token：

```
Authorization: Bearer {token}
```

**成功响应：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@qq.com",
    "nickname": "管理员",
    "phone": null,
    "avatar_url": null,
    "status": "active",
    "role": "super_admin",
    "created_at": "2026-01-12T00:00:00.000Z",
    "updated_at": "2026-01-12T00:00:00.000Z"
  }
}
```

## 前端使用

### 1. 访问用户信息编辑页面

```
http://localhost:3003/profile
```

### 2. 在代码中使用 updateProfile 函数

```typescript
import { useAuth } from '@/stores/authHooks';

function MyComponent() {
  const { user, updateProfile } = useAuth();

  const handleUpdate = async () => {
    try {
      const updatedUser = await updateProfile({
        nickname: '新昵称',
        email: 'new@example.com',
      });
      console.log('更新成功:', updatedUser);
    } catch (error) {
      console.error('更新失败:', error);
    }
  };

  return (
    <div>
      <p>当前昵称: {user?.nickname}</p>
      <button onClick={handleUpdate}>更新信息</button>
    </div>
  );
}
```

### 3. 表单验证规则

- **昵称**：1-50 个字符，可选
- **邮箱**：必须是有效的邮箱格式
- **手机号**：必须是 11 位中国大陆手机号（1开头）
- **头像链接**：必须是有效的 URL 格式

## 测试步骤

### 1. 测试 API 接口

使用测试用户登录并获取 Token：

```bash
# 1. 登录获取 Token
curl -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# 2. 使用返回的 token 更新用户信息
curl -X PUT http://localhost:3003/api/user/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {你的token}" \
  -d '{
    "nickname": "超级管理员",
    "phone": "13800138000"
  }'

# 3. 获取更新后的用户信息
curl -X GET http://localhost:3003/api/user/profile \
  -H "Authorization: Bearer {你的token}"
```

### 2. 测试前端页面

1. 访问登录页面: http://localhost:3003/login
2. 使用测试账号登录:
   - 用户名: `admin`
   - 密码: `admin123`
3. 登录成功后，访问: http://localhost:3003/profile
4. 修改用户信息并保存
5. 检查是否更新成功

## 页面截图说明

用户信息编辑页面包含以下元素：

1. **顶部导航栏**
   - 返回按钮
   - 标题：编辑资料

2. **用户头像区域**
   - 显示当前头像（或默认头像）
   - 点击相机图标可上传头像（开发中）
   - 显示昵称和用户名

3. **编辑表单**
   - 昵称输入框（紫色主题）
   - 邮箱输入框（蓝色主题）
   - 手机号输入框（绿色主题）
   - 头像链接输入框（粉色主题）

4. **操作按钮**
   - 保存修改按钮（渐变色，带图标）
   - 取消按钮（灰色）

5. **账号信息卡片**
   - 用户 ID
   - 用户名
   - 账号状态
   - 注册时间

## 技术实现细节

### 后端实现

1. **API 路由**: `src/app/api/user/profile/route.ts`
   - PUT 方法：更新用户信息
   - GET 方法：获取用户信息

2. **数据验证**: 使用 Zod 进行请求数据验证

3. **权限验证**: 使用 JWT Token 验证用户身份

4. **缓存处理**:
   - 更新成功后清除 Redis 缓存
   - 重新缓存新的用户信息

5. **唯一性检查**:
   - 检查邮箱是否已被其他用户使用
   - 检查手机号是否已被其他用户使用

### 前端实现

1. **页面组件**: `src/app/profile/page.tsx`
   - 使用 antd-mobile 组件库
   - 响应式设计，适配移动端
   - 美观的渐变背景和卡片设计

2. **状态管理**:
   - Redux Store (`src/stores/authStore.ts`)
   - Auth Hooks (`src/stores/authHooks.ts`)
   - `updateProfile` 函数自动更新 Redux 状态和 localStorage

3. **表单处理**:
   - 使用 antd-mobile Form 组件
   - 自动填充当前用户信息
   - 实时验证和错误提示

4. **用户体验**:
   - 加载状态提示
   - 成功/失败 Toast 提示
   - 平滑的动画效果
   - 未登录自动跳转到登录页

## 安全注意事项

1. **Token 验证**: 所有修改操作都需要有效的 JWT Token
2. **数据验证**: 后端严格验证所有输入数据
3. **唯一性检查**: 防止邮箱和手机号重复
4. **SQL 注入防护**: 使用参数化查询
5. **XSS 防护**: 前端自动转义用户输入

## 扩展功能（待开发）

- [ ] 头像上传功能
- [ ] 修改密码功能
- [ ] 手机号验证码验证
- [ ] 邮箱验证码验证
- [ ] 实名认证
- [ ] 账号注销

## 相关文档

- [测试用户设置指南](./TEST_USER_SETUP.md)
- [认证系统实现说明](./AUTH_IMPLEMENTATION.md)
- [API 文档](./api-documentation.md)

## 常见问题

### Q: 修改邮箱后需要重新登录吗？

A: 不需要。修改邮箱后，Token 仍然有效，可以继续使用。

### Q: 可以修改用户名吗？

A: 目前不支持修改用户名。用户名是唯一标识，创建后不可修改。

### Q: 手机号和邮箱可以留空吗？

A: 可以。邮箱在注册时是必填的，但之后可以修改或清空。手机号始终是可选的。

### Q: 修改信息后，其他设备的登录状态会受影响吗？

A: 不会。修改用户信息不会使其他设备的 Token 失效。如果需要登出所有设备，请使用"登出所有设备"功能（待开发）。

## 总结

用户信息修改功能已经完整实现并可以使用。你可以通过：

1. ✅ 访问 http://localhost:3003/profile 编辑用户信息
2. ✅ 调用 API `/api/user/profile` 更新信息
3. ✅ 使用 `updateProfile` Hook 函数在代码中更新

如有问题，请查看上述文档或联系开发团队。
