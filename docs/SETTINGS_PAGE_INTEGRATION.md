# 设置页面对接用户信息接口

## 概述

本文档记录设置页面对接用户信息修改接口的实现过程。

## 更新时间

2026-01-12

## 已完成的功能

### 1. 显示真实用户信息

设置页面现在从 Redux Store 中获取并显示真实的用户数据：

- ✅ **用户头像**: 显示用户上传的头像，或显示昵称/用户名首字母作为默认头像
- ✅ **用户昵称**: 显示用户设置的昵称或用户名
- ✅ **用户名**: 显示用户的唯一用户名（@username）
- ✅ **手机号**: 显示用户绑定的手机号（脱敏显示：138****5678），未绑定显示"未绑定"
- ✅ **邮箱**: 显示用户绑定的邮箱地址，未绑定显示"未绑定"

### 2. 跳转到编辑页面

所有个人资料相关的按钮都添加了点击跳转功能：

- ✅ **更换头像** → 点击跳转到 `/profile` 页面
- ✅ **修改昵称** → 点击跳转到 `/profile` 页面
- ✅ **用户名** → 点击跳转到 `/profile` 页面
- ✅ **绑定手机** → 点击跳转到 `/profile` 页面
- ✅ **绑定邮箱** → 点击跳转到 `/profile` 页面

### 3. 绑定状态显示

根据用户数据动态显示绑定状态：

- 已绑定手机号：显示"已绑定"标签（绿色）
- 未绑定手机号：不显示标签，只显示"未绑定"文字
- 已绑定邮箱：显示"已绑定"标签（绿色）
- 未绑定邮箱：不显示标签，只显示"未绑定"文字

## 技术实现

### 核心代码

**获取用户信息**:
```typescript
const { user, logout } = useAuth();
```

**跳转到编辑页面**:
```typescript
const handleEditProfile = () => {
  router.push('/profile');
};
```

**显示用户头像**:
```typescript
{user?.avatar_url ? (
  <img
    src={user.avatar_url}
    alt="头像"
    className="w-16 h-16 rounded-full shadow-lg object-cover"
  />
) : (
  <div
    className="w-16 h-16 rounded-full shadow-lg flex items-center justify-center"
    style={{
      backgroundImage: 'linear-gradient(135deg, rgb(194, 122, 255) 0%, rgb(251, 100, 182) 100%)',
    }}
  >
    <span className="text-3xl">
      {user?.nickname?.[0] || user?.username?.[0] || '🎮'}
    </span>
  </div>
)}
```

**显示昵称**:
```typescript
<span className="text-xs font-normal text-[#6a7282]">
  {user?.nickname || user?.username || '未设置'}
</span>
```

**显示手机号（脱敏）**:
```typescript
<span className="text-xs font-normal text-[#6a7282]">
  {user?.phone
    ? `${user.phone.substring(0, 3)}****${user.phone.substring(7)}`
    : '未绑定'}
</span>
```

**显示邮箱**:
```typescript
<span className="text-xs font-normal text-[#6a7282]">
  {user?.email || '未绑定'}
</span>
```

**条件显示绑定状态**:
```typescript
{user?.phone && (
  <span className="px-2 py-1 bg-[#f0fdf4] rounded-full text-xs font-bold text-[#00a63e]">
    已绑定
  </span>
)}
```

## 用户流程

### 修改用户信息的完整流程

1. 用户访问设置页面：http://localhost:3003/settings
2. 查看当前用户信息（头像、昵称、用户名、手机号、邮箱）
3. 点击任意个人资料项（头像、昵称等）
4. 自动跳转到用户信息编辑页面：http://localhost:3003/profile
5. 在编辑页面修改信息并保存
6. 修改成功后，Redux Store 和 localStorage 自动更新
7. 返回设置页面，查看更新后的信息

## 文件位置

**主要修改的文件**:
- `/src/app/settings/page.tsx` - 设置页面主文件

