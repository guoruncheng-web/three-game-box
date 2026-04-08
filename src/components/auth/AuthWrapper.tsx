/**
 * 全局认证包裹组件
 * 未登录用户访问受保护页面时自动跳转到登录页
 * 白名单页面（登录、注册）不受限制
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/stores/authHooks';

// 无需登录即可访问的页面路径
const PUBLIC_PATHS = ['/login', '/register'];

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isInitialized } = useAuth();

  // 当前页面是否为公开页面
  const isPublicPage = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (isInitialized && !isAuthenticated && !isPublicPage) {
      router.replace('/login');
    }
  }, [isInitialized, isAuthenticated, isPublicPage, router]);

  // 公开页面直接渲染
  if (isPublicPage) {
    return <>{children}</>;
  }

  // 未初始化时显示加载状态
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f3e8ff] via-[#fef3c7] to-[#ffedd4]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
          <span className="text-gray-500 text-sm">加载中...</span>
        </div>
      </div>
    );
  }

  // 未登录时不渲染内容（等待跳转）
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
