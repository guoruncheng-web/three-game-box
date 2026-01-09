/**
 * 登录页面 - 基于 Figma 设计
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Checkbox } from 'antd-mobile';
import { useAuth } from '@/stores/authHooks';
import { useEffect } from 'react';
import { useToast } from '@/components/toast';
import type { LoginRequest } from '@/types/auth';
import Link from 'next/link';
import Image from 'next/image';

// 登录页面图标资源（从 Figma 导出）
const iconStar = "/images/login/icon-star.svg";
const iconDecor1 = "/images/login/icon-decor1.svg";
const iconDecor2 = "/images/login/icon-decor2.svg";
const iconDecor3 = "/images/login/icon-decor3.svg";
const iconStarSmall = "/images/login/icon-star-small.svg";
const iconGamepad = "/images/login/icon-gamepad.svg";
const iconWechat = "/images/login/icon-wechat.svg";
const iconQQ = "/images/login/icon-qq.svg";
const iconWeibo = "/images/login/icon-weibo.svg";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // 如果已登录，跳转到首页
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 详细验证各个字段
    const missingFields: string[] = [];

    if (!formData.username) missingFields.push('手机号/邮箱');
    if (!formData.password) missingFields.push('密码');

    if (missingFields.length > 0) {
      showToast('warning', `请填写：${missingFields.join('、')}`, '📝');
      return;
    }

    setSubmitting(true);
    try {
      await login(formData);
      showToast('success', '登录成功，欢迎回来！', '🎉');
      router.push('/');
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : '登录失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocialLogin = (type: 'wechat' | 'qq' | 'weibo') => {
    showToast('info', `${type === 'wechat' ? '微信' : type === 'qq' ? 'QQ' : '微博'}登录功能开发中`, '🚧');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#74d4ff] to-[#fda5d5] relative overflow-hidden">
      {/* 背景装饰元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 左上角云朵装饰 */}
        <div className="absolute left-5 top-7 w-16 h-10 animate-float">
          <div className="absolute bg-white/90 h-10 left-0 rounded-full top-0 w-16 shadow-lg" />
          <div className="absolute bg-white/90 h-8 left-[-16px] rounded-full top-2 w-12 shadow-lg" />
          <div className="absolute bg-white/90 h-8 left-8 rounded-full top-2 w-10 shadow-lg" />
        </div>

        {/* 右上角云朵装饰 */}
        <div className="absolute right-5 top-[118px] w-12 h-8 animate-float-delayed">
          <div className="absolute bg-white/80 h-8 left-0 rounded-full top-0 w-12 shadow-lg" />
          <div className="absolute bg-white/80 h-6 left-[-12px] rounded-full top-1 w-10 shadow-lg" />
          <div className="absolute bg-white/80 h-6 left-6 rounded-full top-1 w-8 shadow-lg" />
        </div>

        {/* 星星装饰 */}
        <div className="absolute right-[260px] top-[53px] w-7 h-7 rotate-[175deg] animate-float-rotate">
          <Image src={iconStar} alt="" width={28} height={28} className="w-full h-full" />
        </div>

        {/* 其他装饰图标 - 添加动画 */}
        <div className="absolute left-10 bottom-[176px] w-4 h-4 animate-bounce-fun">
          <Image src={iconDecor1} alt="" width={16} height={16} className="w-full h-full" />
        </div>
        <div className="absolute right-[68px] top-[288px] w-5 h-5 animate-swing">
          <Image src={iconDecor2} alt="" width={20} height={20} className="w-full h-full" />
        </div>
        <div className="absolute left-[63px] top-[573px] w-[22px] h-[22px] rotate-[357deg] animate-wiggle-fun">
          <Image src={iconDecor3} alt="" width={22} height={22} className="w-full h-full" />
        </div>

        {/* 额外的漂浮装饰 */}
        <div className="absolute top-40 left-10 text-2xl animate-float-slow">🌟</div>
        <div className="absolute bottom-1/3 right-16 text-3xl animate-swing">💖</div>
        <div className="absolute top-1/2 left-1/4 text-2xl animate-float-delayed">🎈</div>
        <div className="absolute top-2/3 right-1/4 text-2xl animate-bounce-fun">🎮</div>

        {/* 彩色圆点装饰 */}
        <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-yellow-400 rounded-full animate-pulse-soft"></div>
        <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-pink-400 rounded-full animate-pulse-soft" style={{ animationDelay: '0.3s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-blue-400 rounded-full animate-pulse-soft" style={{ animationDelay: '0.7s' }}></div>
      </div>

      {/* 主内容区域 */}
      <div className="relative z-10 flex flex-col items-center px-4 py-4 min-h-screen">
        {/* Logo 和标题区域 */}
        <div className="w-full max-w-[362px] mb-6 relative h-[192px] animate-slide-down">
          {/* Logo 圆形图标 */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-24 h-24 rounded-full shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] animate-bounce-gentle hover:scale-110 hover:rotate-12 transition-all duration-300 relative"
            style={{ backgroundImage: 'linear-gradient(135deg, rgb(253, 199, 0) 0%, rgb(255, 105, 0) 100%)' }}>
            <div className="absolute inset-0 bg-white/30 rounded-full animate-ping-slow"></div>
            <div className="absolute right-[-24px] top-[-8px] w-6 h-6 z-10 animate-pulse">
              <Image src={iconStarSmall} alt="" width={24} height={24} className="w-full h-full" />
            </div>
            <div className="absolute left-5 top-5 w-14 h-14 z-10">
              <Image src={iconGamepad} alt="" width={56} height={56} className="w-full h-full" />
            </div>
          </div>

          {/* 标题 */}
          <div className="absolute left-0 top-[112px] w-full flex items-center justify-center">
            <h1 className="text-[48px] font-black leading-[48px] text-white text-center whitespace-nowrap tracking-[0.35px]" style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.1)' }}>
              🎮 游戏盒子
            </h1>
          </div>

          {/* 副标题 */}
          <div className="absolute left-0 top-[168px] w-full">
            <p className="text-base font-medium leading-6 text-white text-center whitespace-nowrap tracking-[-0.31px] animate-fade-in">
              开启你的快乐冒险时光 ✨
            </p>
          </div>
        </div>

        {/* 登录表单卡片 */}
        <div className="w-full max-w-[362px] bg-white rounded-[24px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] relative overflow-hidden animate-slide-up backdrop-blur-sm">
          {/* 装饰性渐变圆圈 */}
          <div className="absolute right-[-40px] top-[-40px] w-32 h-32 rounded-full opacity-50 animate-float-slow"
            style={{ backgroundImage: 'linear-gradient(135deg, rgb(233, 212, 255) 0%, rgb(252, 206, 232) 100%)' }} />
          <div className="absolute left-[-40px] bottom-[88px] w-32 h-32 rounded-full opacity-50 animate-float-delayed"
            style={{ backgroundImage: 'linear-gradient(135deg, rgb(190, 219, 255) 0%, rgb(162, 244, 253) 100%)' }} />

          <form onSubmit={handleSubmit} className="p-8 relative z-10">
            {/* 表单字段 */}
            <div className="flex flex-col gap-5 mb-5">
              {/* 手机号/邮箱输入 */}
              <div className="flex flex-col gap-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <label className="h-7 flex items-center">
                  <span className="text-lg font-bold text-[#364153] mr-2 animate-wiggle-gentle">📱</span>
                  <span className="text-sm font-bold text-[#364153] tracking-[-0.15px]">手机号/邮箱</span>
                </label>
                <Input
                  type="text"
                  placeholder="输入你的账号吧~ 📱"
                  value={formData.username}
                  onChange={(val) => setFormData({ ...formData, username: val })}
                  className="!h-[60px] !rounded-2xl !border-2 !border-[#e9d4ff] !bg-gradient-to-r !from-[#faf5ff] !to-[#fdf2f8] !px-5 !text-base !text-[#99a1af] hover:!border-purple-300 focus:!border-purple-400 focus:!scale-[1.02] transition-all duration-300 focus:!shadow-lg placeholder:!text-gray-400"
                  style={{
                    background: 'linear-gradient(to right, #faf5ff, #fdf2f8)',
                  }}
                />
              </div>

              {/* 密码输入 */}
              <div className="flex flex-col gap-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <label className="h-7 flex items-center">
                  <span className="text-lg font-bold text-[#364153] mr-2 animate-wiggle-gentle" style={{ animationDelay: '0.15s' }}>🔐</span>
                  <span className="text-sm font-bold text-[#364153] tracking-[-0.15px]">密码</span>
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="输入你的密码吧~ 🔐"
                    value={formData.password}
                    onChange={(val) => setFormData({ ...formData, password: val })}
                    className="!h-[60px] !rounded-2xl !border-2 !border-[#bedbff] !bg-gradient-to-r !from-[#eff6ff] !to-[#ecfeff] !px-5 !pr-12 !text-base !text-[#99a1af] hover:!border-blue-300 focus:!border-blue-400 focus:!scale-[1.02] transition-all duration-300 focus:!shadow-lg placeholder:!text-gray-400"
                    style={{
                      background: 'linear-gradient(to right, #eff6ff, #ecfeff)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-[#99a1af] hover:text-gray-600 transition-all hover:scale-125 transform duration-200"
                  >
                    <span className="inline-block hover:animate-bounce-once">{showPassword ? '👁️' : '🙈'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 记住我和忘记密码 */}
            <div className="flex items-center justify-between mb-5 pt-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Checkbox
                checked={rememberMe}
                onChange={setRememberMe}
                className="!text-sm !font-medium !text-[#4a5565] hover:scale-110 transition-transform"
              >
                记住我 💝
              </Checkbox>
              <button
                type="button"
                onClick={() => showToast('info', '忘记密码功能开发中', '🚧')}
                className="text-sm font-bold text-[#9810fa] tracking-[-0.15px] hover:scale-105 transition-all transform"
              >
                忘记密码？
              </button>
            </div>

            {/* 登录按钮 */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Button
                type="submit"
                block
                loading={submitting || isLoading}
                disabled={submitting || isLoading}
                className="!h-[60px] !rounded-2xl !text-lg !font-black !text-white !shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] hover:!shadow-2xl hover:!scale-[1.05] active:!scale-95 transition-all duration-300 relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(to right, #ad46ff, #ff6900)',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  开始游戏 🚀
                </span>
              </Button>
            </div>
          </form>

          {/* 快速登录分隔线 */}
          <div className="relative px-8 mb-5 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="h-[2px] bg-[#e5e7eb] w-full border-dashed" />
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-white px-4">
              <p className="text-sm font-bold text-[#6a7282] tracking-[-0.15px] whitespace-nowrap">
                快速登录 ⚡
              </p>
            </div>
          </div>

          {/* 第三方登录按钮 */}
          <div className="px-8 pb-5 flex gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            {/* 微信登录 */}
            <button
              type="button"
              onClick={() => handleSocialLogin('wechat')}
              className="flex flex-col items-center justify-center gap-1 h-[84px] w-[89px] rounded-2xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] hover:shadow-xl hover:scale-110 hover:rotate-3 active:scale-95 active:rotate-0 transition-all duration-300 group"
              style={{
                background: 'linear-gradient(136.545deg, rgb(220, 252, 231) 0%, rgb(185, 248, 207) 100%)',
              }}
            >
              <Image src={iconWechat} alt="微信" width={32} height={32} className="w-8 h-8 group-hover:animate-wiggle-subtle" />
              <span className="text-xs font-bold text-[#00a63e]">微信</span>
            </button>

            {/* QQ 登录 */}
            <button
              type="button"
              onClick={() => handleSocialLogin('qq')}
              className="flex flex-col items-center justify-center gap-1 h-[84px] w-[89px] rounded-2xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] hover:shadow-xl hover:scale-110 hover:-rotate-3 active:scale-95 active:rotate-0 transition-all duration-300 group"
              style={{
                background: 'linear-gradient(136.545deg, rgb(219, 234, 254) 0%, rgb(190, 219, 255) 100%)',
              }}
            >
              <Image src={iconQQ} alt="QQ" width={32} height={32} className="w-8 h-8 group-hover:animate-wiggle-subtle" />
              <span className="text-xs font-bold text-[#155dfc]">QQ</span>
            </button>

            {/* 微博登录 */}
            <button
              type="button"
              onClick={() => handleSocialLogin('weibo')}
              className="flex flex-col items-center justify-center gap-1 h-[84px] w-[89px] rounded-2xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] hover:shadow-xl hover:scale-110 hover:rotate-3 active:scale-95 active:rotate-0 transition-all duration-300 group"
              style={{
                background: 'linear-gradient(136.545deg, rgb(255, 226, 226) 0%, rgb(255, 201, 201) 100%)',
              }}
            >
              <Image src={iconWeibo} alt="微博" width={32} height={32} className="w-8 h-8 group-hover:animate-wiggle-subtle" />
              <span className="text-xs font-bold text-[#e7000b]">微博</span>
            </button>
          </div>

        </div>

        {/* 用户协议和隐私政策 */}
        <div className="mt-4 text-center animate-fade-in delay-800">
          <p className="text-xs font-medium text-white tracking-[-0.31px]">
            登录即表示同意{' '}
            <button
              type="button"
              onClick={() => showToast('info', '用户协议功能开发中', '🚧')}
              className="text-xs font-bold text-white underline hover:text-yellow-200 transition-colors"
            >
              用户协议
            </button>
            {' '}和{' '}
            <button
              type="button"
              onClick={() => showToast('info', '隐私政策功能开发中', '🚧')}
              className="text-xs font-bold text-white underline hover:text-yellow-200 transition-colors"
            >
              隐私政策
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
