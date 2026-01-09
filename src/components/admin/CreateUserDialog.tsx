/**
 * 创建用户弹窗（管理员专用）
 */

'use client';

import { useState } from 'react';
import { Dialog, Form, Input, Button, Selector } from 'antd-mobile';
import { useToast } from '@/components/toast';
import type { CreateUserRequest, UserRole } from '@/types/auth';

interface CreateUserDialogProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

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

export function CreateUserDialog({ visible, onClose, onSuccess }: CreateUserDialogProps) {
  const { showToast } = useToast();
  const [form] = Form.useForm<CreateUserRequest>();
  const [submitting, setSubmitting] = useState(false);

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
      onSuccess?.();
      onClose();
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : '创建失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      title={
        <div className="text-xl font-black text-center py-2 flex items-center justify-center gap-2">
          <span>👤</span>
          <span>创建新账号</span>
        </div>
      }
      content={
        <div className="px-2">
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            mode="card"
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少 3 个字符' },
                { pattern: /^[a-zA-Z0-9_]+$/, message: '只能包含字母、数字和下划线' },
              ]}
            >
              <Input placeholder="请输入用户名" clearable />
            </Form.Item>

            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input placeholder="请输入邮箱" clearable type="email" />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 8, message: '密码至少 8 位' },
              ]}
            >
              <Input placeholder="请输入密码（至少8位）" clearable type="password" />
            </Form.Item>

            <Form.Item
              name="nickname"
              label="昵称（选填）"
            >
              <Input placeholder="请输入昵称" clearable />
            </Form.Item>

            <Form.Item
              name="phone"
              label="手机号（选填）"
              rules={[
                { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
              ]}
            >
              <Input placeholder="请输入手机号" clearable type="tel" />
            </Form.Item>

            <Form.Item
              name="role"
              label="用户角色"
              rules={[{ required: true, message: '请选择用户角色' }]}
            >
              <Selector
                options={roleOptions}
                columns={1}
              />
            </Form.Item>

            <div className="flex gap-3 mt-6">
              <Button
                block
                onClick={onClose}
                disabled={submitting}
                className="!rounded-2xl"
              >
                取消
              </Button>
              <Button
                block
                type="submit"
                color="primary"
                loading={submitting}
                disabled={submitting}
                className="!rounded-2xl !bg-gradient-to-r !from-purple-500 !to-pink-500"
              >
                创建账号
              </Button>
            </div>
          </Form>
        </div>
      }
    />
  );
}
