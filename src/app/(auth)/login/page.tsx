/**
 * 登录页面 - 基于 Figma 设计
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Toast, Checkbox } from 'antd-mobile';
import { useAuth } from '@/stores/authHooks';
import { useEffect } from 'react';
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

    if (!formData.username || !formData.password) {
      Toast.show({
        icon: 'fail',
        content: '请填写完整信息',
      });
      return;
    }

    setSubmitting(true);
    try {
      await login(formData);
      Toast.show({
        icon: 'success',
        content: '登录成功',
      });
      router.push('/');
    } catch (error) {
      Toast.show({
        icon: 'fail',
        content: error instanceof Error ? error.message : '登录失败',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocialLogin = (type: 'wechat' | 'qq' | 'weibo') => {
    Toast.show({
      icon: 'fail',
      content: `${type === 'wechat' ? '微信' : type === 'qq' ? 'QQ' : '微博'}登录功能开发中`,
    });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#74d4ff] to-[#fda5d5] relative overflow-hidden">
      {/* 背景装饰元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 左上角云朵装饰 */}
        <div className="absolute left-5 top-7 w-16 h-10">
          <div className="absolute bg-white/90 h-10 left-0 rounded-full top-0 w-16" />
          <div className="absolute bg-white/90 h-8 left-[-16px] rounded-full top-2 w-12" />
          <div className="absolute bg-white/90 h-8 left-8 rounded-full top-2 w-10" />
        </div>

        {/* 右上角云朵装饰 */}
        <div className="absolute right-5 top-[118px] w-12 h-8">
          <div className="absolute bg-white/80 h-8 left-0 rounded-full top-0 w-12" />
          <div className="absolute bg-white/80 h-6 left-[-12px] rounded-full top-1 w-10" />
          <div className="absolute bg-white/80 h-6 left-6 rounded-full top-1 w-8" />
        </div>

        {/* 星星装饰 */}
        <div className="absolute right-[260px] top-[53px] w-7 h-7 rotate-[175deg]">
          <Image src={iconStar} alt="" width={28} height={28} className="w-full h-full" />
        </div>

        {/* 其他装饰图标 */}
        <div className="absolute left-10 bottom-[176px] w-4 h-4">
          <Image src={iconDecor1} alt="" width={16} height={16} className="w-full h-full" />
        </div>
        <div className="absolute right-[68px] top-[288px] w-5 h-5">
          <Image src={iconDecor2} alt="" width={20} height={20} className="w-full h-full" />
        </div>
        <div className="absolute left-[63px] top-[573px] w-[22px] h-[22px] rotate-[357deg]">
          <Image src={iconDecor3} alt="" width={22} height={22} className="w-full h-full" />
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="relative z-10 flex flex-col items-center px-4 py-4 min-h-screen">
        {/* Logo 和标题区域 */}
        <div className="w-full max-w-[362px] mb-6 relative h-[192px]">
          {/* Logo 圆形图标 */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-24 h-24 rounded-full shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]"
            style={{ backgroundImage: 'linear-gradient(135deg, rgb(253, 199, 0) 0%, rgb(255, 105, 0) 100%)' }}>
            <div className="absolute right-[-24px] top-[-8px] w-6 h-6">
              <Image src={iconStarSmall} alt="" width={24} height={24} className="w-full h-full" />
            </div>
            <div className="absolute left-5 top-5 w-14 h-14">
              <Image src={iconGamepad} alt="" width={56} height={56} className="w-full h-full" />
            </div>
          </div>

          {/* 标题 */}
          <div className="absolute left-0 top-[112px] w-full flex items-center justify-center">
            <h1 className="text-[48px] font-black leading-[48px] text-white text-center whitespace-nowrap tracking-[0.35px]">
              🎮 游戏盒子
            </h1>
          </div>

          {/* 副标题 */}
          <div className="absolute left-0 top-[168px] w-full">
            <p className="text-base font-medium leading-6 text-white text-center whitespace-nowrap tracking-[-0.31px]">
              开启你的快乐冒险时光 ✨
            </p>
          </div>
        </div>

        {/* 登录表单卡片 */}
        <div className="w-full max-w-[362px] bg-white rounded-[24px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] relative overflow-hidden">
          {/* 装饰性渐变圆圈 */}
          <div className="absolute right-[-40px] top-[-40px] w-32 h-32 rounded-full opacity-50"
            style={{ backgroundImage: 'linear-gradient(135deg, rgb(233, 212, 255) 0%, rgb(252, 206, 232) 100%)' }} />
          <div className="absolute left-[-40px] bottom-[88px] w-32 h-32 rounded-full opacity-50"
            style={{ backgroundImage: 'linear-gradient(135deg, rgb(190, 219, 255) 0%, rgb(162, 244, 253) 100%)' }} />

          <form onSubmit={handleSubmit} className="p-8 relative z-10">
            {/* 表单字段 */}
            <div className="flex flex-col gap-5 mb-5">
              {/* 手机号/邮箱输入 */}
              <div className="flex flex-col gap-2">
                <label className="h-7 flex items-center">
                  <span className="text-lg font-bold text-[#364153] mr-2">📱</span>
                  <span className="text-sm font-bold text-[#364153] tracking-[-0.15px]">手机号/邮箱</span>
                </label>
                <Input
                  type="text"
                  placeholder="输入你的账号吧~ 📱"
                  value={formData.username}
                  onChange={(val) => setFormData({ ...formData, username: val })}
                  className="!h-[60px] !rounded-2xl !border-2 !border-[#e9d4ff] !bg-gradient-to-r !from-[#faf5ff] !to-[#fdf2f8] !px-5 !text-base !text-[#99a1af]"
                  style={{
                    background: 'linear-gradient(to right, #faf5ff, #fdf2f8)',
                  }}
                />
              </div>

              {/* 密码输入 */}
              <div className="flex flex-col gap-2">
                <label className="h-7 flex items-center">
                  <span className="text-lg font-bold text-[#364153] mr-2">🔐</span>
                  <span className="text-sm font-bold text-[#364153] tracking-[-0.15px]">密码</span>
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="输入你的密码吧~ 🔐"
                    value={formData.password}
                    onChange={(val) => setFormData({ ...formData, password: val })}
                    className="!h-[60px] !rounded-2xl !border-2 !border-[#bedbff] !bg-gradient-to-r !from-[#eff6ff] !to-[#ecfeff] !px-5 !pr-12 !text-base !text-[#99a1af]"
                    style={{
                      background: 'linear-gradient(to right, #eff6ff, #ecfeff)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-[#99a1af]"
                  >
                    🙈
                  </button>
                </div>
              </div>
            </div>

            {/* 记住我和忘记密码 */}
            <div className="flex items-center justify-between mb-5">
              <Checkbox
                checked={rememberMe}
                onChange={setRememberMe}
                className="!text-sm !font-medium !text-[#4a5565]"
              >
                记住我 💝
              </Checkbox>
              <button
                type="button"
                onClick={() => Toast.show({ icon: 'fail', content: '忘记密码功能开发中' })}
                className="text-sm font-bold text-[#9810fa] tracking-[-0.15px]"
              >
                忘记密码？
              </button>
            </div>

            {/* 登录按钮 */}
            <Button
              type="submit"
              block
              loading={submitting || isLoading}
              disabled={submitting || isLoading}
              className="!h-[60px] !rounded-2xl !text-lg !font-black !text-white !shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]"
              style={{
                background: 'linear-gradient(to right, #ad46ff, #ff6900)',
              }}
            >
              开始游戏 🚀
            </Button>
          </form>

          {/* 快速登录分隔线 */}
          <div className="relative px-8 mb-5">
            <div className="h-[2px] bg-[#e5e7eb] w-full" />
            <div className="absolute left-1/2 top-0 -translate-x-1/2 bg-white px-4">
              <p className="text-sm font-bold text-[#6a7282] tracking-[-0.15px] whitespace-nowrap">
                快速登录 ⚡
              </p>
            </div>
          </div>

          {/* 第三方登录按钮 */}
          <div className="px-8 pb-5 flex gap-4 justify-center">
            {/* 微信登录 */}
            <button
              type="button"
              onClick={() => handleSocialLogin('wechat')}
              className="flex flex-col items-center justify-center gap-1 h-[84px] w-[89px] rounded-2xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]"
              style={{
                background: 'linear-gradient(136.545deg, rgb(220, 252, 231) 0%, rgb(185, 248, 207) 100%)',
              }}
            >
              <Image src={iconWechat} alt="微信" width={32} height={32} className="w-8 h-8" />
              <span className="text-xs font-bold text-[#00a63e]">微信</span>
            </button>

            {/* QQ 登录 */}
            <button
              type="button"
              onClick={() => handleSocialLogin('qq')}
              className="flex flex-col items-center justify-center gap-1 h-[84px] w-[89px] rounded-2xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]"
              style={{
                background: 'linear-gradient(136.545deg, rgb(219, 234, 254) 0%, rgb(190, 219, 255) 100%)',
              }}
            >
              <Image src={iconQQ} alt="QQ" width={32} height={32} className="w-8 h-8" />
              <span className="text-xs font-bold text-[#155dfc]">QQ</span>
            </button>

            {/* 微博登录 */}
            <button
              type="button"
              onClick={() => handleSocialLogin('weibo')}
              className="flex flex-col items-center justify-center gap-1 h-[84px] w-[89px] rounded-2xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]"
              style={{
                background: 'linear-gradient(136.545deg, rgb(255, 226, 226) 0%, rgb(255, 201, 201) 100%)',
              }}
            >
              <Image src={iconWeibo} alt="微博" width={32} height={32} className="w-8 h-8" />
              <span className="text-xs font-bold text-[#e7000b]">微博</span>
            </button>
          </div>

          {/* 注册链接 */}
          <div className="px-8 pb-6 text-center">
            <p className="text-base font-medium text-[#4a5565] tracking-[-0.31px]">
              还没有账号？{' '}
              <Link href="/register" className="text-base font-black text-[#9810fa]">
                立即注册 ➡️
              </Link>
            </p>
          </div>
        </div>

        {/* 用户协议和隐私政策 */}
        <div className="mt-4 text-center">
          <p className="text-xs font-medium text-white tracking-[-0.31px]">
            登录即表示同意{' '}
            <button
              type="button"
              onClick={() => Toast.show({ icon: 'fail', content: '用户协议功能开发中' })}
              className="text-xs font-bold text-white underline"
            >
              用户协议
            </button>
            {' '}和{' '}
            <button
              type="button"
              onClick={() => Toast.show({ icon: 'fail', content: '隐私政策功能开发中' })}
              className="text-xs font-bold text-white underline"
            >
              隐私政策
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
