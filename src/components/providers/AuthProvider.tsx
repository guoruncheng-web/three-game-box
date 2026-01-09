/**
 * 认证 Provider - 用于在应用启动时恢复认证状态
 */

'use client';

import { useEffect } from 'react';
import { useAuth } from '@/stores/authHooks';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { restore, fetchCurrentUser, token } = useAuth();

  useEffect(() => {
    // 从 localStorage 恢复认证状态
    restore();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // 如果有 token，验证并获取用户信息
    if (token) {
      fetchCurrentUser().catch((error) => {
        console.error('Failed to fetch current user:', error);
      });
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
