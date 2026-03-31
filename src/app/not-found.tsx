/**
 * 全站通用 404（游戏盒子风格）
 * Next.js App Router：访问不存在的路由时自动展示
 */

import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '页面未找到',
  description: '您访问的页面不存在或已搬家',
};

export default function NotFound() {
  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center px-6"
      style={{
        background: 'linear-gradient(to bottom, #f3e8ff 0%, #ffedd4 50%, #fef7ff 100%)',
        paddingTop: 'max(1.25rem, env(safe-area-inset-top, 0px))',
        paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="w-full max-w-md text-center flex flex-col items-center gap-6 animate-fade-in-up">
        <div
          className="text-[72px] leading-none select-none"
          aria-hidden
        >
          🎮
        </div>

        <div className="space-y-2">
          <p
            className="text-[56px] font-black leading-none tracking-tight"
            style={{
              background: 'linear-gradient(90deg, #9810fa 0%, #e60076 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            404
          </p>
          <h1 className="text-xl font-black text-[#1e2939]">页面走丢啦</h1>
          <p className="text-sm font-medium text-[#6a7282] leading-relaxed px-2">
            这个关卡还没解锁，可能链接有误或页面已搬家。回大厅选个游戏吧～
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center min-h-[48px] px-8 rounded-2xl font-black text-white shadow-lg active:scale-95 transition-transform touch-manipulation"
            style={{
              backgroundImage: 'linear-gradient(135deg, #ad46ff 0%, #f6339a 100%)',
              boxShadow: '0 10px 25px -5px rgba(173, 70, 255, 0.35)',
            }}
          >
            返回首页
          </Link>
          <Link
            href="/mine"
            className="inline-flex items-center justify-center min-h-[48px] px-8 rounded-2xl font-bold text-[#6a7282] bg-white/90 border-2 border-[#e9d4ff] shadow-md active:scale-95 transition-transform touch-manipulation"
          >
            我的
          </Link>
        </div>

        <p className="text-xs text-[#99a1af]">游戏盒子 · GameBox</p>
      </div>
    </div>
  );
}
