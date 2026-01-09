/**
 * 登录表单组件
 */

'use client';

import { useState } from 'react';
import { Button, Input, Form } from 'antd-mobile';
import { useAuth } from '@/stores/authHooks';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/toast';
import type { LoginRequest } from '@/types/auth';

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const { showToast } = useToast();
  const [form] = Form.useForm<LoginRequest>();

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: LoginRequest) => {
    // 详细验证各个字段
    const missingFields: string[] = [];

    if (!values.username) missingFields.push('用户名/邮箱');
    if (!values.password) missingFields.push('密码');

    if (missingFields.length > 0) {
      showToast('warning', `请填写：${missingFields.join('、')}`, '📝');
      return;
    }

    if (values.password.length < 8) {
      showToast('warning', '密码至少需要 8 个字符', '🔒');
      return;
    }

    setSubmitting(true);
    try {
      await login(values);
      showToast('success', '登录成功，欢迎回来！', '🎉');
      router.push('/');
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : '登录失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form
      form={form}
      onFinish={handleSubmit}
      layout="vertical"
      footer={
        <Button
          block
          type="submit"
          color="primary"
          size="large"
          loading={submitting || isLoading}
          disabled={submitting || isLoading}
        >
          登录
        </Button>
      }
    >
      <Form.Header>登录</Form.Header>
      
      <Form.Item
        name="username"
        label="用户名/邮箱"
        rules={[
          { required: true, message: '请输入用户名或邮箱' },
          { min: 1, message: '用户名或邮箱不能为空' },
        ]}
      >
        <Input placeholder="请输入用户名或邮箱" clearable />
      </Form.Item>

      <Form.Item
        name="password"
        label="密码"
        rules={[
          { required: true, message: '请输入密码' },
          { min: 8, message: '密码至少 8 位' },
        ]}
      >
        <Input type="password" placeholder="请输入密码" clearable />
      </Form.Item>
    </Form>
  );
}
