import { useState } from 'react';
import { ArrowLeft, User, Lock, Bell, Volume2, Shield, Info, Trash2, ChevronRight, Camera, Edit, Phone, Mail, Key, Vibrate, Eye, Globe, HelpCircle, LogOut } from 'lucide-react';

interface SettingsPageProps {
  onBack: () => void;
  onLogout: () => void;
}

export function SettingsPage({ onBack, onLogout }: SettingsPageProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrateEnabled, setVibrateEnabled] = useState(true);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);
  const [showProfile, setShowProfile] = useState(true);

  const handleClearCache = () => {
    if (confirm('确定要清除缓存吗？')) {
      alert('缓存已清除！');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-pink-100 to-orange-100 pb-20">
      <div className="max-w-md mx-auto px-4 pt-4">
        {/* 头部 */}
        <div className="flex items-center gap-4 mb-6 animate-slide-down">
          <button
            onClick={onBack}
            className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            设置 ⚙️
          </h1>
        </div>

        {/* 个人信息编辑 */}
        <div className="mb-6 animate-fade-in-up delay-100">
          <h2 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-500" />
            <span>个人资料</span>
          </h2>
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg relative">
                  <span className="text-3xl">🎮</span>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
                    <Camera className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-black text-gray-800">更换头像</p>
                  <p className="text-xs text-gray-500">点击选择新头像</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
            </button>
            <div className="h-px bg-gray-100"></div>
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                  <Edit className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800">修改昵称</p>
                  <p className="text-xs text-gray-500">快乐玩家</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
            </button>
            <div className="h-px bg-gray-100"></div>
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800">个性签名</p>
                  <p className="text-xs text-gray-500">游戏是快乐的源泉～</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>

        {/* 账号安全 */}
        <div className="mb-6 animate-fade-in-up delay-200">
          <h2 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-500" />
            <span>账号安全</span>
          </h2>
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center">
                  <Key className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800">修改密码</p>
                  <p className="text-xs text-gray-500">定期更换密码更安全</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
            </button>
            <div className="h-px bg-gray-100"></div>
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                  <Phone className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800">绑定手机</p>
                  <p className="text-xs text-gray-500">138****5678</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">已绑定</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
            <div className="h-px bg-gray-100"></div>
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800">绑定邮箱</p>
                  <p className="text-xs text-gray-500">user@example.com</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">已绑定</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          </div>
        </div>

        {/* 通知设置 */}
        <div className="mb-6 animate-fade-in-up delay-300">
          <h2 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-500" />
            <span>消息通知</span>
          </h2>
          <div className="bg-white rounded-3xl shadow-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">推送通知</p>
                  <p className="text-xs text-gray-500">接收游戏更新和活动</p>
                </div>
              </div>
              <button
                onClick={() => setNotificationEnabled(!notificationEnabled)}
                className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                  notificationEnabled ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                    notificationEnabled ? 'left-7' : 'left-1'
                  }`}
                ></div>
              </button>
            </div>
          </div>
        </div>

        {/* 游戏设置 */}
        <div className="mb-6 animate-fade-in-up delay-400">
          <h2 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-blue-500" />
            <span>游戏设置</span>
          </h2>
          <div className="bg-white rounded-3xl shadow-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                  <Volume2 className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">音效</p>
                  <p className="text-xs text-gray-500">游戏音效和背景音乐</p>
                </div>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                  soundEnabled ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                    soundEnabled ? 'left-7' : 'left-1'
                  }`}
                ></div>
              </button>
            </div>
            <div className="h-px bg-gray-100"></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center">
                  <Vibrate className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">震动反馈</p>
                  <p className="text-xs text-gray-500">操作时的震动效果</p>
                </div>
              </div>
              <button
                onClick={() => setVibrateEnabled(!vibrateEnabled)}
                className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                  vibrateEnabled ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                    vibrateEnabled ? 'left-7' : 'left-1'
                  }`}
                ></div>
              </button>
            </div>
            <div className="h-px bg-gray-100"></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">自动播放</p>
                  <p className="text-xs text-gray-500">进入游戏自动开始</p>
                </div>
              </div>
              <button
                onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
                className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                  autoPlayEnabled ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                    autoPlayEnabled ? 'left-7' : 'left-1'
                  }`}
                ></div>
              </button>
            </div>
          </div>
        </div>

        {/* 隐私设置 */}
        <div className="mb-6 animate-fade-in-up delay-500">
          <h2 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            <span>隐私设置</span>
          </h2>
          <div className="bg-white rounded-3xl shadow-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                  <Eye className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">公开资料</p>
                  <p className="text-xs text-gray-500">允许他人查看我的信息</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                  showProfile ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                    showProfile ? 'left-7' : 'left-1'
                  }`}
                ></div>
              </button>
            </div>
            <div className="h-px bg-gray-100"></div>
            <button className="w-full flex items-center justify-between hover:bg-gray-50 rounded-xl p-2 -m-2 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800">黑名单管理</p>
                  <p className="text-xs text-gray-500">管理已屏蔽的用户</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>

        {/* 其他设置 */}
        <div className="mb-6 animate-fade-in-up delay-600">
          <h2 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
            <Info className="w-5 h-5 text-purple-500" />
            <span>更多</span>
          </h2>
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center">
                  <Info className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800">关于我们</p>
                  <p className="text-xs text-gray-500">版本 1.0.0</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
            </button>
            <div className="h-px bg-gray-100"></div>
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-orange-500" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800">帮助与反馈</p>
                  <p className="text-xs text-gray-500">遇到问题？告诉我们</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
            </button>
            <div className="h-px bg-gray-100"></div>
            <button
              onClick={handleClearCache}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800">清除缓存</p>
                  <p className="text-xs text-gray-500">释放存储空间</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">125 MB</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          </div>
        </div>

        {/* 退出登录 */}
        <button
          onClick={() => {
            if (confirm('确定要退出登录吗？')) {
              onLogout();
            }
          }}
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 rounded-2xl font-black shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 mb-6 animate-fade-in-up delay-700"
        >
          <LogOut className="w-5 h-5" />
          <span>退出登录</span>
        </button>
      </div>

      <style>{`
        @keyframes slide-down {
          from { 
            opacity: 0;
            transform: translateY(-20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
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
        
        .animate-slide-down {
          animation: slide-down 0.6s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
        .delay-700 { animation-delay: 0.7s; }
      `}</style>
    </div>
  );
}
