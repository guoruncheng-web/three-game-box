/**
 * 认证状态管理 - Redux Toolkit
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { PublicUser, LoginResponse } from '@/types/auth';

/** 认证 Slice 状态 */
interface AuthState {
  // 用户信息
  user: PublicUser | null;
  token: string | null;
  
  // 加载状态
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // 错误信息
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

/** 认证 Slice */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 设置加载状态
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // 登录成功
    loginSuccess: (state, action: PayloadAction<LoginResponse>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      
      // 保存到 localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      }
    },

    // 登录失败
    loginFailure: (state, action: PayloadAction<string>) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = action.payload;
    },

    // 登出
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      
      // 清除 localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },

    // 设置用户信息
    setUser: (state, action: PayloadAction<PublicUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },

    // 设置 Token
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },

    // 设置错误
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // 从 localStorage 恢复状态
    restoreAuth: (state) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          try {
            state.token = token;
            state.user = JSON.parse(userStr);
            state.isAuthenticated = true;
          } catch (error) {
            console.error('Failed to restore auth state:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      }
    },
  },
});

// 导出 actions
export const {
  setLoading,
  loginSuccess,
  loginFailure,
  logout,
  setUser,
  setToken,
  setError,
  restoreAuth,
} = authSlice.actions;

// 导出 reducer
export default authSlice.reducer;
