/**
 * 用户信息编辑页面
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Form, NavBar } from 'antd-mobile';
import { useAuth } from '@/stores/authHooks';
import { useToast } from '@/components/toast';

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateProfile, isLoading, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // 如果未登录，跳转到登录页
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // 填充表单初始值
    if (user) {
      form.setFieldsValue({
        nickname: user.nickname || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar_url: user.avatar_url || '',
      });
    }
  }, [isAuthenticated, user, router, form]);

  const handleSubmit = async (values: {
    nickname?: string;
    email?: string;
    phone?: string;
    avatar_url?: string;
  }) => {
    setSubmitting(true);
    try {
      await updateProfile(values);
      showToast('success', '用户信息更新成功！', '🎉');
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : '更新失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#74d4ff] to-[#fda5d5]">
      {/* 导航栏 */}
      <NavBar onBack={() => router.back()} className="!bg-transparent !text-white">
        <span className="text-lg font-bold text-white">编辑资料</span>
      </NavBar>

      {/* 主内容 */}
      <div className="px-4 py-6">
        {/* 用户头像区域 */}
        <div className="flex flex-col items-center mb-8 animate-slide-down">
          <div className="relative w-24 h-24 mb-4">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt="头像"
                className="w-full h-full rounded-full object-cover shadow-2xl border-4 border-white"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-2xl border-4 border-white">
                <span className="text-4xl text-white font-black">
                  {user.nickname?.[0] || user.username?.[0] || '👤'}
                </span>
              </div>
            )}
            {/* 编辑图标 */}
            <button
              type="button"
              className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
              onClick={() => showToast('info', '头像上传功能开发中', '🚧')}
            >
              <span className="text-lg">📷</span>
            </button>
          </div>
          <h2 className="text-2xl font-black text-white text-center">
            {user.nickname || user.username}
          </h2>
          <p className="text-sm text-white/80 mt-1">
            @{user.username}
          </p>
        </div>

        {/* 编辑表单 */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 animate-slide-up">
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            className="space-y-4"
          >
            {/* 昵称 */}
            <Form.Item
              name="nickname"
              label={
                <span className="text-base font-bold text-gray-700 flex items-center gap-2">
                  <span>✨</span> 昵称
                </span>
              }
            >
              <Input
                placeholder="输入你的昵称"
                clearable
                className="!h-[50px] !rounded-2xl !border-2 !border-purple-200 !bg-purple-50 !text-base hover:!border-purple-300 focus:!border-purple-400 transition-all"
              />
            </Form.Item>

            {/* 邮箱 */}
            <Form.Item
              name="email"
              label={
                <span className="text-base font-bold text-gray-700 flex items-center gap-2">
                  <span>📧</span> 邮箱
                </span>
              }
              rules={[
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input
                placeholder="输入你的邮箱"
                clearable
                type="email"
                className="!h-[50px] !rounded-2xl !border-2 !border-blue-200 !bg-blue-50 !text-base hover:!border-blue-300 focus:!border-blue-400 transition-all"
              />
            </Form.Item>

            {/* 手机号 */}
            <Form.Item
              name="phone"
              label={
                <span className="text-base font-bold text-gray-700 flex items-center gap-2">
                  <span>📱</span> 手机号
                </span>
              }
              rules={[
                { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
              ]}
            >
              <Input
                placeholder="输入你的手机号"
                clearable
                type="tel"
                className="!h-[50px] !rounded-2xl !border-2 !border-green-200 !bg-green-50 !text-base hover:!border-green-300 focus:!border-green-400 transition-all"
              />
            </Form.Item>

            {/* 头像URL（可选） */}
            <Form.Item
              name="avatar_url"
              label={
                <span className="text-base font-bold text-gray-700 flex items-center gap-2">
                  <span>🖼️</span> 头像链接
                </span>
              }
              rules={[
                { type: 'url', message: '请输入有效的URL地址' },
              ]}
            >
              <Input
                placeholder="输入头像图片链接（可选）"
                clearable
                className="!h-[50px] !rounded-2xl !border-2 !border-pink-200 !bg-pink-50 !text-base hover:!border-pink-300 focus:!border-pink-400 transition-all"
              />
            </Form.Item>

            {/* 保存按钮 */}
            <div className="pt-4 space-y-3">
              <Button
                type="submit"
                block
                loading={submitting || isLoading}
                disabled={submitting || isLoading}
                className="!h-[56px] !rounded-2xl !text-lg !font-black !text-white !shadow-xl hover:!shadow-2xl hover:!scale-[1.02] active:!scale-95 transition-all duration-300"
                style={{
                  background: 'linear-gradient(to right, #ad46ff, #ff6900)',
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  保存修改 💾
                </span>
              </Button>

              <Button
                block
                onClick={() => router.back()}
                className="!h-[56px] !rounded-2xl !text-lg !font-bold !bg-gray-100 !text-gray-700 hover:!bg-gray-200 active:!scale-95 transition-all duration-300"
              >
                取消
              </Button>
            </div>
          </Form>
        </div>

        {/* 用户信息卡片 */}
        <div className="mt-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
          <h3 className="text-sm font-bold text-gray-500 mb-3">账号信息</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">用户 ID</span>
              <span className="font-semibold text-gray-800">{user.id}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">用户名</span>
              <span className="font-semibold text-gray-800">{user.username}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">账号状态</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                {user.status === 'active' ? '✅ 正常' : '⚠️ 异常'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">注册时间</span>
              <span className="text-gray-800 text-xs">
                {new Date(user.created_at).toLocaleDateString('zh-CN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
