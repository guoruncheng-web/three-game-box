/**
 * 注册表单组件
 */

'use client';

import { useState } from 'react';
import { Button, Input, Form } from 'antd-mobile';
import { useAuth } from '@/stores/authHooks';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/toast';
import type { RegisterRequest } from '@/types/auth';

export function RegisterForm() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const { showToast } = useToast();
  const [form] = Form.useForm<RegisterRequest & { confirmPassword: string }>();

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: any) => {
    // 详细验证各个字段
    const missingFields: string[] = [];

    if (!values.username) missingFields.push('用户名');
    if (!values.email) missingFields.push('邮箱');
    if (!values.password) missingFields.push('密码');
    if (!values.confirmPassword) missingFields.push('确认密码');

    if (missingFields.length > 0) {
      showToast('warning', `请填写：${missingFields.join('、')}`, '📝');
      return;
    }

    // 验证用户名长度
    if (values.username.length < 3) {
      showToast('warning', '用户名至少需要 3 个字符', '📏');
      return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(values.email)) {
      showToast('warning', '请输入有效的邮箱地址', '📧');
      return;
    }

    // 验证密码长度
    if (values.password.length < 8) {
      showToast('warning', '密码至少需要 8 个字符', '🔒');
      return;
    }

    // 验证密码强度
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)/;
    if (!passwordRegex.test(values.password)) {
      showToast('warning', '密码必须包含字母和数字', '🔐');
      return;
    }

    // 验证密码确认
    if (values.password !== values.confirmPassword) {
      showToast('warning', '两次输入的密码不一致', '❌');
      return;
    }

    setSubmitting(true);
    try {
      const { confirmPassword, email, ...registerData } = values;
      // 将 email 字段映射为 contact
      const dataToSubmit: RegisterRequest = {
        ...registerData,
        contact: email,
      };
      await register(dataToSubmit);
      showToast('success', '注册成功，欢迎加入！', '🎉');
      router.push('/');
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : '注册失败，请重试');
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
