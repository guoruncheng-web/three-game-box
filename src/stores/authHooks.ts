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
  setInitialized,
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

    // 创建 AbortController 用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 秒超时

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // 如果响应状态不是 2xx，尝试解析错误信息
        let errorMessage = '登录失败';
        try {
          const errorResult: ApiResponse = await response.json();
          errorMessage = errorResult.message || '登录失败';
        } catch (parseError) {
          // JSON 解析失败，使用默认错误信息
          errorMessage = `请求失败: ${response.status} ${response.statusText}`;
        }
        dispatch(loginFailure(errorMessage));
        throw new Error(errorMessage);
      }

      const result: ApiResponse<LoginResponse> = await response.json();

      if (result.code === 200 && result.data) {
        dispatch(loginSuccess(result.data));
      } else {
        dispatch(loginFailure(result.message || '登录失败'));
        throw new Error(result.message || '登录失败');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      let message = '登录失败';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          message = '请求超时，请检查网络连接后重试';
        } else {
          message = error.message;
        }
      }
      
      dispatch(loginFailure(message));
      throw new Error(message);
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
        // 后端已经返回友好的错误消息，直接使用
        const errorMessage = result.message || '注册失败';
        dispatch(loginFailure(errorMessage));
        throw new Error(errorMessage);
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

  /**
   * 初始化认证状态
   */
  const initialize = async (): Promise<void> => {
    try {
      // 从 localStorage 恢复状态
      restore();

      // 读取 localStorage 中的 token
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      // 如果有 token，验证并获取用户信息
      if (storedToken) {
        await fetchCurrentUser();
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    } finally {
      // 无论成功或失败，都标记为已初始化
      dispatch(setInitialized(true));
    }
  };

  /**
   * 更新用户信息
   */
  const updateProfile = async (profileData: {
    nickname?: string;
    email?: string;
    phone?: string;
    avatar_url?: string;
  }): Promise<PublicUser> => {
    if (!auth.token) {
      throw new Error('未登录');
    }

    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`,
        },
        body: JSON.stringify(profileData),
      });

      const result: ApiResponse<PublicUser> = await response.json();

      if (result.code === 200 && result.data) {
        dispatch(setUser(result.data));

        // 更新 localStorage 中的用户信息
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(result.data));
        }

        return result.data;
      } else {
        const errorMessage = result.message || '更新失败';
        dispatch(setError(errorMessage));
        throw new Error(errorMessage);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '更新失败';
      dispatch(setError(message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    ...auth,
    login,
    register,
    logout,
    fetchCurrentUser,
    restore,
    initialize,
    updateProfile,
  };
}
