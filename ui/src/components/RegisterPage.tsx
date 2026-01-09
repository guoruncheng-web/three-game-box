import { useState } from 'react';
import { Gamepad2, Mail, Lock, Eye, EyeOff, Sparkles, Star, Heart, Zap, ArrowLeft, Shield } from 'lucide-react';
import { useToast } from './Toast';

interface RegisterPageProps {
  onRegister: () => void;
  onBackToLogin: () => void;
}

export function RegisterPage({ onRegister, onBackToLogin }: RegisterPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { showToast } = useToast();

  const handleSendCode = () => {
    if (!email) {
      showToast('warning', '请先输入手机号或邮箱哦～', '📧');
      return;
    }
    
    // 模拟发送验证码
    showToast('success', '验证码已发送，请查收～', '📨');
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      showToast('warning', '请输入手机号或邮箱哦～', '📧');
      return;
    }
    
    if (!verifyCode) {
      showToast('warning', '请输入验证码哦～', '🔢');
      return;
    }
    
    if (!password) {
      showToast('warning', '请设置密码哦～', '🔐');
      return;
    }
    
    if (!confirmPassword) {
      showToast('warning', '请确认密码哦～', '✅');
      return;
    }
    
    if (password !== confirmPassword) {
      showToast('error', '两次密码输入不一致！', '❌');
      return;
    }
    
    if (!agreeTerms) {
      showToast('warning', '请同意用户协议和隐私政策～', '📋');
      return;
    }
    
    // 模拟注册成功
    showToast('success', '注册成功！欢迎加入～', '🎉');
    setTimeout(() => {
      onRegister();
    }, 500);
  };

  const handleSocialRegister = (platform: string) => {
    showToast('info', `正在跳转到${platform}注册...`, '🔄');
    // 模拟第三方注册成功
    setTimeout(() => {
      showToast('success', `${platform}注册成功！`, '✨');
      setTimeout(() => {
        onRegister();
      }, 500);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 via-purple-300 to-pink-300 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 卡通云朵装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 云朵1 */}
        <div className="absolute top-10 left-5 animate-float">
          <div className="relative">
            <div className="w-16 h-10 bg-white/90 rounded-full shadow-lg"></div>
            <div className="absolute top-2 -left-4 w-12 h-8 bg-white/90 rounded-full shadow-lg"></div>
            <div className="absolute top-2 left-8 w-10 h-8 bg-white/90 rounded-full shadow-lg"></div>
          </div>
        </div>
        
        {/* 云朵2 */}
        <div className="absolute top-32 right-8 animate-float-delayed">
          <div className="relative">
            <div className="w-12 h-8 bg-white/80 rounded-full shadow-lg"></div>
            <div className="absolute top-1 -left-3 w-10 h-6 bg-white/80 rounded-full shadow-lg"></div>
            <div className="absolute top-1 left-6 w-8 h-6 bg-white/80 rounded-full shadow-lg"></div>
          </div>
        </div>
        
        {/* 云朵3 */}
        <div className="absolute bottom-32 left-12 animate-float-slow">
          <div className="relative">
            <div className="w-14 h-9 bg-white/85 rounded-full shadow-lg"></div>
            <div className="absolute top-2 -left-3 w-11 h-7 bg-white/85 rounded-full shadow-lg"></div>
            <div className="absolute top-2 left-7 w-9 h-7 bg-white/85 rounded-full shadow-lg"></div>
          </div>
        </div>

        {/* 漂浮的装饰元素 */}
        <div className="absolute top-20 right-20 text-4xl animate-float-rotate">⭐</div>
        <div className="absolute bottom-40 left-10 text-3xl animate-bounce-fun">🌟</div>
        <div className="absolute top-1/3 right-12 text-3xl animate-swing">💖</div>
        <div className="absolute bottom-1/3 left-16 text-3xl animate-wiggle-fun">⚡</div>
        <div className="absolute top-1/2 left-1/4 text-2xl animate-float-delayed">🎈</div>
        <div className="absolute top-2/3 right-1/4 text-2xl animate-bounce-fun delay-500">🎮</div>
        <div className="absolute top-1/4 left-1/3 text-2xl animate-spin-slow">🍭</div>
        <div className="absolute bottom-1/4 right-1/3 text-2xl animate-float-slow">🎯</div>
        
        {/* 彩色圆点装饰 */}
        <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-yellow-400 rounded-full animate-pulse-soft"></div>
        <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-pink-400 rounded-full animate-pulse-soft delay-300"></div>
        <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-blue-400 rounded-full animate-pulse-soft delay-700"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* 返回按钮 */}
        <button
          onClick={onBackToLogin}
          className="mb-4 flex items-center gap-2 text-white font-bold hover:scale-105 transition-transform duration-200 animate-slide-down"
        >
          <div className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span>返回登录</span>
        </button>

        {/* Logo和标题区域 */}
        <div className="text-center mb-6 animate-slide-down">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-2xl mb-4 transform hover:scale-110 hover:rotate-12 transition-all duration-300 relative animate-bounce-gentle">
            <div className="absolute inset-0 bg-white/30 rounded-full animate-ping-slow"></div>
            <Gamepad2 className="w-14 h-14 text-white relative z-10" strokeWidth={2.5} />
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300 animate-pulse" fill="currentColor" />
          </div>
          <h1 className="text-5xl font-black text-white mb-2 flex items-center justify-center gap-2" style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.1)' }}>
            加入我们 🎉
          </h1>
          <p className="text-white text-base font-medium animate-fade-in">创建账号，开启游戏之旅 ✨</p>
        </div>

        {/* 注册卡片 */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm relative overflow-hidden animate-slide-up">
          {/* 卡片装饰 */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-50 animate-float-slow"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full opacity-50 animate-float-delayed"></div>
          
          <form onSubmit={handleRegister} className="space-y-4 relative z-10">
            {/* 手机号/邮箱输入框 */}
            <div className="space-y-2 animate-fade-in-up delay-100">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <span className="text-lg animate-wiggle-gentle">📱</span>
                手机号/邮箱
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="输入手机号或邮箱 📱"
                  className="w-full px-5 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-3 border-purple-200 rounded-2xl focus:outline-none focus:border-purple-400 focus:scale-[1.02] focus:shadow-lg transition-all duration-300 placeholder:text-gray-400 font-medium hover:border-purple-300"
                />
              </div>
            </div>

            {/* 验证码输入框 */}
            <div className="space-y-2 animate-fade-in-up delay-150">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <span className="text-lg animate-wiggle-gentle delay-100">🔢</span>
                验证码
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  placeholder="输入验证码"
                  className="flex-1 px-5 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-3 border-green-200 rounded-2xl focus:outline-none focus:border-green-400 focus:scale-[1.02] focus:shadow-lg transition-all duration-300 placeholder:text-gray-400 font-medium hover:border-green-300"
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={countdown > 0}
                  className={`px-5 py-4 rounded-2xl font-bold text-sm whitespace-nowrap shadow-md transition-all duration-300 ${
                    countdown > 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-400 to-emerald-400 text-white hover:scale-105 active:scale-95 hover:shadow-lg'
                  }`}
                >
                  {countdown > 0 ? `${countdown}s` : '发送'}
                </button>
              </div>
            </div>

            {/* 密码输入框 */}
            <div className="space-y-2 animate-fade-in-up delay-200">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <span className="text-lg animate-wiggle-gentle delay-150">🔐</span>
                设置密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="设置你的密码 🔐"
                  className="w-full px-5 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-3 border-blue-200 rounded-2xl focus:outline-none focus:border-blue-400 focus:scale-[1.02] focus:shadow-lg transition-all duration-300 placeholder:text-gray-400 font-medium hover:border-blue-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all hover:scale-125 transform duration-200"
                >
                  <span className="text-xl inline-block hover:animate-bounce-once">{showPassword ? '👁️' : '🙈'}</span>
                </button>
              </div>
            </div>

            {/* 确认密码输入框 */}
            <div className="space-y-2 animate-fade-in-up delay-250">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <span className="text-lg animate-wiggle-gentle delay-200">✅</span>
                确认密码
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次输入密码 ✅"
                  className="w-full px-5 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-3 border-indigo-200 rounded-2xl focus:outline-none focus:border-indigo-400 focus:scale-[1.02] focus:shadow-lg transition-all duration-300 placeholder:text-gray-400 font-medium hover:border-indigo-300"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all hover:scale-125 transform duration-200"
                >
                  <span className="text-xl inline-block hover:animate-bounce-once">{showConfirmPassword ? '👁️' : '🙈'}</span>
                </button>
              </div>
            </div>

            {/* 用户协议 */}
            <div className="pt-2 animate-fade-in-up delay-300">
              <label className="flex items-start gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-5 h-5 rounded-lg border-2 border-purple-300 text-purple-600 focus:ring-purple-500 cursor-pointer transition-transform hover:scale-110 mt-0.5"
                />
                <span className="text-sm text-gray-600 font-medium group-hover:text-gray-800 transition-colors">
                  我已阅读并同意
                  <button type="button" className="text-purple-600 hover:text-purple-700 font-bold mx-1">用户协议</button>
                  和
                  <button type="button" className="text-purple-600 hover:text-purple-700 font-bold ml-1">隐私政策</button>
                </span>
              </label>
            </div>

            {/* 注册按钮 */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl hover:scale-[1.05] active:scale-95 transition-all duration-300 relative overflow-hidden group animate-fade-in-up delay-350"
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2 group-hover:animate-wiggle-subtle">
                立即注册 🚀
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-all duration-300 animate-shimmer"></div>
            </button>
          </form>

          {/* 分割线 */}
          <div className="relative my-6 animate-fade-in-up delay-400">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-dashed border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-bold">快速注册 ⚡</span>
            </div>
          </div>

          {/* 第三方注册 */}
          <div className="grid grid-cols-3 gap-4 animate-fade-in-up delay-450">
            <button
              onClick={() => handleSocialRegister('微信')}
              className="flex flex-col items-center justify-center py-4 bg-gradient-to-br from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-green-600 rounded-2xl transition-all duration-300 hover:scale-110 hover:rotate-3 active:scale-95 active:rotate-0 shadow-md hover:shadow-xl group"
            >
              <svg className="w-8 h-8 mb-1 group-hover:animate-wiggle-subtle" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18z"/>
                <path d="M23.759 11.336c0-3.528-3.36-6.396-7.5-6.396-4.14 0-7.5 2.868-7.5 6.396 0 3.528 3.36 6.396 7.5 6.396.837 0 1.641-.109 2.403-.313.269-.079.564-.033.796.124l1.653.967a.267.267 0 0 0 .135.044c.134 0 .24-.111.24-.248 0-.06-.023-.12-.039-.177l-.339-1.288a.508.508 0 0 1 .176-.577c1.592-1.17 2.475-2.927 2.475-4.928zm-10.104.96a.96.96 0 0 1-.96-.96.96.96 0 0 1 .96-.96.96.96 0 0 1 .96.96.96.96 0 0 1-.96.96zm4.14 0a.96.96 0 0 1-.96-.96.96.96 0 0 1 .96-.96.96.96 0 0 1 .96.96.96.96 0 0 1-.96.96z"/>
              </svg>
              <span className="text-xs font-bold">微信</span>
            </button>
            <button
              onClick={() => handleSocialRegister('QQ')}
              className="flex flex-col items-center justify-center py-4 bg-gradient-to-br from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-blue-600 rounded-2xl transition-all duration-300 hover:scale-110 hover:-rotate-3 active:scale-95 active:rotate-0 shadow-md hover:shadow-xl group"
            >
              <svg className="w-8 h-8 mb-1 group-hover:animate-wiggle-subtle" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.395 15.035a39.548 39.548 0 0 0-.803-2.264l-1.079-2.695c.001-.032.014-.562.014-.836C19.526 4.632 17.351 0 12 0S4.474 4.632 4.474 9.241c0 .274.013.804.014.836l-1.08 2.695a38.97 38.97 0 0 0-.802 2.264c-1.021 3.283-.69 4.643-.438 4.673.54.065 2.103-2.472 2.103-2.472 0 1.469.756 3.387 2.394 4.771-.612.188-1.363.479-1.845.835-.434.32-.379.646-.301.778.343.578 5.883.369 7.482.189 1.6.18 7.14.389 7.483-.189.078-.132.132-.458-.301-.778-.483-.356-1.233-.646-1.846-.836 1.637-1.384 2.393-3.302 2.393-4.771 0 0 1.563 2.537 2.103 2.472.251-.03.581-1.39-.438-4.673z"/>
              </svg>
              <span className="text-xs font-bold">QQ</span>
            </button>
            <button
              onClick={() => handleSocialRegister('微博')}
              className="flex flex-col items-center justify-center py-4 bg-gradient-to-br from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 text-red-600 rounded-2xl transition-all duration-300 hover:scale-110 hover:rotate-3 active:scale-95 active:rotate-0 shadow-md hover:shadow-xl group"
            >
              <svg className="w-8 h-8 mb-1 group-hover:animate-wiggle-subtle" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.936 20.276c-4.282.326-7.98-1.526-8.264-4.137-.285-2.611 3.007-5.031 7.289-5.357 4.283-.326 7.981 1.526 8.265 4.137.285 2.611-3.007 5.031-7.29 5.357zm10.73-6.844c-.361-.105-.605-.179-.419-.646.405-.991.447-1.848.011-2.457-.819-1.142-3.055-1.081-5.612-.025 0 0-.803.342-.598-.279.394-1.231.333-2.256-.307-2.851-1.449-1.349-5.301.051-8.608 3.126C2.661 12.707 1.006 15.102 1 17.116c0 3.854 4.947 6.196 9.784 6.196 6.344 0 10.566-3.681 10.566-6.604 0-1.767-1.49-2.769-2.684-3.276zM7.464 19.689c-2.04.199-3.803-.721-3.937-2.055-.134-1.334 1.361-2.586 3.401-2.784 2.04-.199 3.803.721 3.937 2.055.134 1.334-1.361 2.586-3.401 2.784zm4.193-3.681c-.556.174-1.178.262-1.857.248-1.286-.028-2.311-.549-2.288-1.164.023-.615 1.077-1.05 2.363-1.022.679.015 1.301.162 1.857.406.915.401 1.22.941.925 1.532z"/>
              </svg>
              <span className="text-xs font-bold">微博</span>
            </button>
          </div>

          {/* 已有账号 */}
          <div className="mt-6 text-center text-base animate-fade-in-up delay-500">
            <span className="text-gray-600 font-medium">已有账号？</span>
            <button
              type="button"
              onClick={onBackToLogin}
              className="ml-1 text-purple-600 hover:text-purple-700 font-black transition-all hover:scale-110 inline-block transform"
            >
              立即登录 ➡️
            </button>
          </div>
        </div>

        {/* 安全提示 */}
        <div className="mt-6 flex items-center justify-center gap-2 text-white text-xs font-medium animate-fade-in delay-600">
          <Shield className="w-4 h-4" />
          <span>你的信息将被安全加密保护</span>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-25px); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        
        @keyframes float-rotate {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-15px) rotate(90deg); }
          50% { transform: translateY(-25px) rotate(180deg); }
          75% { transform: translateY(-15px) rotate(270deg); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes bounce-fun {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.1); }
        }
        
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes wiggle-fun {
          0%, 100% { transform: rotate(-10deg) scale(1); }
          50% { transform: rotate(10deg) scale(1.1); }
        }
        
        @keyframes wiggle-gentle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        
        @keyframes wiggle-subtle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        
        @keyframes swing {
          0%, 100% { transform: rotate(-8deg) translateY(0); }
          50% { transform: rotate(8deg) translateY(-10px); }
        }
        
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.3); opacity: 0.2; }
          100% { transform: scale(1); opacity: 0.5; }
        }
        
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes slide-down {
          from { 
            opacity: 0;
            transform: translateY(-30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-up {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { 
            opacity: 0;
            transform: translateY(10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce-once {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }
        
        .animate-float-rotate {
          animation: float-rotate 15s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-bounce-fun {
          animation: bounce-fun 3s ease-in-out infinite;
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
        
        .animate-wiggle-fun {
          animation: wiggle-fun 2s ease-in-out infinite;
        }
        
        .animate-wiggle-gentle {
          animation: wiggle-gentle 3s ease-in-out infinite;
        }
        
        .animate-wiggle-subtle {
          animation: wiggle-subtle 0.5s ease-in-out;
        }
        
        .animate-swing {
          animation: swing 4s ease-in-out infinite;
        }
        
        .animate-ping-slow {
          animation: ping-slow 3s ease-in-out infinite;
        }
        
        .animate-pulse-soft {
          animation: pulse-soft 3s ease-in-out infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
        
        .animate-slide-down {
          animation: slide-down 0.6s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        
        .animate-bounce-once {
          animation: bounce-once 0.4s ease-out;
        }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-150 { animation-delay: 0.15s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-250 { animation-delay: 0.25s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-350 { animation-delay: 0.35s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-450 { animation-delay: 0.45s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
      `}</style>
    </div>
  );
}