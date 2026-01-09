/**
 * PWA 安装提示组件
 * 根据游戏盒子设计风格优化的安装提示弹窗
 */

'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Star, Zap, Heart } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isIOSChrome, setIsIOSChrome] = useState(false);

  // 暴露到全局，用于手动触发
  useEffect(() => {
    (window as any).showPWAPrompt = () => {
      console.log('[PWA] 手动触发弹窗');
      setShowPrompt(true);
    };
    (window as any).hidePWAPrompt = () => {
      console.log('[PWA] 手动关闭弹窗');
      setShowPrompt(false);
    };
    return () => {
      delete (window as any).showPWAPrompt;
      delete (window as any).hidePWAPrompt;
    };
  }, []);

  useEffect(() => {
    // 检测是否为 iOS 设备
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isChromeIOS = isIOSDevice && /CriOS/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);
    setIsIOSChrome(isChromeIOS);

    console.log('[PWA] 浏览器信息:', {
      userAgent: navigator.userAgent,
      isIOS: isIOSDevice,
      isIOSChrome: isChromeIOS,
      standalone: window.matchMedia('(display-mode: standalone)').matches,
    });

    // 检查用户是否已经拒绝过安装（已注释，允许测试）
    // const hasDeclined = localStorage.getItem('pwa-install-declined');
    // const declineTime = hasDeclined ? parseInt(hasDeclined) : 0;
    // const now = Date.now();
    // const threeDays = 3 * 24 * 60 * 60 * 1000; // 3天
    // if (hasDeclined && (now - declineTime < threeDays)) {
    //   console.log('[PWA] 用户在3天内拒绝过安装');
    //   return;
    // }

    // 检查是否已经安装
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    // @ts-ignore - iOS standalone mode detection
    const isInstalled = window.navigator.standalone === true;

    if (isStandalone || isInstalled) {
      console.log('[PWA] 应用已安装');
      return;
    }

    // iOS Safari 不支持 beforeinstallprompt，显示手动安装提示
    if (isIOSDevice) {
      console.log('[PWA] 检测到 iOS 设备，显示手动安装提示');
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return;
    }

    console.log('[PWA] 等待 beforeinstallprompt 事件...');

    // 监听 beforeinstallprompt 事件（仅 Chrome/Edge）
    const handler = (e: Event) => {
      console.log('[PWA] beforeinstallprompt 事件触发');
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // 延迟3秒显示提示，让用户先体验应用
      setTimeout(() => {
        console.log('[PWA] 显示安装提示');
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    // iOS 设备：关闭提示，用户需要手动添加
    if (isIOS) {
      console.log('[PWA] iOS 设备，用户需手动添加到主屏幕');
      setShowPrompt(false);
      return;
    }

    if (!deferredPrompt) return;

    try {
      // 显示安装提示
      await deferredPrompt.prompt();

      // 等待用户响应
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('[PWA] 用户接受了安装提示');
      } else {
        console.log('[PWA] 用户拒绝了安装提示');
      }
    } catch (error) {
      console.error('[PWA] 安装出错:', error);
    }

    // 清理
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleClose = () => {
    // 记录用户拒绝的时间
    localStorage.setItem('pwa-install-declined', Date.now().toString());
    setShowPrompt(false);
  };

  const handleRemindLater = () => {
    // 1小时后再提醒
    const oneHour = 60 * 60 * 1000;
    localStorage.setItem('pwa-install-declined', (Date.now() - (3 * 24 * 60 * 60 * 1000 - oneHour)).toString());
    setShowPrompt(false);
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] animate-fade-in">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* 提示卡片 */}
      <div className="absolute bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md md:mx-4 animate-slide-up md:animate-scale-in">
        <div className="bg-white rounded-t-[2rem] md:rounded-[2rem] shadow-2xl p-6 relative overflow-hidden">
          {/* 装饰背景 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-30 blur-2xl -translate-y-8 translate-x-8" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full opacity-30 blur-2xl translate-y-8 -translate-x-8" />

          {/* 漂浮装饰 */}
          <div className="absolute top-4 right-6 text-2xl animate-bounce-gentle">⭐</div>
          <div className="absolute bottom-6 left-6 text-2xl animate-float-delayed">💫</div>
          <div className="absolute top-1/3 right-12 text-xl animate-wiggle-gentle">✨</div>

          {/* 关闭按钮 */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-10"
            aria-label="关闭"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          <div className="relative z-10">
            {/* 图标 */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 rounded-3xl shadow-lg flex items-center justify-center animate-bounce-gentle">
                  <Smartphone className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  <Download className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* 标题 */}
            <h2 className="text-2xl font-black text-center text-gray-800 mb-2 flex items-center justify-center gap-2">
              添加到主屏幕
              <span className="inline-block animate-wiggle-fun">🎮</span>
            </h2>

            {/* 描述 */}
            <p className="text-center text-gray-600 mb-4 leading-relaxed">
              {isIOSChrome ? (
                <>
                  请在 <span className="font-bold text-blue-500">Safari 浏览器</span> 中打开
                  <br />
                  才能添加到主屏幕
                  <span className="inline-block ml-1">📱</span>
                </>
              ) : isIOS ? (
                <>
                  把游戏盒子添加到主屏幕，
                  <br />
                  随时随地畅玩游戏！
                  <span className="inline-block ml-1 animate-bounce-gentle">🎉</span>
                </>
              ) : (
                <>
                  把游戏盒子添加到主屏幕，
                  <br />
                  随时随地畅玩游戏！
                  <span className="inline-block ml-1 animate-bounce-gentle">🎉</span>
                </>
              )}
            </p>

            {/* iOS 安装步骤 */}
            {isIOS && !isIOSChrome && (
              <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                <p className="text-sm font-bold text-blue-800 mb-3 text-center">📝 安装步骤</p>
                <ol className="space-y-2.5 text-sm text-blue-900">
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <div>
                      <div>点击 Safari 的 <span className="font-bold text-blue-600">分享按钮</span>（向上箭头 ⬆️）</div>
                      <div className="text-xs text-blue-600 mt-1">
                        • iPhone：底部工具栏中间<br/>
                        • iPad：顶部地址栏右边
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <span>向下滚动菜单，找到 <span className="font-bold text-blue-600">"添加到主屏幕"</span> 选项</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <span>点击右上角 <span className="font-bold text-blue-600">"添加"</span> 按钮完成 ✅</span>
                  </li>
                </ol>
              </div>
            )}

            {/* 优势列表 */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 transform transition-all hover:scale-105">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">极速启动</p>
                  <p className="text-xs text-gray-600">一键打开，秒速进入</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-3 transform transition-all hover:scale-105">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                  <Star className="w-5 h-5 text-white" fill="currentColor" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">离线畅玩</p>
                  <p className="text-xs text-gray-600">没有网络也能玩</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 transform transition-all hover:scale-105">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                  <Heart className="w-5 h-5 text-white" fill="currentColor" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">原生体验</p>
                  <p className="text-xs text-gray-600">如同真正的App</p>
                </div>
              </div>
            </div>

            {/* 按钮组 */}
            <div className="space-y-3">
              {isIOSChrome ? (
                // iOS Chrome - 需要在 Safari 中打开
                <>
                  <button
                    onClick={() => {
                      // 复制网址到剪贴板
                      navigator.clipboard.writeText(window.location.href).then(() => {
                        alert('网址已复制！\n请在 Safari 中粘贴打开');
                      });
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 relative overflow-hidden group"
                    style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      复制网址
                      <span className="inline-block group-hover:animate-bounce-once">📋</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                  </button>
                  <button
                    onClick={handleClose}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl font-bold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300"
                  >
                    我知道了
                  </button>
                </>
              ) : isIOS ? (
                // iOS Safari - 手动安装提示
                <button
                  onClick={handleClose}
                  className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 relative overflow-hidden group"
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    知道了，去添加
                    <span className="inline-block group-hover:animate-bounce-once">👆</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                </button>
              ) : (
                // Android/Chrome 自动安装
                <>
                  <button
                    onClick={handleInstall}
                    className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 relative overflow-hidden group"
                    style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Download className="w-5 h-5" />
                      立即安装
                      <span className="inline-block group-hover:animate-bounce-once">🚀</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                  </button>

                  <button
                    onClick={handleRemindLater}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl font-bold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300"
                  >
                    稍后提醒
                  </button>
                </>
              )}
            </div>

            {/* 底部提示 */}
            <p className="text-center text-xs text-gray-400 mt-4">
              免费 · 安全 · 无需下载额外文件
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
