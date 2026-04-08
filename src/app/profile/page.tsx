/**
 * 用户信息编辑页面
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Form, NavBar } from 'antd-mobile';
import { useAuth } from '@/stores/authHooks';
import { useToast } from '@/components/toast';
import AvatarUpload from '@/components/ui/avatar-upload';

/** antd-mobile 实际输入域为 .adm-input-element，默认 padding:0，需单独加左右内边距 */
const inputClass =
  '!h-[52px] !rounded-2xl !border !border-violet-200/80 !bg-white/95 !text-[15px] !text-[#2d3436] !shadow-sm !transition-all placeholder:!text-gray-400 focus:!border-[#667eea] focus:!shadow-[0_0_0_3px_rgba(102,126,234,0.18)] [&_.adm-input-element]:!px-4 [&_.adm-input-element]:!box-border';

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, updateProfile, isLoading, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      form.setFieldsValue({
        nickname: user.nickname || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [isAuthenticated, user, router, form]);

  const handleSubmit = async (values: {
    nickname?: string;
    email?: string;
    phone?: string;
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
    <div className="relative min-h-screen min-h-dvh overflow-hidden bg-[#5b6fd8]">
      {/* 背景氛围 */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#667eea] via-[#8b7cf8] to-[#c084fc] opacity-100"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-fuchsia-400/35 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 bottom-32 h-56 w-56 rounded-full bg-cyan-300/30 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/10 to-transparent"
        aria-hidden
      />

      <NavBar
        onBack={() => router.back()}
        className="relative z-10 !border-b !border-white/15 !bg-white/12 !backdrop-blur-xl [&_.adm-nav-bar-title]:!text-white [&_.adm-nav-bar-back-arrow]:!text-white"
        style={{
          paddingTop: 'max(8px, env(safe-area-inset-top))',
        }}
      >
        <span className="text-[17px] font-bold tracking-wide text-white drop-shadow-sm">编辑资料</span>
      </NavBar>

      <div className="relative z-10 px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-5">
        {/* 头像区 */}
        <section className="mb-6 flex flex-col items-center animate-slide-down">
          <div className="relative mb-4">
            <div
              className="absolute -inset-1 rounded-full bg-gradient-to-br from-amber-200 via-fuchsia-300 to-indigo-400 opacity-90 blur-[2px]"
              aria-hidden
            />
            <div className="relative rounded-full bg-white/20 p-[3px] shadow-lg shadow-indigo-900/20 ring-2 ring-white/40">
              <AvatarUpload
                currentAvatar={user.avatar_url}
                username={user.nickname || user.username}
                token={token || ''}
                size={96}
                onSuccess={async (url) => {
                  try {
                    await updateProfile({ avatar_url: url });
                    showToast('success', '头像更新成功！', '🎉');
                  } catch {
                    showToast('error', '头像保存失败，请重试');
                  }
                }}
              />
            </div>
          </div>
          <h1 className="text-center text-[22px] font-black tracking-tight text-white drop-shadow-md">
            {user.nickname || user.username}
          </h1>
          <p className="mt-1.5 rounded-full bg-black/15 px-4 py-1 text-[13px] font-medium text-white/90 backdrop-blur-sm">
            @{user.username}
          </p>
        </section>

        {/* 表单卡片 */}
        <div className="mb-5 rounded-[1.35rem] border border-white/40 bg-white/92 p-5 shadow-[0_12px_40px_rgba(79,70,229,0.18)] backdrop-blur-md animate-slide-up">
          <p className="mb-4 text-center text-[13px] font-medium text-gray-500">修改下方信息并保存</p>
          <Form form={form} onFinish={handleSubmit} layout="vertical" className="[&_.adm-form-item-label]:!pb-1.5">
            <Form.Item
              name="nickname"
              label={<span className="text-[15px] font-bold text-gray-700">昵称</span>}
            >
              <Input placeholder="输入你的昵称" clearable className={inputClass} />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span className="text-[15px] font-bold text-gray-700">邮箱</span>}
              rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
            >
              <Input placeholder="输入你的邮箱" clearable type="email" className={inputClass} />
            </Form.Item>

            <Form.Item
              name="phone"
              label={<span className="text-[15px] font-bold text-gray-700">手机号</span>}
              rules={[{ pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }]}
            >
              <Input placeholder="输入你的手机号" clearable type="tel" className={inputClass} />
            </Form.Item>

            <div className="space-y-3 pt-2">
              <Button
                type="submit"
                block
                loading={submitting || isLoading}
                disabled={submitting || isLoading}
                className="!h-[52px] !rounded-2xl !text-[16px] !font-bold !text-white !shadow-lg !shadow-indigo-500/35 active:!scale-[0.98] touch-manipulation"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 55%, #a855f7 100%)',
                  border: 'none',
                }}
              >
                保存修改
              </Button>
              <Button
                block
                onClick={() => router.back()}
                className="!h-[50px] !rounded-2xl !border-2 !border-white/70 !bg-white/25 !text-[15px] !font-semibold !text-white backdrop-blur-sm active:!scale-[0.98] touch-manipulation"
              >
                返回
              </Button>
            </div>
          </Form>
        </div>

        {/* 账号信息 */}
        <div className="rounded-[1.25rem] border border-white/25 bg-white/15 p-4 shadow-inner backdrop-blur-md">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <h2 className="text-[14px] font-bold tracking-wide text-white">账号信息</h2>
          </div>
          <ul className="divide-y divide-white/15 rounded-xl bg-black/10 px-3 py-1">
            <li className="flex items-center justify-between gap-3 py-3.5">
              <span className="shrink-0 text-[13px] text-white/75">用户 ID</span>
              <span className="truncate text-right font-mono text-[13px] font-semibold text-white">{user.id}</span>
            </li>
            <li className="flex items-center justify-between gap-3 py-3.5">
              <span className="text-[13px] text-white/75">用户名</span>
              <span className="truncate text-right text-[14px] font-semibold text-white">{user.username}</span>
            </li>
            <li className="flex items-center justify-between gap-3 py-3.5">
              <span className="text-[13px] text-white/75">账号状态</span>
              <span
                className={`rounded-full px-3 py-1 text-[12px] font-bold ${
                  user.status === 'active'
                    ? 'bg-emerald-400/25 text-emerald-100 ring-1 ring-emerald-300/50'
                    : 'bg-amber-400/25 text-amber-100 ring-1 ring-amber-300/50'
                }`}
              >
                {user.status === 'active' ? '正常' : '异常'}
              </span>
            </li>
            <li className="flex items-center justify-between gap-3 py-3.5">
              <span className="text-[13px] text-white/75">注册时间</span>
              <span className="text-[13px] text-white/95 tabular-nums">
                {new Date(user.created_at).toLocaleDateString('zh-CN')}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
