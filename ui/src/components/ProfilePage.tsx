import { Settings, Trophy, Star, Clock, Heart, Gift, Crown, LogOut, ChevronRight, Zap, Medal, Users, MessageCircle, Share2, Bell, Edit } from 'lucide-react';
import { useState } from 'react';
import { SettingsPage } from './SettingsPage';

interface ProfilePageProps {
  onLogout: () => void;
}

// 模拟用户数据
const userData = {
  name: '快乐玩家',
  avatar: '🎮',
  level: 15,
  exp: 2350,
  nextLevelExp: 3000,
  coins: 1280,
  diamonds: 45,
  achievements: 12,
  totalGames: 28,
  totalPlayTime: '126小时',
  ranking: 328,
};

// 最近玩过的游戏
const recentGames = [
  { name: '消消乐', emoji: '🍬', lastPlayed: '2分钟前', score: 8520 },
  { name: '跑酷大冒险', emoji: '🏃', lastPlayed: '1小时前', score: 6340 },
  { name: '泡泡射击', emoji: '🎯', lastPlayed: '昨天', score: 4520 },
];

// 成就数据
const achievements = [
  { title: '新手上路', emoji: '🎯', progress: 100, unlocked: true, desc: '完成首次游戏' },
  { title: '连胜王者', emoji: '👑', progress: 80, unlocked: false, desc: '连续赢得10场游戏' },
  { title: '游戏达人', emoji: '⭐', progress: 60, unlocked: false, desc: '玩过20款不同游戏' },
  { title: '时间管理', emoji: '⏰', progress: 100, unlocked: true, desc: '累计游戏100小时' },
  { title: '收藏家', emoji: '💎', progress: 45, unlocked: false, desc: '收藏50款游戏' },
  { title: '社交达人', emoji: '👥', progress: 90, unlocked: false, desc: '添加100位好友' },
];

// 每日任务
const dailyTasks = [
  { title: '登录游戏', reward: 10, completed: true, emoji: '✅' },
  { title: '完成3局游戏', reward: 20, completed: true, emoji: '🎮' },
  { title: '分享给好友', reward: 30, completed: false, emoji: '📤' },
  { title: '观看广告', reward: 50, completed: false, emoji: '📺' },
];

