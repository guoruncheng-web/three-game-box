/**
 * 注册页面
 */

'use client';

import { RegisterForm } from '@/components/auth/RegisterForm';
import { useRouter } from 'next/navigation';
import { Button } from 'antd-mobile';
import { useAuth } from '@/stores/authHooks';
import { useEffect } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // 如果已登录，跳转到首页
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--bg-primary)]">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            🎮 游戏盒子
          </h1>
          <p className="text-[var(--text-secondary)]">
            创建新账户
          </p>
        </div>

        <RegisterForm />

        <div className="mt-6 text-center">
          <p className="text-[var(--text-secondary)] text-sm">
            已有账户？{' '}
            <Button
              fill="none"
              size="small"
              onClick={() => router.push('/login')}
              className="!text-[var(--game-primary)] !p-0 !h-auto"
            >
              立即登录
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
