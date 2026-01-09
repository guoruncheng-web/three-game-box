/**
 * PWA 测试按钮 - 用于开发测试
 * 手动触发 PWA 安装提示
 */

'use client';

import { useState } from 'react';

export function PWATestButton() {
  const [showControls, setShowControls] = useState(false);

  const clearPWAData = () => {
    localStorage.removeItem('pwa-install-declined');
    localStorage.removeItem('ios-install-banner-dismissed');
    console.log('[Test] PWA 数据已清除');
    alert('PWA 数据已清除！刷新页面即可看到提示');
  };

  const showPWAInfo = () => {
    const info = {
      'pwa-install-declined': localStorage.getItem('pwa-install-declined'),
      'ios-install-banner-dismissed': localStorage.getItem('ios-install-banner-dismissed'),
      userAgent: navigator.userAgent,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
    };
    console.log('[Test] PWA 信息:', info);
    alert(JSON.stringify(info, null, 2));
  };

  const showPWAPrompt = () => {
    console.log('[Test] 手动触发 PWA 弹窗');
    if ((window as any).showPWAPrompt) {
      (window as any).showPWAPrompt();
    } else {
      alert('PWA 弹窗组件未加载');
    }
  };

  // 仅在开发环境显示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* 悬浮按钮 */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="fixed bottom-24 right-4 z-[10000] w-12 h-12 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center font-bold transition-all"
        title="PWA 测试工具"
      >
        🔧
      </button>

      {/* 控制面板 */}
      {showControls && (
        <div className="fixed bottom-40 right-4 z-[10000] bg-white rounded-2xl shadow-2xl p-4 w-64 animate-scale-in">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            🔧 PWA 测试工具
          </h3>
          <div className="space-y-2">
            <button
              onClick={showPWAPrompt}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded-lg text-sm font-bold transition-all active:scale-95"
            >
              🎯 显示 PWA 弹窗
            </button>
            <button
              onClick={clearPWAData}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-bold transition-all active:scale-95"
            >
              清除 PWA 数据
            </button>
            <button
              onClick={showPWAInfo}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-bold transition-all active:scale-95"
            >
              查看 PWA 信息
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-3 rounded-lg text-sm font-bold transition-all active:scale-95"
            >
              刷新页面
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            仅在开发环境显示
          </p>
        </div>
      )}
    </>
  );
}
