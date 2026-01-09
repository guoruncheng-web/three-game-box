/**
 * iOS Safari 安装横幅
 * 在页面顶部显示永久的安装提示
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

export function IOSInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 检测是否为 iOS Safari
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isSafari = isIOSDevice && !(/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent));

    // 检查是否已经安装
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    // @ts-ignore - iOS standalone mode detection
    const isInstalled = window.navigator.standalone === true;

    // 检查是否已关闭横幅
    const bannerDismissed = localStorage.getItem('ios-install-banner-dismissed');

    console.log('[Banner] 检测结果:', {
      isIOSDevice,
      isSafari,
      isStandalone,
      isInstalled,
      bannerDismissed: !!bannerDismissed,
    });

    setIsIOS(isSafari);

    // 只在 iOS Safari 且未安装且未关闭时显示
    if (isSafari && !isStandalone && !isInstalled && !bannerDismissed) {
      console.log('[Banner] 显示横幅');
      setShowBanner(true);
    } else {
      console.log('[Banner] 不显示横幅');
    }
  }, []);

  const handleDismiss = () => {
    console.log('[Banner] ======= 关闭按钮被点击 =======');
    localStorage.setItem('ios-install-banner-dismissed', Date.now().toString());
    setShowBanner(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[Banner] Click 事件触发');
    handleDismiss();
  };

  const handleTouch = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[Banner] Touch 事件触发');
    handleDismiss();
  };

  if (!showBanner || !isIOS) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9998] animate-slide-down pointer-events-none"
      onClick={() => console.log('[Banner] 外层容器被点击')}
    >
      <div className="max-w-md mx-auto">
        <div
          className="mx-4 mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg p-4 relative overflow-visible pointer-events-auto"
          onClick={() => console.log('[Banner] 横幅内容被点击')}
        >
          {/* 装饰背景 */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          {/* 关闭按钮 */}
          <button
            onClick={handleClick}
            onTouchEnd={handleTouch}
            className="absolute top-2 right-2 w-10 h-10 bg-white/20 hover:bg-white/40 active:bg-white/60 rounded-full flex items-center justify-center transition-all cursor-pointer z-[100] shadow-lg"
            aria-label="关闭"
            type="button"
            style={{ touchAction: 'manipulation' }}
          >
            <X className="w-6 h-6 text-white stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-3 pr-6">
            {/* 图标 */}
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <Download className="w-6 h-6 text-blue-500" />
            </div>

            {/* 文字内容 */}
            <div className="flex-1">
              <p className="text-white font-bold text-sm mb-1">
                安装到主屏幕
              </p>
              <p className="text-white/90 text-xs leading-relaxed">
                点击 <span className="inline-block mx-0.5">📤</span> 分享 → 添加到主屏幕
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
