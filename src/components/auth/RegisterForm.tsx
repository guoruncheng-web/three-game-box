/**
 * 注册表单组件
 */

'use client';

import { useState } from 'react';
import { Button, Input, Form, Toast } from 'antd-mobile';
import { useAuth } from '@/stores/authHooks';
import { useRouter } from 'next/navigation';
import type { RegisterRequest } from '@/types/auth';

export function RegisterForm() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const [form] = Form.useForm<RegisterRequest & { confirmPassword: string }>();

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: RegisterRequest & { confirmPassword: string }) => {
    // 验证密码确认
    if (values.password !== values.confirmPassword) {
      Toast.show({
        icon: 'fail',
        content: '两次输入的密码不一致',
      });
      return;
    }

    setSubmitting(true);
    try {
      const { confirmPassword, ...registerData } = values;
      await register(registerData);
      Toast.show({
        icon: 'success',
        content: '注册成功',
      });
      router.push('/');
    } catch (error) {
      Toast.show({
        icon: 'fail',
        content: error instanceof Error ? error.message : '注册失败',
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
          注册
        </Button>
      }
    >
      <Form.Header>注册</Form.Header>
      
      <Form.Item
        name="username"
        label="用户名"
        rules={[
          { required: true, message: '请输入用户名' },
          { min: 3, message: '用户名至少 3 位' },
          { max: 50, message: '用户名最多 50 位' },
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
        <Input type="email" placeholder="请输入邮箱" clearable />
      </Form.Item>

      <Form.Item
        name="nickname"
        label="昵称"
        rules={[
          { max: 50, message: '昵称最多 50 位' },
        ]}
      >
        <Input placeholder="请输入昵称（可选）" clearable />
      </Form.Item>

      <Form.Item
        name="password"
        label="密码"
        rules={[
          { required: true, message: '请输入密码' },
          { min: 8, message: '密码至少 8 位' },
          {
            pattern: /^(?=.*[a-zA-Z])(?=.*\d)/,
            message: '密码必须包含至少一个字母和一个数字',
          },
        ]}
      >
        <Input type="password" placeholder="请输入密码" clearable />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        label="确认密码"
        rules={[
          { required: true, message: '请确认密码' },
        ]}
      >
        <Input type="password" placeholder="请再次输入密码" clearable />
      </Form.Item>
    </Form>
  );
}
