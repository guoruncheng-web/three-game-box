/**
 * 我的页面 - 基于 Figma 设计
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TabBar } from '@/components/layout/TabBar';
import { useAuth } from '@/stores/authHooks';
import type { TabItem } from '@/components/layout/TabBar';

// TabBar 配置
const tabs: TabItem[] = [
    {
        key: 'home',
        label: '首页',
        icon: '/images/tabbar/icon-home.svg',
        activeIcon: '/images/tabbar/icon-home-active.svg',
        path: '/',
    },
    {
        key: 'mine',
        label: '我的',
        icon: '/images/tabbar/icon-profile.svg',
        activeIcon: '/images/tabbar/icon-profile-active.svg',
        path: '/mine',
    },
];

// 快捷操作按钮数据
const quickActions = [
    {
        id: 'friends',
        name: '好友',
        icon: '/images/profile/icon-friends.svg',
        gradient: 'linear-gradient(135deg, rgb(81, 162, 255) 0%, rgb(0, 211, 242) 100%)',
    },
    {
        id: 'message',
        name: '消息',
        icon: '/images/profile/icon-message.svg',
        gradient: 'linear-gradient(135deg, rgb(5, 223, 114) 0%, rgb(0, 212, 146) 100%)',
    },
    {
        id: 'share',
        name: '分享',
        icon: '/images/profile/icon-share.svg',
        gradient: 'linear-gradient(135deg, rgb(255, 137, 4) 0%, rgb(255, 185, 0) 100%)',
    },
    {
        id: 'notification',
        name: '通知',
        icon: '/images/profile/icon-notification.svg',
        gradient: 'linear-gradient(135deg, rgb(255, 100, 103) 0%, rgb(251, 100, 182) 100%)',
        badge: true,
    },
];

// 最近玩过的游戏数据
const recentGames = [
    {
        id: '1',
        name: '消消乐',
        emoji: '🍬',
        time: '2分钟前',
        score: 8520,
        hot: true,
    },
    {
        id: '2',
        name: '跑酷大冒险',
        emoji: '🏃',
        time: '1小时前',
        score: 6340,
        hot: false,
    },
    {
        id: '3',
        name: '泡泡射击',
        emoji: '🎯',
        time: '昨天',
        score: 4520,
        hot: false,
    },
];

// 成就徽章数据
const achievements = [
    {
        id: '1',
        name: '新手上路',
        description: '完成首次游戏',
        emoji: '🎯',
        progress: 100,
        unlocked: true,
    },
    {
        id: '2',
        name: '连胜王者',
        description: '连续赢得10场游戏',
        emoji: '👑',
        progress: 80,
        unlocked: false,
    },
    {
        id: '3',
        name: '游戏达人',
        description: '玩过20款不同游戏',
        emoji: '⭐',
        progress: 60,
        unlocked: false,
    },
    {
        id: '4',
        name: '时间管理',
        description: '累计游戏100小时',
        emoji: '⏰',
        progress: 100,
        unlocked: true,
    },
    {
        id: '5',
        name: '收藏家',
        description: '收藏50款游戏',
        emoji: '💎',
        progress: 45,
        unlocked: false,
    },
    {
        id: '6',
        name: '社交达人',
        description: '添加100位好友',
        emoji: '👥',
        progress: 90,
        unlocked: false,
    },
];

// 菜单项数据
const menuItems = [
    {
        id: 'collection',
        name: '我的收藏',
        subtitle: '15款游戏',
        icon: '/images/profile/icon-heart.svg',
        gradient: 'linear-gradient(135deg, rgb(252, 231, 243) 0%, rgb(255, 228, 230) 100%)',
    },
    {
        id: 'gift',
        name: '每日礼包',
        subtitle: '领取每日奖励',
        icon: '/images/profile/icon-gift.svg',
        gradient: 'linear-gradient(135deg, rgb(255, 237, 212) 0%, rgb(254, 243, 198) 100%)',
        isNew: true,
    },
    {
        id: 'ranking',
        name: '排行榜',
        subtitle: '当前排名',
        icon: '/images/profile/icon-trophy.svg',
        gradient: 'linear-gradient(135deg, rgb(243, 232, 255) 0%, rgb(224, 231, 255) 100%)',
        rank: '#328',
    },
];

// 用户信息类型
interface UserData {
    id: string;
    username: string | null;
    level: number;
    totalScore: number;
    gamesPlayed: number;
    highestScore: number;
    totalPlayTime: number;
}

// 游戏统计类型
interface GameStats {
    overview: {
        gamesPlayed: number;
        totalScore: number;
        highestScore: number;
        totalPlayTime: number;
        level: number;
        winRate: number;
    };
    records: {
        maxScore: number;
        maxCombo: number;
        totalGames: number;
    };
}

// 游戏记录类型
interface GameRecord {
    id: string;
    score: number;
    isWon: boolean;
    createdAt: string;
}

// 成就类型
interface Achievement {
    id: string;
    code: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    reward: number;
    progress: number;
    isUnlocked: boolean;
    unlockedAt: string | null;
}

export default function MinePage() {
    const router = useRouter();
    const { logout, user, isAuthenticated, isInitialized } = useAuth();
    const [activeTab, setActiveTab] = useState<'achievements' | 'tasks'>('achievements');
    const [userId, setUserId] = useState<string | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [gameStats, setGameStats] = useState<GameStats | null>(null);
    const [recentGamesData, setRecentGamesData] = useState<GameRecord[]>([]);
    const [achievementsData, setAchievementsData] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);

    // 判断是否为超级管理员
    const isSuperAdmin = user?.role === 'super_admin';

    // 初始化用户数据
    useEffect(() => {
        const initUserData = async () => {
            try {
                // 从 localStorage 获取 userId
                let storedUserId = localStorage.getItem('userId');

                if (!storedUserId) {
                    // 创建新的游客用户
                    const response = await fetch('/api/users/guest', {
                        method: 'POST',
                    });

                    if (response.ok) {
                        const { data } = await response.json();
                        storedUserId = data.userId;
                        localStorage.setItem('userId', data.userId);
                        localStorage.setItem('guestToken', data.guestToken);
                    }
                }

                setUserId(storedUserId);

                if (storedUserId) {
                    // 并行请求所有数据
                    const [userRes, statsRes, recordsRes, achievementsRes] = await Promise.all([
                        fetch(`/api/users/${storedUserId}`),
                        fetch(`/api/game-records/stats?userId=${storedUserId}`),
                        fetch(`/api/game-records?userId=${storedUserId}&limit=3`),
                        fetch(`/api/achievements/user/${storedUserId}`),
                    ]);

                    // 用户信息
                    if (userRes.ok) {
                        const { data } = await userRes.json();
                        setUserData(data);
                    }

                    // 游戏统计
                    if (statsRes.ok) {
                        const { data } = await statsRes.json();
                        setGameStats(data);
                    }

                    // 最近游戏
                    if (recordsRes.ok) {
                        const { data } = await recordsRes.json();
                        setRecentGamesData(data.records);
                    }

                    // 成就列表
                    if (achievementsRes.ok) {
                        const { data } = await achievementsRes.json();
                        setAchievementsData(data.achievements);
                    }
                }

                setLoading(false);
            } catch (error) {
                console.error('数据加载失败:', error);
                setLoading(false);
            }
        };

        initUserData();
    }, []);

    // 未登录重定向到登录页（等待认证初始化完成后再检查）
    useEffect(() => {
        if (isInitialized && !isAuthenticated) {
            router.push('/login');
        }
    }, [isInitialized, isAuthenticated, router]);

    // 认证状态未初始化时显示加载
    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f3e8ff] via-[#fef3c7] to-[#ffedd4]">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-bounce">🎮</div>
                    <p className="text-lg font-bold text-gray-600">加载中...</p>
                </div>
            </div>
        );
    }

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#f3e8ff] via-[#fef3c7] to-[#ffedd4]">
            {/* 主要内容区域 */}
            <div className="max-w-md mx-auto px-4 pt-4 pb-24">
                {/* 用户信息卡片 */}
                <div
                    className="relative rounded-3xl overflow-hidden shadow-2xl animate-slide-down"
                    style={{
                        backgroundImage: 'linear-gradient(145.532deg, rgb(173, 70, 255) 0%, rgb(246, 51, 154) 50%, rgb(255, 105, 0) 100%)',
                    }}
                >
                    {/* 装饰圆形 */}
                    <div className="absolute -top-16 right-[-30px] w-32 h-32 rounded-full bg-white/10 opacity-60 animate-pulse-soft" />
                    <div className="absolute -bottom-12 -left-12 w-24 h-24 rounded-full bg-white/10 opacity-50 animate-pulse-soft delay-500" />

                    <div className="relative p-6">
                        {/* 头像和用户名 */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                {/* 头像 */}
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center animate-bounce-gentle">
                                        <span className="text-4xl">🎮</span>
                                    </div>
                                    {/* 编辑按钮 */}
                                    <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#fdc700] shadow-lg flex items-center justify-center">
                                        <Image
                                            src="/images/profile/icon-camera.svg"
                                            alt="edit"
                                            width={16}
                                            height={16}
                                        />
                                    </button>
                                </div>

                                {/* 用户名和等级 */}
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-black text-white">
                                            {userData?.username || '游客玩家'}
                                        </span>
                                        <Image
                                            src="/images/profile/icon-verified.svg"
                                            alt="verified"
                                            width={20}
                                            height={20}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                                        <Image
                                            src="/images/profile/icon-star.svg"
                                            alt="level"
                                            width={16}
                                            height={16}
                                        />
                                        <span className="text-sm font-bold text-white">
                                            LV.{userData?.level || 1}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 设置按钮 */}
                            <button
                                onClick={() => router.push('/settings')}
                                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
                            >
                                <Image
                                    src="/images/profile/icon-settings.svg"
                                    alt="settings"
                                    width={20}
                                    height={20}
                                />
                            </button>
                        </div>

                        {/* 经验条 */}
                        <div className="bg-white/20 rounded-full p-1 mb-4">
                            <div className="relative h-3 bg-white/30 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${((userData?.totalScore || 0) % 1000) / 10}%`,
                                        backgroundImage: 'linear-gradient(to right, #ffdf20, #ffb86a)',
                                    }}
                                />
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-black text-white drop-shadow-lg">
                                    {(userData?.totalScore || 0) % 1000} / 1000 EXP
                                </span>
                            </div>
                        </div>

                        {/* 游戏统计 */}
                        <div className="flex gap-3">
                            {/* 总得分 */}
                            <div className="flex-1 bg-white/20 rounded-2xl p-3 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#fdc700] shadow-lg flex items-center justify-center">
                                    <span className="text-xl">🎯</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-xs text-white/80">总分</span>
                                    <span className="text-lg font-black text-white">{userData?.totalScore || 0}</span>
                                </div>
                            </div>

                            {/* 游戏局数 */}
                            <div className="flex-1 bg-white/20 rounded-2xl p-3 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#51a2ff] shadow-lg flex items-center justify-center">
                                    <span className="text-xl">🎮</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-xs text-white/80">游戏局数</span>
                                    <span className="text-lg font-black text-white">{userData?.gamesPlayed || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 快捷操作按钮 */}
                <div className="flex gap-3 mt-6 animate-fade-in-up delay-100">
                    {quickActions.map((action) => (
                        <button
                            key={action.id}
                            className="flex-1 bg-white rounded-2xl shadow-md p-3 flex flex-col items-center gap-2 hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 group relative"
                        >
                            <div
                                className="w-12 h-12 rounded-[14px] shadow-md flex items-center justify-center relative group-hover:rotate-12 transition-transform"
                                style={{ backgroundImage: action.gradient }}
                            >
                                <Image
                                    src={action.icon}
                                    alt={action.name}
                                    width={24}
                                    height={24}
                                />
                            </div>
                            <span className="text-xs font-bold text-[#364153]">{action.name}</span>
                            {action.badge && (
                                <div className="absolute top-2 right-2 w-2 h-2 bg-[#fb2c36] rounded-full opacity-60" />
                            )}
                        </button>
                    ))}
                </div>

                {/* 最近玩过 */}
                <div className="mt-6 animate-fade-in-up delay-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-black text-[#1e2939]">最近玩过</h2>
                            <Image
                                src="/images/profile/icon-clock.svg"
                                alt="clock"
                                width={20}
                                height={20}
                            />
                        </div>
                        <button className="text-sm font-bold text-[#9810fa]">
                            查看全部 →
                        </button>
                    </div>

                    <div className="flex flex-col gap-3">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin text-4xl">🎮</div>
                                <p className="text-sm text-gray-500 mt-2">加载中...</p>
                            </div>
                        ) : recentGamesData.length > 0 ? (
                            recentGamesData.map((game, index) => {
                                const timeAgo = new Date(game.createdAt).toLocaleString('zh-CN');
                                return (
                                    <div
                                        key={game.id}
                                        className="bg-white rounded-2xl shadow-md px-4 py-4 flex items-center justify-between hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div
                                                    className="w-14 h-14 rounded-2xl shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                                                    style={{
                                                        backgroundImage: game.isWon
                                                            ? 'linear-gradient(135deg, rgb(233, 212, 255) 0%, rgb(252, 206, 232) 100%)'
                                                            : 'linear-gradient(135deg, rgb(220, 220, 220) 0%, rgb(200, 200, 200) 100%)',
                                                    }}
                                                >
                                                    <span className="text-3xl">{game.isWon ? '🍓' : '😢'}</span>
                                                </div>
                                                {index === 0 && (
                                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#fb2c36] rounded-full flex items-center justify-center">
                                                        <span className="text-xs">🔥</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-base font-black text-[#1e2939]">水果消消乐</span>
                                                <span className="text-xs font-medium text-[#6a7282]">{timeAgo}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-black text-[#9810fa]">{game.score}</span>
                                            <span className="text-xs font-medium text-[#99a1af]">{game.isWon ? '胜利' : '失败'}</span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                                <span className="text-4xl">🎮</span>
                                <p className="mt-2 text-sm text-gray-600">还没有游戏记录</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 成就徽章 / 每日任务 切换 */}
                <div className="mt-6 bg-white rounded-2xl shadow-lg p-1 animate-fade-in-up delay-300">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('achievements')}
                            className={`flex-1 py-3 rounded-[14px] text-sm font-black transition-all ${
                                activeTab === 'achievements'
                                    ? 'text-white shadow-md'
                                    : 'text-[#6a7282]'
                            }`}
                            style={
                                activeTab === 'achievements'
                                    ? { backgroundImage: 'linear-gradient(to right, #ad46ff, #f6339a)' }
                                    : {}
                            }
                        >
                            🏆 成就徽章
                        </button>
                        <button
                            onClick={() => setActiveTab('tasks')}
                            className={`flex-1 py-3 rounded-[14px] text-sm font-black transition-all relative ${
                                activeTab === 'tasks'
                                    ? 'text-white shadow-md'
                                    : 'text-[#6a7282]'
                            }`}
                            style={
                                activeTab === 'tasks'
                                    ? { backgroundImage: 'linear-gradient(to right, #ad46ff, #f6339a)' }
                                    : {}
                            }
                        >
                            📋 每日任务
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#fb2c36] rounded-full flex items-center justify-center">
                                <span className="text-xs font-black text-white">2</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* 成就列表 */}
                {activeTab === 'achievements' && (
                    <div className="mt-3 flex flex-col gap-3 animate-fade-in">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin text-4xl">🏆</div>
                                <p className="text-sm text-gray-500 mt-2">加载中...</p>
                            </div>
                        ) : achievementsData.length > 0 ? (
                            achievementsData.map((achievement) => (
                                <div
                                    key={achievement.id}
                                    className={`bg-white rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02] ${
                                        achievement.isUnlocked
                                            ? 'border border-[#fdc700] shadow-[0px_0px_16px_0px_rgba(250,204,21,0.73)] animate-glow'
                                            : 'shadow-md hover:shadow-xl'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            {/* 成就图标 */}
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${!achievement.isUnlocked ? 'opacity-50 grayscale' : ''}`}
                                                 style={{
                                                     backgroundImage: achievement.isUnlocked
                                                         ? 'linear-gradient(135deg, #fdc700 0%, #ff8904 100%)'
                                                         : 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
                                                 }}>
                                                {achievement.icon?.startsWith('/images/') ? (
                                                    <span className="text-2xl">
                                                        {achievement.category === 'SCORE' ? '🎯' :
                                                         achievement.category === 'COMBO' ? '⚡' :
                                                         achievement.category === 'GAMES' ? '🎮' :
                                                         achievement.category === 'TIME' ? '⏰' :
                                                         achievement.category === 'SPECIAL' ? '⭐' : '🏆'}
                                                    </span>
                                                ) : (
                                                    <span className="text-2xl">{achievement.icon || '🏆'}</span>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-base font-black text-[#1e2939]">
                                                    {achievement.name}
                                                </span>
                                                <span className="text-xs font-medium text-[#6a7282]">
                                                    {achievement.description}
                                                </span>
                                                {achievement.isUnlocked && (
                                                    <div className="flex items-center gap-1">
                                                        <Image
                                                            src="/images/profile/icon-check.svg"
                                                            alt="check"
                                                            width={12}
                                                            height={12}
                                                        />
                                                        <span className="text-xs font-bold text-[#d08700]">
                                                            已解锁 · +{achievement.reward}积分
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span
                                            className={`text-sm font-black ${
                                                achievement.isUnlocked ? 'text-[#d08700]' : 'text-[#9810fa]'
                                            }`}
                                        >
                                            {achievement.progress}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-[#f3f4f6] rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${achievement.progress}%`,
                                                backgroundImage: achievement.isUnlocked
                                                    ? 'linear-gradient(to right, #fdc700, #ff8904)'
                                                    : 'linear-gradient(to right, #c27aff, #fb64b6)',
                                            }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                                <span className="text-4xl">🏆</span>
                                <p className="mt-2 text-sm text-gray-600">还没有成就记录</p>
                            </div>
                        )}
                    </div>
                )}

                {/* 每日任务（占位） */}
                {activeTab === 'tasks' && (
                    <div className="mt-3 bg-white rounded-2xl p-6 shadow-md animate-fade-in">
                        <div className="text-center text-[#6a7282]">
                            <span className="text-4xl">📋</span>
                            <p className="mt-2 text-sm font-medium">每日任务功能即将上线</p>
                        </div>
                    </div>
                )}

                {/* 菜单列表 */}
                <div className="mt-6 bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in-up delay-400">
                    {/* 创建账号（仅超级管理员） */}
                    {isSuperAdmin && (
                        <>
                            <button
                                onClick={() => router.push('/admin/create-user')}
                                className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-[14px] flex items-center justify-center"
                                        style={{
                                            backgroundImage: 'linear-gradient(135deg, rgb(147, 51, 234) 0%, rgb(219, 39, 119) 100%)',
                                        }}
                                    >
                                        <span className="text-xl">👤</span>
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="text-base font-bold text-[#1e2939]">创建账号</span>
                                        <span className="text-xs font-normal text-[#6a7282]">添加新用户</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-[#fef2f2] rounded-full text-xs font-black text-[#9333ea] opacity-60">
                                        ADMIN
                                    </span>
                                    <Image
                                        src="/images/profile/icon-chevron-right.svg"
                                        alt="arrow"
                                        width={20}
                                        height={20}
                                        className="group-hover:translate-x-1 transition-transform"
                                    />
                                </div>
                            </button>
                            <div className="h-[1px] bg-[#f3f4f6]" />
                        </>
                    )}

                    {menuItems.map((item, index) => (
                        <div key={item.id}>
                            <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-[14px] flex items-center justify-center"
                                        style={{ backgroundImage: item.gradient }}
                                    >
                                        <Image
                                            src={item.icon}
                                            alt={item.name}
                                            width={20}
                                            height={20}
                                        />
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="text-base font-bold text-[#1e2939]">{item.name}</span>
                                        <span className="text-xs font-normal text-[#6a7282]">{item.subtitle}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {item.isNew && (
                                        <span className="px-2 py-1 bg-[#fef2f2] rounded-full text-xs font-black text-[#fb2c36] opacity-60">
                                            NEW
                                        </span>
                                    )}
                                    {item.rank && (
                                        <span className="text-sm font-black text-[#9810fa]">{item.rank}</span>
                                    )}
                                    <Image
                                        src="/images/profile/icon-chevron-right.svg"
                                        alt="arrow"
                                        width={20}
                                        height={20}
                                        className="group-hover:translate-x-1 transition-transform"
                                    />
                                </div>
                            </button>
                            {index < menuItems.length - 1 && (
                                <div className="h-[1px] bg-[#f3f4f6]" />
                            )}
                        </div>
                    ))}
                </div>

                {/* 退出登录按钮 */}
                <button
                    onClick={handleLogout}
                    className="w-full mt-6 py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 animate-fade-in-up delay-500"
                    style={{
                        backgroundImage: 'linear-gradient(to right, #fb2c36, #f6339a)',
                    }}
                >
                    <Image
                        src="/images/profile/icon-logout.svg"
                        alt="logout"
                        width={20}
                        height={20}
                    />
                    <span className="text-base font-black text-white">退出登录</span>
                </button>
            </div>

            {/* 底部导航栏 */}
            <TabBar tabs={tabs} />
        </div>
    );
}
