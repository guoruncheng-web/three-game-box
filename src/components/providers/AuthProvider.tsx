/**
 * 认证 Provider - 用于在应用启动时恢复认证状态
 */

'use client';

import { useEffect } from 'react';
import { useAuth } from '@/stores/authHooks';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initialize } = useAuth();

  useEffect(() => {
    // 初始化认证状态
    initialize();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
