/**
 * Next.js Middleware
 * 拦截未认证的 API 请求（登录/注册接口除外）
 * 注意：页面级认证由 AuthWrapper 组件处理（因为 token 存在 localStorage）
 */

import { NextRequest, NextResponse } from 'next/server';

// 无需认证的 API 路径
const PUBLIC_API_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/test-connection',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 仅拦截 API 路由
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 公开 API 直接放行
  if (PUBLIC_API_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 检查 Authorization header
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { code: 401, message: '未登录，请先登录', data: null },
      { status: 401 }
    );
  }

  // Token 存在则放行（具体验证由各 API 路由内部完成）
  return NextResponse.next();
}

export const config = {
  // 仅匹配 API 路由
  matcher: '/api/:path*',
};
