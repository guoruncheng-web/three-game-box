# Mine 页面显示真实用户信息修复

## 问题描述

用户反馈 mine 页面一直显示"游客玩家"的信息，而不是登录账号的真实信息。

## 问题原因

Mine 页面（`src/app/mine/page.tsx`）使用了两套用户数据系统：

1. **Redux Store 中的认证用户数据** (`user`): 来自登录系统，包含真实的用户信息
2. **独立的 userData 状态**: 从 localStorage 的 `userId` 获取，主要用于游客用户系统

问题在于页面显示时，直接使用了 `userData?.username`，而没有优先使用 Redux 的认证用户数据。

### 原始代码（有问题）

```typescript
// 显示用户名
<span className="text-2xl font-black text-white">
  {userData?.username || '游客玩家'}
</span>

// 显示头像
<div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center">
  <span className="text-4xl">🎮</span>
</div>
```

这样会导致：
- 即使用户已登录，也可能显示"游客玩家"
- 不显示真实的用户昵称
- 不显示用户上传的头像

## 解决方案

修改 mine 页面，让它优先使用 Redux Store 中的认证用户数据。

### 修改后的代码

#### 1. 用户名显示（优先级排序）

```typescript
<span className="text-2xl font-black text-white">
  {user?.nickname || user?.username || userData?.username || '游客玩家'}
</span>
```

优先级：
1. Redux 用户的昵称（`user?.nickname`）
2. Redux 用户的用户名（`user?.username`）
3. 本地游客用户名（`userData?.username`）
4. 默认显示"游客玩家"

#### 2. 头像显示（真实头像或首字母）

```typescript
{user?.avatar_url ? (
  <img
    src={user.avatar_url}
    alt="头像"
    className="w-20 h-20 rounded-full bg-white shadow-xl object-cover"
  />
) : (
  <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center">
    {user ? (
      <span className="text-4xl font-black text-purple-600">
        {user.nickname?.[0] || user.username?.[0] || '🎮'}
      </span>
    ) : (
      <span className="text-4xl">🎮</span>
    )}
  </div>
)}
```

逻辑：
- 如果用户上传了头像 → 显示真实头像
- 如果没有头像但已登录 → 显示昵称或用户名的首字母
- 如果未登录 → 显示默认图标 🎮

#### 3. 认证标识显示

```typescript
{user && (
  <Image
    src="/images/profile/icon-verified.svg"
    alt="verified"
    width={20}
    height={20}
  />
)}
```

只有登录用户才显示认证标识（绿色对勾图标）。

#### 4. 头像编辑按钮跳转

```typescript
<button
  onClick={() => router.push('/profile')}
  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#fdc700] shadow-lg flex items-center justify-center"
>
  {/* 相机图标 */}
</button>
```

点击头像上的相机图标，跳转到用户信息编辑页面。

## 修改的文件

- **主文件**: `src/app/mine/page.tsx`
  - 第 344-373 行：头像显示逻辑
  - 第 362-371 行：用户名显示逻辑

## 测试步骤

### 1. 测试登录用户显示

```bash
# 1. 访问登录页面
http://localhost:3003/login

# 2. 使用测试账号登录
用户名: admin
密码: admin123

# 3. 访问 mine 页面
http://localhost:3003/mine

# 4. 验证显示内容
# ✅ 应该显示 "管理员" 或 "admin"（不是"游客玩家"）
# ✅ 应该显示认证标识（绿色对勾）
# ✅ 应该显示用户头像或首字母 "A"
```

### 2. 测试头像显示

```bash
# 1. 在 /profile 页面设置头像 URL
# 2. 保存后返回 /mine 页面
# 3. 验证头像是否显示
```

### 3. 测试未登录状态

```bash
# 1. 退出登录
# 2. 访问 /mine 页面
# 3. 应该自动跳转到登录页面
```

## 数据流向

```
用户登录
  ↓
登录信息存储到 Redux Store (user)
  ↓
访问 /mine 页面
  ↓
优先读取 Redux 中的 user 数据
  ↓
显示：
  - 昵称/用户名（不是"游客玩家"）
  - 头像或首字母
  - 认证标识
```

## 相关系统说明

Mine 页面使用了两套用户系统：

### 1. 认证用户系统（Redux）

- **来源**: 登录/注册系统
- **存储**: Redux Store + localStorage
- **用途**: 显示真实用户信息、权限控制
- **数据**: `user` 对象（包含 id, username, email, nickname, avatar_url 等）

### 2. 游客用户系统（本地）

- **来源**: 自动创建的游客账号
- **存储**: localStorage (`userId`)
- **用途**: 记录游戏统计数据（分数、成就等）
- **数据**: `userData` 对象（包含 level, totalScore, gamesPlayed 等）

### 优先级

修复后的页面会优先使用认证用户数据（Redux），只有在未登录时才使用游客数据。

## 未来优化

1. **统一用户系统**: 将游客数据和认证用户数据合并
2. **登录后迁移数据**: 游客登录后，将游客的游戏记录迁移到真实账号
3. **头像上传**: 直接在 mine 页面提供头像上传功能
4. **昵称快速编辑**: 在 mine 页面添加快速编辑昵称的功能

## 相关文档

- [设置页面对接说明](./SETTINGS_PAGE_INTEGRATION.md)
- [用户信息修改功能文档](./USER_PROFILE_UPDATE.md)
- [测试用户设置指南](./TEST_USER_SETUP.md)

## 总结

Mine 页面现在已经修复，会正确显示登录用户的真实信息：

- ✅ 显示真实昵称或用户名（不再显示"游客玩家"）
- ✅ 显示用户头像或首字母（不再只显示 🎮）
- ✅ 显示认证标识（已登录用户）
- ✅ 点击头像编辑按钮跳转到 /profile 页面

修改后，用户登录后访问 mine 页面时，会看到他们真实的账号信息，而不是游客信息。
