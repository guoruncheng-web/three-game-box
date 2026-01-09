'use client';

/**
 * 客户端初始化组件
 * 必须在所有其他客户端组件之前加载，以确保 polyfill 生效
 */

// 立即执行 polyfill（在模块加载时就执行）
import '@/lib/react-19-polyfill';

export function ClientInit({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