export function ProfilePage({ onLogout }: ProfilePageProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'achievements' | 'tasks'>('achievements');
  const [name, setName] = useState(userData.name);

  // 如果显示设置页面，则渲染设置组件
  if (showSettings) {
    return (
      <SettingsPage
        onBack={() => setShowSettings(false)}
        onLogout={onLogout}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-4">
      {/* 用户信息卡片 */}
      <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl p-6 mb-6 shadow-2xl relative overflow-hidden animate-slide-down">
        {/* 装饰元素 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse-soft"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 animate-pulse-soft delay-500"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* 头像 */}
              <div className="relative">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl animate-bounce-gentle">
                  <span className="text-4xl">{userData.avatar}</span>
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Edit className="w-4 h-4 text-white" />
                </button>
              </div>
              <div>
                <h2 className="text-white text-2xl font-black mb-1 flex items-center gap-2">
                  {userData.name}
                  <Medal className="w-5 h-5 text-yellow-300" fill="currentColor" />
                </h2>
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  <Crown className="w-4 h-4 text-yellow-300" fill="currentColor" />
                  <span className="text-white font-bold text-sm">LV.{userData.level}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110 hover:rotate-90 duration-300"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* 经验条 */}
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-1 mb-4">
            <div className="relative">
              <div className="h-3 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full transition-all duration-500 shadow-inner"
                  style={{ width: `${(userData.exp / userData.nextLevelExp) * 100}%` }}
                ></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-black text-white drop-shadow-lg">
                  {userData.exp} / {userData.nextLevelExp} EXP
                </span>
              </div>
            </div>
          </div>

          {/* 货币信息 */}
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 flex items-center gap-3 hover:bg-white/30 transition-all hover:scale-105 active:scale-95">
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-wiggle-gentle">
                <span className="text-xl">💰</span>
              </div>
              <div>
                <p className="text-white/80 text-xs font-medium">金币</p>
                <p className="text-white text-lg font-black">{userData.coins}</p>
              </div>
            </button>
            <button className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 flex items-center gap-3 hover:bg-white/30 transition-all hover:scale-105 active:scale-95">
              <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center shadow-lg animate-wiggle-gentle delay-300">
                <span className="text-xl">💎</span>
              </div>
              <div>
                <p className="text-white/80 text-xs font-medium">钻石</p>
                <p className="text-white text-lg font-black">{userData.diamonds}</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 快捷功能按钮 */}
      <div className="grid grid-cols-4 gap-3 mb-6 animate-fade-in-up delay-100">
        <button className="bg-white rounded-2xl p-3 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 flex flex-col items-center gap-2 group">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-md group-hover:rotate-12 transition-transform">
            <Users className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-bold text-gray-700">好友</span>
        </button>
        <button className="bg-white rounded-2xl p-3 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 flex flex-col items-center gap-2 group">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-xl flex items-center justify-center shadow-md group-hover:rotate-12 transition-transform">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-bold text-gray-700">消息</span>
          <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center">3</span>
        </button>
        <button className="bg-white rounded-2xl p-3 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 flex flex-col items-center gap-2 group">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-400 rounded-xl flex items-center justify-center shadow-md group-hover:rotate-12 transition-transform">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-bold text-gray-700">分享</span>
        </button>
        <button className="bg-white rounded-2xl p-3 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 flex flex-col items-center gap-2 group relative">
          <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-400 rounded-xl flex items-center justify-center shadow-md group-hover:rotate-12 transition-transform">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-bold text-gray-700">通知</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        </button>
      </div>

      {/* 最近游戏 */}
      <div className="mb-6 animate-fade-in-up delay-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
            <span>最近玩过</span>
            <Clock className="w-5 h-5 text-purple-500" />
          </h3>
          <button className="text-sm text-purple-600 font-bold hover:scale-105 transition-transform">
            查看全部 →
          </button>
        </div>
        <div className="space-y-3">
          {recentGames.map((game, index) => (
            <button
              key={index}
              className="w-full bg-white rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-between hover:scale-[1.02] active:scale-95 group"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-200 to-pink-200 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl">{game.emoji}</span>
                  </div>
                  {index === 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-black">🔥</span>
                    </div>
                  )}
                </div>
                <div className="text-left">
                  <p className="font-black text-gray-800">{game.name}</p>
                  <p className="text-xs text-gray-500 font-medium">{game.lastPlayed}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-purple-600">{game.score}</p>
                <p className="text-xs text-gray-400 font-medium">最高分</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 成就和任务切换标签 */}
      <div className="mb-4 animate-fade-in-up delay-300">
        <div className="bg-white rounded-2xl p-1 shadow-lg flex gap-2">
          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex-1 py-3 rounded-xl font-black text-sm transition-all duration-300 ${
              activeTab === 'achievements'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md scale-105'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🏆 成就徽章
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-3 rounded-xl font-black text-sm transition-all duration-300 relative ${
              activeTab === 'tasks'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md scale-105'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📋 每日任务
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center">2</span>
          </button>
        </div>
      </div>

      {/* 成就进度 */}
      {activeTab === 'achievements' && (
        <div className="mb-6 animate-fade-in">
          <div className="space-y-3">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-4 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                  achievement.unlocked ? 'border-2 border-yellow-400 animate-glow' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`text-3xl ${achievement.unlocked ? 'animate-bounce-gentle' : 'grayscale opacity-50'}`}>
                      {achievement.emoji}
                    </div>
                    <div>
                      <p className="font-black text-gray-800">{achievement.title}</p>
                      <p className="text-xs text-gray-500 font-medium">{achievement.desc}</p>
                      {achievement.unlocked && (
                        <p className="text-xs text-yellow-600 font-bold flex items-center gap-1 mt-1">
                          <Zap className="w-3 h-3" fill="currentColor" />
                          已解锁
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`text-sm font-black ${achievement.unlocked ? 'text-yellow-600' : 'text-purple-600'}`}>
                    {achievement.progress}%
                  </span>
                </div>
                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      achievement.unlocked
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                        : 'bg-gradient-to-r from-purple-400 to-pink-400'
                    }`}
                    style={{ width: `${achievement.progress}%` }}
                  >
                    {achievement.unlocked && (
                      <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 每日任务 */}
      {activeTab === 'tasks' && (
        <div className="mb-6 animate-fade-in">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 mb-4 border-2 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">今日任务进度</p>
                <p className="text-2xl font-black text-purple-600">2 / 4 完成</p>
              </div>
              <div className="text-4xl animate-bounce-gentle">🎁</div>
            </div>
          </div>
          
          <div className="space-y-3">
            {dailyTasks.map((task, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-4 shadow-md transition-all duration-300 hover:shadow-xl ${
                  task.completed ? 'border-2 border-green-400' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl ${task.completed ? 'animate-bounce-gentle' : ''}`}>
                      {task.emoji}
                    </div>
                    <div>
                      <p className={`font-black ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                        <span className="text-yellow-500">💰</span>
                        奖励 {task.reward} 金币
                      </p>
                    </div>
                  </div>
                  {task.completed ? (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-black">✓</span>
                    </div>
                  ) : (
                    <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-transform shadow-md">
                      去完成
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 菜单选项 */}
      <div className="mb-6 animate-fade-in-up delay-400">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-pink-500" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-800">我的收藏</p>
                <p className="text-xs text-gray-500">15款游戏</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
          </button>
          <div className="h-px bg-gray-100"></div>
          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center animate-wiggle-gentle">
                <Gift className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-800">每日礼包</p>
                <p className="text-xs text-gray-500">领取每日奖励</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-red-500 bg-red-50 px-2 py-1 rounded-full animate-pulse">NEW</span>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
            </div>
          </button>
          <div className="h-px bg-gray-100"></div>
          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-800">排行榜</p>
                <p className="text-xs text-gray-500">当前排名</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-purple-600">#{userData.ranking}</span>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        </div>
      </div>

      {/* 退出登录按钮 */}
      <button
        onClick={onLogout}
        className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 rounded-2xl font-black shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 mb-4 animate-fade-in-up delay-500"
      >
        <LogOut className="w-5 h-5" />
        <span>退出登录</span>
      </button>

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
        
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-3px) scale(1.05); }
        }
        
        @keyframes wiggle-gentle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(250, 204, 21, 0.5); }
          50% { box-shadow: 0 0 20px rgba(250, 204, 21, 0.8); }
        }
        
        .animate-slide-down {
          animation: slide-down 0.6s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
        
        .animate-wiggle-gentle {
          animation: wiggle-gentle 3s ease-in-out infinite;
        }
        
        .animate-pulse-soft {
          animation: pulse-soft 3s ease-in-out infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
      `}</style>
    </div>
  );
}