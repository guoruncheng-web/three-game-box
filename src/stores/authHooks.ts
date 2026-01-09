/**
 * 认证相关的 Redux Hooks
 */

import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from './gameStore';
import {
  setLoading,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
  setUser,
  setToken,
  setError,
  restoreAuth,
} from './authStore';
import type { LoginRequest, RegisterRequest, PublicUser } from '@/types/auth';
import type { ApiResponse, LoginResponse } from '@/types/auth';

/**
 * 使用认证状态
 */
export function useAuth() {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  /**
   * 登录
   */
  const login = async (credentials: LoginRequest): Promise<void> => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const result: ApiResponse<LoginResponse> = await response.json();

      if (result.code === 200 && result.data) {
        dispatch(loginSuccess(result.data));
      } else {
        dispatch(loginFailure(result.message || '登录失败'));
        throw new Error(result.message || '登录失败');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '登录失败';
      dispatch(loginFailure(message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  /**
   * 注册
   */
  const register = async (userData: RegisterRequest): Promise<void> => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result: ApiResponse<LoginResponse> = await response.json();

      if (result.code === 200 && result.data) {
        dispatch(loginSuccess(result.data));
      } else {
        dispatch(loginFailure(result.message || '注册失败'));
        throw new Error(result.message || '注册失败');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '注册失败';
      dispatch(loginFailure(message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  /**
   * 登出
   */
  const logout = async (): Promise<void> => {
    try {
      // 调用登出 API
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
        },
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // 无论 API 调用是否成功，都清除本地状态
      dispatch(logoutAction());
    }
  };

  /**
   * 获取当前用户信息
   */
  const fetchCurrentUser = async (): Promise<PublicUser | null> => {
    if (!auth.token) {
      return null;
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${auth.token}`,
        },
      });

      const result: ApiResponse<PublicUser> = await response.json();

      if (result.code === 200 && result.data) {
        dispatch(setUser(result.data));
        return result.data;
      } else {
        // Token 无效，清除状态
        dispatch(logoutAction());
        return null;
      }
    } catch (error) {
      console.error('Fetch user error:', error);
      dispatch(logoutAction());
      return null;
    }
  };

  /**
   * 恢复认证状态（从 localStorage）
   */
  const restore = () => {
    dispatch(restoreAuth());
  };

  return {
    ...auth,
    login,
    register,
    logout,
    fetchCurrentUser,
    restore,
  };
}
