/**
 * 创建用户页面 - 管理员专用
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Form, Selector } from 'antd-mobile';
import { useToast } from '@/components/toast';
import { useAuth } from '@/stores/authHooks';
import type { CreateUserRequest, UserRole } from '@/types/auth';
import Image from 'next/image';

const roleOptions = [
  {
    label: '👑 超级管理员',
    value: 'super_admin' as UserRole,
    description: '拥有所有权限',
  },
  {
    label: '👨‍💼 管理员',
    value: 'admin' as UserRole,
    description: '管理内容和用户',
  },
  {
    label: '👤 普通用户',
    value: 'user' as UserRole,
    description: '基础使用权限',
  },
];

export default function CreateUserPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [form] = Form.useForm<CreateUserRequest>();
  const [submitting, setSubmitting] = useState(false);

  // 权限检查
  useEffect(() => {
    if (!isAuthenticated) {
      showToast('warning', '请先登录');
      router.push('/login');
      return;
    }

    if (user?.role !== 'super_admin') {
      showToast('error', '权限不足，仅超级管理员可访问');
      router.push('/mine');
    }
  }, [isAuthenticated, user, router, showToast]);

  const handleSubmit = async (values: CreateUserRequest) => {
    if (values.password.length < 8) {
      showToast('warning', '密码至少需要 8 个字符', '🔒');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '创建失败');
      }

      showToast('success', '账号创建成功！', '🎉');
      form.resetFields();

      // 3秒后返回
      setTimeout(() => {
        router.push('/mine');
      }, 2000);
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : '创建失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 加载中或权限不足时不渲染
  if (!isAuthenticated || user?.role !== 'super_admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f3e8ff] via-[#fef3c7] to-[#ffedd4]">
      <div className="max-w-md mx-auto px-4 pt-4 pb-8">
        {/* 头部 */}
        <div className="flex items-center gap-4 mb-6 animate-slide-down">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
          >
            <span className="text-xl">←</span>
          </button>
          <h1 className="text-2xl font-black text-[#1e2939]">创建新账号</h1>
        </div>

        {/* 表单卡片 */}
        <div className="bg-white rounded-3xl shadow-xl p-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md"
              style={{
                backgroundImage: 'linear-gradient(135deg, rgb(147, 51, 234) 0%, rgb(219, 39, 119) 100%)',
              }}
            >
              <span className="text-3xl">👤</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-[#1e2939]">用户信息</h2>
              <p className="text-sm text-[#6a7282]">填写新用户的基本信息</p>
            </div>
          </div>

          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            mode="card"
          >
            <Form.Item
              name="username"
              label={
                <span className="text-sm font-bold text-[#364153]">
                  <span className="mr-2">📱</span>用户名
                </span>
              }
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少 3 个字符' },
                { pattern: /^[a-zA-Z0-9_]+$/, message: '只能包含字母、数字和下划线' },
              ]}
            >
              <Input
                placeholder="请输入用户名"
                clearable
                className="!rounded-xl !border-2 !border-purple-100 !bg-gradient-to-r !from-[#faf5ff] !to-[#fdf2f8]"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={
                <span className="text-sm font-bold text-[#364153]">
                  <span className="mr-2">📧</span>邮箱
                </span>
              }
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input
                placeholder="请输入邮箱"
                clearable
                type="email"
                className="!rounded-xl !border-2 !border-blue-100 !bg-gradient-to-r !from-[#eff6ff] !to-[#ecfeff]"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span className="text-sm font-bold text-[#364153]">
                  <span className="mr-2">🔐</span>密码
                </span>
              }
              rules={[
                { required: true, message: '请输入密码' },
                { min: 8, message: '密码至少 8 位' },
              ]}
            >
              <Input
                placeholder="请输入密码（至少8位）"
                clearable
                type="password"
                className="!rounded-xl !border-2 !border-pink-100 !bg-gradient-to-r !from-[#fef2f2] !to-[#fef3f2]"
              />
            </Form.Item>

            <Form.Item
              name="nickname"
              label={
                <span className="text-sm font-bold text-[#364153]">
                  <span className="mr-2">✨</span>昵称（选填）
                </span>
              }
            >
              <Input
                placeholder="请输入昵称"
                clearable
                className="!rounded-xl !border-2 !border-green-100 !bg-gradient-to-r !from-[#f0fdf4] !to-[#ecfdf5]"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label={
                <span className="text-sm font-bold text-[#364153]">
                  <span className="mr-2">📞</span>手机号（选填）
                </span>
              }
              rules={[
                { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
              ]}
            >
              <Input
                placeholder="请输入手机号"
                clearable
                type="tel"
                className="!rounded-xl !border-2 !border-yellow-100 !bg-gradient-to-r !from-[#fefce8] !to-[#fef9c3]"
              />
            </Form.Item>

            <Form.Item
              name="role"
              label={
                <span className="text-sm font-bold text-[#364153]">
                  <span className="mr-2">👑</span>用户角色
                </span>
              }
              rules={[{ required: true, message: '请选择用户角色' }]}
            >
              <Selector
                options={roleOptions}
                columns={1}
                className="role-selector"
                style={{
                  '--border-radius': '12px',
                  '--border': '2px solid #e9d4ff',
                  '--checked-border': '2px solid #9333ea',
                  '--checked-color': '#9333ea',
                }}
              />
            </Form.Item>

            <div className="flex gap-3 mt-8">
              <Button
                block
                onClick={() => router.back()}
                disabled={submitting}
                className="!rounded-2xl !h-14 !text-base !font-bold !border-2"
                style={{
                  background: 'linear-gradient(to right, #f3f4f6, #e5e7eb)',
                  color: '#4b5563',
                }}
              >
                取消
              </Button>
              <Button
                block
                type="submit"
                loading={submitting}
                disabled={submitting}
                className="!rounded-2xl !h-14 !text-base !font-black !text-white !shadow-xl"
                style={{
                  background: 'linear-gradient(to right, #9333ea, #db2777)',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                创建账号 🚀
              </Button>
            </div>
          </Form>
        </div>

        {/* 提示信息 */}
        <div className="mt-4 bg-white/80 rounded-2xl p-4 animate-fade-in delay-300">
          <p className="text-sm text-gray-600 text-center">
            <span className="font-bold">💡 提示：</span>
            创建的账号将立即生效，用户可以使用邮箱和密码登录
          </p>
        </div>
      </div>
    </div>
  );
}
