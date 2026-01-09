/**
 * 登录表单组件
 */

'use client';

import { useState } from 'react';
import { Button, Input, Form, Toast } from 'antd-mobile';
import { useAuth } from '@/stores/authHooks';
import { useRouter } from 'next/navigation';
import type { LoginRequest } from '@/types/auth';

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [form] = Form.useForm<LoginRequest>();

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: LoginRequest) => {
    setSubmitting(true);
    try {
      await login(values);
      Toast.show({
        icon: 'success',
        content: '登录成功',
      });
      router.push('/');
    } catch (error) {
      Toast.show({
        icon: 'fail',
        content: error instanceof Error ? error.message : '登录失败',
      });
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