**相关文件**:
- `/src/app/profile/page.tsx` - 用户信息编辑页面
- `/src/stores/authHooks.ts` - 认证 Hooks（提供 `user` 和 `updateProfile`）
- `/src/app/api/user/profile/route.ts` - 用户信息修改 API

## 功能亮点

### 1. 数据脱敏

手机号显示时自动脱敏，保护用户隐私：
- 原始: `13800138000`
- 显示: `138****8000`

### 2. 默认头像

用户未上传头像时，使用昵称或用户名首字母作为默认头像，增强个性化。

### 3. 动态状态

根据用户数据动态显示：
- 已绑定/未绑定状态
- 已设置/未设置状态
- 对应的状态标签（绿色已绑定）

### 4. 统一入口

所有个人资料编辑功能统一跳转到 `/profile` 页面，用户体验一致。

## 测试步骤

### 1. 测试设置页面显示

```bash
# 1. 启动开发服务器
npm run dev

# 2. 登录测试账号
# 访问: http://localhost:3003/login
# 用户名: admin
# 密码: admin123

# 3. 访问设置页面
# 访问: http://localhost:3003/settings

# 4. 验证显示内容
# - 检查头像是否显示
# - 检查昵称是否正确
# - 检查用户名是否正确
# - 检查邮箱是否显示
# - 检查手机号是否脱敏显示
```

### 2. 测试跳转功能

```bash
# 1. 在设置页面点击"更换头像"
# 2. 验证是否跳转到 /profile 页面
# 3. 返回设置页面
# 4. 点击"修改昵称"
# 5. 验证是否跳转到 /profile 页面
# 6. 在编辑页面修改昵称
# 7. 保存后返回设置页面
# 8. 验证昵称是否更新
```

### 3. 测试数据同步

```bash
# 1. 在 /profile 页面修改用户信息
# 2. 保存成功后返回 /settings 页面
# 3. 验证设置页面的信息是否实时更新
# 4. 刷新页面
# 5. 验证信息是否持久化
```

## 数据流向

```
用户访问设置页面
    ↓
从 Redux Store 获取用户信息
    ↓
显示用户数据（头像、昵称、手机号、邮箱等）
    ↓
用户点击"修改昵称"等按钮
    ↓
跳转到 /profile 页面
    ↓
用户修改信息并保存
    ↓
调用 updateProfile API
    ↓
更新 Redux Store 和 localStorage
    ↓
返回设置页面
    ↓
设置页面自动显示最新信息
```

## 相关 API

设置页面使用以下 Redux Hooks：

```typescript
// 获取用户信息
const { user } = useAuth();

// 用户信息包含的字段
interface PublicUser {
  id: number;
  username: string;
  email: string;
  nickname?: string;
  avatar_url?: string;
  phone?: string;
  status: string;
  role: UserRole;
  created_at: Date | string;
  updated_at: Date | string;
}
```

## 未来优化

1. **直接编辑**: 在设置页面添加弹窗，无需跳转即可修改信息
2. **头像上传**: 添加头像直接上传功能
3. **修改密码**: 添加修改密码入口
4. **手机验证**: 修改手机号时需要验证码验证
5. **邮箱验证**: 修改邮箱时发送验证邮件

## 相关文档

- [用户信息修改功能文档](./USER_PROFILE_UPDATE.md)
- [测试用户设置指南](./TEST_USER_SETUP.md)
- [认证系统实现说明](./AUTH_IMPLEMENTATION.md)

## 总结

设置页面现在已经完全对接了用户信息修改接口，功能包括：

- ✅ 显示真实用户数据（从 Redux Store）
- ✅ 手机号脱敏显示
- ✅ 绑定状态动态显示
- ✅ 所有个人资料按钮跳转到编辑页面
- ✅ 数据实时同步（Redux + localStorage）

用户可以通过设置页面查看个人信息，并通过点击任意项跳转到编辑页面进行修改。修改后的数据会自动同步到设置页面显示。
