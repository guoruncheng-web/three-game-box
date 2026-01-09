/**
 * 注册页面 - 基于 Figma 设计
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Toast, Checkbox } from 'antd-mobile';
import { useAuth } from '@/stores/authHooks';
import { useEffect } from 'react';
import type { RegisterRequest } from '@/types/auth';
import Link from 'next/link';
import Image from 'next/image';

// 注册页面图标资源（从 Figma 导出）
const iconBack = "/images/register/icon-back.svg";
const iconStar = "/images/register/icon-star.svg";
const iconGamepad = "/images/register/icon-gamepad.svg";
const iconLock = "/images/register/icon-lock.svg";
const iconWechat = "/images/register/icon-wechat.svg";
const iconQQ = "/images/register/icon-qq.svg";
const iconWeibo = "/images/register/icon-weibo.svg";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<RegisterRequest>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // 如果已登录，跳转到首页
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    if (!formData.email) {
      Toast.show({
        icon: 'fail',
        content: '请先输入手机号或邮箱',
      });
      return;
    }

    setSendingCode(true);
    try {
      // 模拟发送验证码
      await new Promise(resolve => setTimeout(resolve, 1000));
      Toast.show({
        icon: 'success',
        content: '验证码已发送',
      });
      setCountdown(60);
    } catch {
      Toast.show({
        icon: 'fail',
        content: '发送失败，请重试',
      });
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.confirmPassword) {
      Toast.show({
        icon: 'fail',
        content: '请填写完整信息',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Toast.show({
        icon: 'fail',
        content: '两次密码不一致',
      });
      return;
    }

    if (!agreeTerms) {
      Toast.show({
        icon: 'fail',
        content: '请先同意用户协议和隐私政策',
      });
      return;
    }

    setSubmitting(true);
    try {
      await register({
        username: formData.email,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      Toast.show({
        icon: 'success',
        content: '注册成功',
      });
      router.push('/');
    } catch (error) {
      Toast.show({
        icon: 'fail',
        content: error instanceof Error ? error.message : '注册失败',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocialRegister = (type: 'wechat' | 'qq' | 'weibo') => {
    Toast.show({
      icon: 'fail',
      content: `${type === 'wechat' ? '微信' : type === 'qq' ? 'QQ' : '微博'}注册功能开发中`,
    });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#74d4ff] to-[#fda5d5] relative overflow-hidden">
      {/* 背景装饰元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 左上角云朵装饰 */}
        <div className="absolute left-5 top-6 w-16 h-10">
          <div className="absolute bg-white/90 h-10 left-0 rounded-full top-0 w-16 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]" />
          <div className="absolute bg-white/90 h-8 left-[-16px] rounded-full top-2 w-12 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]" />
          <div className="absolute bg-white/90 h-8 left-8 rounded-full top-2 w-10 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]" />
        </div>

        {/* 右上角云朵装饰 */}
        <div className="absolute right-5 top-[103px] w-12 h-8">
          <div className="absolute bg-white/80 h-8 left-0 rounded-full top-0 w-12 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]" />
          <div className="absolute bg-white/80 h-6 left-[-12px] rounded-full top-1 w-10 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]" />
          <div className="absolute bg-white/80 h-6 left-6 rounded-full top-1 w-8 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]" />
        </div>

        {/* 星星装饰 - 右上角 */}
        <div className="absolute right-[117px] top-3 w-10 h-11 rotate-[176deg]">
          <span className="text-4xl">⭐</span>
        </div>

        {/* 其他装饰 emoji */}
        <div className="absolute left-[39px] top-[956px]">
          <span className="text-3xl">🌟</span>
        </div>
        <div className="absolute right-[40px] top-[382px] rotate-[-8deg]">
          <span className="text-3xl">💖</span>
        </div>
        <div className="absolute left-[61px] top-[734px] rotate-[-10deg]">
          <span className="text-3xl">⚡</span>
        </div>
        <div className="absolute left-[98px] top-[559px]">
          <span className="text-2xl">🎈</span>
        </div>
        <div className="absolute right-[98px] top-[774px]">
          <span className="text-2xl">🎮</span>
        </div>
        <div className="absolute left-[91px] top-[230px] rotate-[215deg]">
          <span className="text-2xl">🍭</span>
        </div>
        <div className="absolute right-[131px] top-[838px]">
          <span className="text-2xl">🎯</span>
        </div>

        {/* 彩色圆点装饰 */}
        <div className="absolute right-[97px] top-[291px] w-[15px] h-[15px] rounded-full bg-[#fdc700] opacity-90" />
        <div className="absolute left-[98px] top-[867px] w-[9px] h-[9px] rounded-full bg-[#fb64b6] opacity-75" />
        <div className="absolute right-[130px] top-[582px] w-[19px] h-[19px] rounded-full bg-[#51a2ff] opacity-90" />

        {/* 左下角云朵装饰 */}
        <div className="absolute left-[47px] bottom-[130px] w-14 h-10 rotate-[1.5deg]">
          <div className="absolute bg-white/85 h-[37px] left-0 rounded-full top-0 w-[57px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]" />
          <div className="absolute bg-white/85 h-[29px] left-[-12px] rounded-full top-2 w-[45px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]" />
          <div className="absolute bg-white/85 h-[30px] left-7 rounded-full top-[9px] w-[37px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]" />
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="relative z-10 flex flex-col items-center px-4 py-4 min-h-screen">
        {/* 返回登录按钮 */}
        <div className="w-full max-w-[361px] mb-4">
          <Link href="/login" className="inline-flex items-center gap-2 bg-white/30 rounded-full px-4 py-2">
            <div className="w-5 h-5">
              <Image src={iconBack} alt="" width={20} height={20} className="w-full h-full" />
            </div>
            <span className="text-base font-bold text-white tracking-[-0.31px]">返回登录</span>
          </Link>
        </div>

        {/* Logo 和标题区域 */}
        <div className="w-full max-w-[361px] mb-4 relative h-[192px]">
          {/* Logo 圆形图标 */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-24 h-24 rounded-full shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]"
            style={{ backgroundImage: 'linear-gradient(135deg, rgb(253, 199, 0) 0%, rgb(255, 105, 0) 100%)' }}>
            {/* 外圈装饰 */}
            <div className="absolute left-[-10px] top-[-10px] w-[117px] h-[117px] rounded-full bg-white/30 opacity-30" />
            {/* 星星装饰 */}
            <div className="absolute right-[-24px] top-[-8px] w-6 h-6">
              <Image src={iconStar} alt="" width={24} height={24} className="w-full h-full" />
            </div>
            {/* 游戏手柄图标 */}
            <div className="absolute left-5 top-5 w-14 h-14">
              <Image src={iconGamepad} alt="" width={56} height={56} className="w-full h-full" />
            </div>
          </div>

          {/* 标题 */}
          <div className="absolute left-0 top-[112px] w-full flex items-center justify-center">
            <h1 className="text-[48px] font-black leading-[48px] text-white text-center whitespace-nowrap tracking-[0.35px]">
              加入我们 🎉
            </h1>
          </div>

          {/* 副标题 */}
          <div className="absolute left-0 top-[168px] w-full">
            <p className="text-base font-medium leading-6 text-white text-center whitespace-nowrap tracking-[-0.31px]">
              创建账号，开启游戏之旅 ✨
            </p>
          </div>
        </div>

        {/* 注册表单卡片 */}
        <div className="w-full max-w-[361px] bg-white rounded-[24px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] relative overflow-hidden">
          {/* 装饰性渐变圆圈 */}
          <div className="absolute right-[-40px] top-[-46px] w-[135px] h-[135px] rounded-full opacity-50 rotate-[1.5deg]"
            style={{ backgroundImage: 'linear-gradient(135deg, rgb(233, 212, 255) 0%, rgb(252, 206, 232) 100%)' }} />
          <div className="absolute left-[-40px] bottom-[113px] w-32 h-32 rounded-full opacity-50"
            style={{ backgroundImage: 'linear-gradient(135deg, rgb(190, 219, 255) 0%, rgb(162, 244, 253) 100%)' }} />

          <form onSubmit={handleSubmit} className="p-8 relative z-10">
            {/* 表单字段 */}
            <div className="flex flex-col gap-4 mb-4">
              {/* 手机号/邮箱输入 */}
              <div className="flex flex-col gap-2">
                <label className="h-7 flex items-center">
                  <span className="text-lg font-bold text-[#364153] mr-2">📱</span>
                  <span className="text-sm font-bold text-[#364153] tracking-[-0.15px]">手机号/邮箱</span>
                </label>
                <Input
                  type="text"
                  placeholder="输入手机号或邮箱 📱"
                  value={formData.email}
                  onChange={(val) => setFormData({ ...formData, email: val, username: val })}
                  className="!h-[60px] !rounded-2xl !border-2 !border-[#e9d4ff] !px-5 !text-base"
                  style={{
                    background: 'linear-gradient(to right, #faf5ff, #fdf2f8)',
                  }}
                />
              </div>

              {/* 验证码输入 */}
              <div className="flex flex-col gap-2">
                <label className="h-7 flex items-center">
                  <span className="text-lg font-bold text-[#364153] mr-2">🔢</span>
                  <span className="text-sm font-bold text-[#364153] tracking-[-0.15px]">验证码</span>
                </label>
                <div className="flex gap-3">
                  <Input
                    type="text"
                    placeholder="输入验证码"
                    value={verificationCode}
                    onChange={(val) => setVerificationCode(val)}
                    className="!flex-1 !h-[60px] !rounded-2xl !border-2 !border-[#b9f8cf] !px-5 !text-base"
                    style={{
                      background: 'linear-gradient(to right, #f0fdf4, #ecfdf5)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={sendingCode || countdown > 0}
                    className="h-[60px] w-[68px] rounded-2xl text-sm font-bold text-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)]"
                    style={{
                      background: 'linear-gradient(to right, #05df72, #00d492)',
                    }}
                  >
                    {countdown > 0 ? `${countdown}s` : '发送'}
                  </button>
                </div>
              </div>

              {/* 设置密码输入 */}
              <div className="flex flex-col gap-2">
                <label className="h-7 flex items-center">
                  <span className="text-lg font-bold text-[#364153] mr-2">🔐</span>
                  <span className="text-sm font-bold text-[#364153] tracking-[-0.15px]">设置密码</span>
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="设置你的密码 🔐"
                    value={formData.password}
                    onChange={(val) => setFormData({ ...formData, password: val })}
                    className="!h-[60px] !rounded-2xl !border-2 !border-[#bedbff] !px-5 !pr-12 !text-base"
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

              {/* 确认密码输入 */}
              <div className="flex flex-col gap-2">
                <label className="h-7 flex items-center">
                  <span className="text-lg font-bold text-[#364153] mr-2">✅</span>
                  <span className="text-sm font-bold text-[#364153] tracking-[-0.15px]">确认密码</span>
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="再次输入密码 ✅"
                    value={formData.confirmPassword}
                    onChange={(val) => setFormData({ ...formData, confirmPassword: val })}
                    className="!h-[60px] !rounded-2xl !border-2 !border-[#c6d2ff] !px-5 !pr-12 !text-base"
                    style={{
                      background: 'linear-gradient(to right, #eef2ff, #faf5ff)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-[#99a1af]"
                  >
                    🙈
                  </button>
                </div>
              </div>
            </div>

            {/* 用户协议 */}
            <div className="flex items-start gap-2 mb-5">
              <Checkbox
                checked={agreeTerms}
                onChange={setAgreeTerms}
                className="!mt-0.5"
              />
              <p className="text-sm font-medium text-[#4a5565] tracking-[-0.15px] leading-6">
                我已阅读并同意{' '}
                <button
                  type="button"
                  onClick={() => Toast.show({ icon: 'fail', content: '用户协议功能开发中' })}
                  className="text-base font-bold text-[#9810fa] tracking-[-0.31px]"
                >
                  用户协议
                </button>
                {' '}和{' '}
                <button
                  type="button"
                  onClick={() => Toast.show({ icon: 'fail', content: '隐私政策功能开发中' })}
                  className="text-base font-bold text-[#9810fa] tracking-[-0.31px]"
                >
                  隐私政策
                </button>
              </p>
            </div>

            {/* 注册按钮 */}
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
              立即注册 🚀
            </Button>
          </form>

          {/* 快速注册分隔线 */}
          <div className="relative px-8 mb-5">
            <div className="h-[1px] bg-[#e5e7eb] w-full" />
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-white px-4">
              <p className="text-sm font-bold text-[#6a7282] tracking-[-0.15px] whitespace-nowrap">
                快速注册 ⚡
              </p>
            </div>
          </div>

          {/* 第三方注册按钮 */}
          <div className="px-8 pb-5 flex gap-4 justify-center">
            {/* 微信注册 */}
            <button
              type="button"
              onClick={() => handleSocialRegister('wechat')}
              className="flex flex-col items-center justify-center gap-1 h-[84px] w-[88px] rounded-2xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]"
              style={{
                background: 'linear-gradient(136.48deg, rgb(220, 252, 231) 0%, rgb(185, 248, 207) 100%)',
              }}
            >
              <Image src={iconWechat} alt="微信" width={32} height={32} className="w-8 h-8" />
              <span className="text-xs font-bold text-[#00a63e]">微信</span>
            </button>

            {/* QQ 注册 */}
            <button
              type="button"
              onClick={() => handleSocialRegister('qq')}
              className="flex flex-col items-center justify-center gap-1 h-[84px] w-[88px] rounded-2xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]"
              style={{
                background: 'linear-gradient(136.48deg, rgb(219, 234, 254) 0%, rgb(190, 219, 255) 100%)',
              }}
            >
              <Image src={iconQQ} alt="QQ" width={32} height={32} className="w-8 h-8" />
              <span className="text-xs font-bold text-[#155dfc]">QQ</span>
            </button>

            {/* 微博注册 */}
            <button
              type="button"
              onClick={() => handleSocialRegister('weibo')}
              className="flex flex-col items-center justify-center gap-1 h-[84px] w-[88px] rounded-2xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]"
              style={{
                background: 'linear-gradient(136.486deg, rgb(255, 226, 226) 0%, rgb(255, 201, 201) 100%)',
              }}
            >
              <Image src={iconWeibo} alt="微博" width={32} height={32} className="w-8 h-8" />
              <span className="text-xs font-bold text-[#e7000b]">微博</span>
            </button>
          </div>

          {/* 登录链接 */}
          <div className="px-8 pb-6 text-center">
            <p className="text-base font-medium text-[#4a5565] tracking-[-0.31px]">
              已有账号？{' '}
              <Link href="/login" className="text-base font-black text-[#9810fa]">
                立即登录 ➡️
              </Link>
            </p>
          </div>
        </div>

        {/* 安全提示 */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="w-4 h-4">
            <Image src={iconLock} alt="" width={16} height={16} className="w-full h-full" />
          </div>
          <p className="text-xs font-medium text-white tracking-[-0.31px]">
            你的信息将被安全加密保护
          </p>
        </div>
      </div>
    </div>
  );
}
