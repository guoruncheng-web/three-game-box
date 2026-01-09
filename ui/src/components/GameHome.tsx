import { useState } from 'react';
import { Home, User } from 'lucide-react';
import { HomePage } from './HomePage';
import { ProfilePage } from './ProfilePage';
import { PWAInstallPrompt } from './PWAInstallPrompt';

interface GameHomeProps {
  onLogout: () => void;
}

export function GameHome({ onLogout }: GameHomeProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'profile'>('home');

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-pink-100 to-orange-100 pb-20">
      {/* 主内容区域 */}
      <div className="h-full">
        {activeTab === 'home' ? <HomePage /> : <ProfilePage onLogout={onLogout} />}
      </div>

      {/* PWA 安装提示 */}
      <PWAInstallPrompt />

      {/* 底部导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-purple-200 shadow-2xl z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center justify-center py-3 rounded-2xl transition-all duration-300 ${
                activeTab === 'home'
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white scale-105 shadow-xl'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Home className={`w-7 h-7 mb-1 ${activeTab === 'home' ? 'animate-bounce-gentle' : ''}`} />
              <span className="text-sm font-bold">首页</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center justify-center py-3 rounded-2xl transition-all duration-300 ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white scale-105 shadow-xl'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <User className={`w-7 h-7 mb-1 ${activeTab === 'profile' ? 'animate-bounce-gentle' : ''}`} />
              <span className="text-sm font-bold">我的</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}