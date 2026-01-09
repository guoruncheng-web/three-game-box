/**
 * 设置页面 - 基于 Figma 设计
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/stores/authHooks';

// 开关组件
interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

function Toggle({ checked, onChange }: ToggleProps) {
    return (
        <button
            onClick={() => onChange(!checked)}
            className={`relative w-14 h-8 rounded-full transition-all ${
                checked
                    ? 'bg-gradient-to-r from-[#ad46ff] to-[#f6339a]'
                    : 'bg-[#d1d5dc]'
            }`}
        >
            <div
                className={`absolute top-1 h-6 w-6 bg-white rounded-full shadow-md transition-all ${
                    checked ? 'left-7' : 'left-1'
                }`}
            />
        </button>
    );
}

export default function SettingsPage() {
    const router = useRouter();
    const { logout } = useAuth();

    // 开关状态
    const [pushNotification, setPushNotification] = useState(true);
    const [sound, setSound] = useState(true);
    const [vibration, setVibration] = useState(true);
    const [autoplay, setAutoplay] = useState(false);
    const [publicProfile, setPublicProfile] = useState(true);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#f3e8ff] via-[#fef3c7] to-[#ffedd4]">
            <div className="px-4 pt-4 pb-6">
                {/* 头部 */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center"
                    >
                        <Image
                            src="/images/settings/icon-back.svg"
                            alt="back"
                            width={24}
                            height={24}
                        />
                    </button>
                    <h1
                        className="text-3xl font-black"
                        style={{
                            backgroundImage: 'linear-gradient(90deg, rgb(152, 16, 250) 0%, rgb(230, 0, 118) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        设置 ⚙️
                    </h1>
                </div>

                {/* 个人资料 */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Image
                            src="/images/settings/icon-user.svg"
                            alt="user"
                            width={20}
                            height={20}
                        />
                        <h2 className="text-lg font-black text-[#1e2939]">个人资料</h2>
                    </div>
                    <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                        {/* 更换头像 */}
                        <button className="w-full px-4 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div
                                        className="w-16 h-16 rounded-full shadow-lg flex items-center justify-center relative"
                                        style={{
                                            backgroundImage: 'linear-gradient(135deg, rgb(194, 122, 255) 0%, rgb(251, 100, 182) 100%)',
                                        }}
                                    >
                                        <span className="text-3xl">🎮</span>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#fdc700] shadow-lg flex items-center justify-center">
                                        <Image
                                            src="/images/settings/icon-camera.svg"
                                            alt="camera"
                                            width={12}
                                            height={12}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-base font-black text-[#1e2939]">更换头像</span>
                                    <span className="text-xs font-normal text-[#6a7282]">点击选择新头像</span>
                                </div>
                            </div>
                            <Image
                                src="/images/settings/icon-edit.svg"
                                alt="arrow"
                                width={20}
                                height={20}
                            />
                        </button>
                        <div className="h-[1px] bg-[#f3f4f6]" />
                        {/* 修改昵称 */}
                        <button className="w-full px-4 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-[14px] flex items-center justify-center"
                                    style={{
                                        backgroundImage: 'linear-gradient(135deg, rgb(219, 234, 254) 0%, rgb(206, 250, 254) 100%)',
                                    }}
                                >
                                    <Image
                                        src="/images/settings/icon-pencil.svg"
                                        alt="pencil"
                                        width={20}
                                        height={20}
                                    />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-base font-bold text-[#1e2939]">修改昵称</span>
                                    <span className="text-xs font-normal text-[#6a7282]">快乐玩家</span>
                                </div>
                            </div>
                            <Image
                                src="/images/settings/icon-edit.svg"
                                alt="arrow"
                                width={20}
                                height={20}
                            />
                        </button>
                        <div className="h-[1px] bg-[#f3f4f6]" />
                        {/* 个性签名 */}
                        <button className="w-full px-4 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-[14px] flex items-center justify-center"
                                    style={{
                                        backgroundImage: 'linear-gradient(135deg, rgb(220, 252, 231) 0%, rgb(208, 250, 229) 100%)',
                                    }}
                                >
                                    <Image
                                        src="/images/settings/icon-signature.svg"
                                        alt="signature"
                                        width={20}
                                        height={20}
                                    />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-base font-bold text-[#1e2939]">个性签名</span>
                                    <span className="text-xs font-normal text-[#6a7282]">游戏是快乐的源泉～</span>
                                </div>
                            </div>
                            <Image
                                src="/images/settings/icon-edit.svg"
                                alt="arrow"
                                width={20}
                                height={20}
                            />
                        </button>
                    </div>
                </div>

                {/* 账号安全 */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Image
                            src="/images/settings/icon-lock.svg"
                            alt="lock"
                            width={20}
                            height={20}
                        />
                        <h2 className="text-lg font-black text-[#1e2939]">账号安全</h2>
                    </div>
                    <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                        {/* 修改密码 */}
                        <button className="w-full px-4 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-[14px] flex items-center justify-center"
                                    style={{
                                        backgroundImage: 'linear-gradient(135deg, rgb(243, 232, 255) 0%, rgb(224, 231, 255) 100%)',
                                    }}
                                >
                                    <Image
                                        src="/images/settings/icon-key.svg"
                                        alt="key"
                                        width={20}
                                        height={20}
                                    />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-base font-bold text-[#1e2939]">修改密码</span>
                                    <span className="text-xs font-normal text-[#6a7282]">定期更换密码更安全</span>
                                </div>
                            </div>
                            <Image
                                src="/images/settings/icon-edit.svg"
                                alt="arrow"
                                width={20}
                                height={20}
                            />
                        </button>
                        <div className="h-[1px] bg-[#f3f4f6]" />
                        {/* 绑定手机 */}
                        <button className="w-full px-4 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-[14px] flex items-center justify-center"
                                    style={{
                                        backgroundImage: 'linear-gradient(135deg, rgb(220, 252, 231) 0%, rgb(208, 250, 229) 100%)',
                                    }}
                                >
                                    <Image
                                        src="/images/settings/icon-phone.svg"
                                        alt="phone"
                                        width={20}
                                        height={20}
                                    />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-base font-bold text-[#1e2939]">绑定手机</span>
                                    <span className="text-xs font-normal text-[#6a7282]">138****5678</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-[#f0fdf4] rounded-full text-xs font-bold text-[#00a63e]">
                                    已绑定
                                </span>
                                <Image
                                    src="/images/settings/icon-edit.svg"
                                    alt="arrow"
                                    width={20}
                                    height={20}
                                />
                            </div>
                        </button>
                        <div className="h-[1px] bg-[#f3f4f6]" />
                        {/* 绑定邮箱 */}
                        <button className="w-full px-4 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-[14px] flex items-center justify-center"
                                    style={{
                                        backgroundImage: 'linear-gradient(135deg, rgb(219, 234, 254) 0%, rgb(206, 250, 254) 100%)',
                                    }}
                                >
                                    <Image
                                        src="/images/settings/icon-email.svg"
                                        alt="email"
                                        width={20}
                                        height={20}
                                    />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-base font-bold text-[#1e2939]">绑定邮箱</span>
                                    <span className="text-xs font-normal text-[#6a7282]">user@example.com</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-[#f0fdf4] rounded-full text-xs font-bold text-[#00a63e]">
                                    已绑定
                                </span>
                                <Image
                                    src="/images/settings/icon-edit.svg"
                                    alt="arrow"
                                    width={20}
                                    height={20}
                                />
                            </div>
                        </button>
                    </div>
                </div>

                {/* 消息通知 */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Image
                            src="/images/settings/icon-bell.svg"
                            alt="bell"
                            width={20}
                            height={20}
                        />
                        <h2 className="text-lg font-black text-[#1e2939]">消息通知</h2>
                    </div>
                    <div className="bg-white rounded-3xl shadow-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-[14px] flex items-center justify-center"
                                    style={{
                                        backgroundImage: 'linear-gradient(135deg, rgb(255, 226, 226) 0%, rgb(252, 231, 243) 100%)',
                                    }}
                                >
                                    <Image
                                        src="/images/settings/icon-bell.svg"
                                        alt="bell"
                                        width={20}
                                        height={20}
                                    />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-base font-bold text-[#1e2939]">推送通知</span>
                                    <span className="text-xs font-normal text-[#6a7282]">接收游戏更新和活动</span>
                                </div>
                            </div>
                            <Toggle checked={pushNotification} onChange={setPushNotification} />
                        </div>
                    </div>
                </div>

                {/* 游戏设置 */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Image
                            src="/images/settings/icon-speaker.svg"
                            alt="speaker"
                            width={20}
                            height={20}
                        />
                        <h2 className="text-lg font-black text-[#1e2939]">游戏设置</h2>
                    </div>
                    <div className="bg-white rounded-3xl shadow-lg p-4 space-y-4">
                        {/* 音效 */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-[14px] flex items-center justify-center"
                                    style={{
                                        backgroundImage: 'linear-gradient(135deg, rgb(219, 234, 254) 0%, rgb(206, 250, 254) 100%)',
                                    }}
                                >
                                    <Image
                                        src="/images/settings/icon-speaker.svg"
                                        alt="speaker"
                                        width={20}
                                        height={20}
                                    />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-base font-bold text-[#1e2939]">音效</span>
                                    <span className="text-xs font-normal text-[#6a7282]">游戏音效和背景音乐</span>
                                </div>
                            </div>
                            <Toggle checked={sound} onChange={setSound} />
                        </div>
                        <div className="h-[1px] bg-[#f3f4f6]" />
                        {/* 震动反馈 */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-[14px] flex items-center justify-center"
                                    style={{
                                        backgroundImage: 'linear-gradient(135deg, rgb(243, 232, 255) 0%, rgb(224, 231, 255) 100%)',
                                    }}
                                >
                                    <Image
                                        src="/images/settings/icon-vibration.svg"
                                        alt="vibration"
                                        width={20}
                                        height={20}
                                    />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-base font-bold text-[#1e2939]">震动反馈</span>
                                    <span className="text-xs font-normal text-[#6a7282]">操作时的震动效果</span>
                                </div>
                            </div>
                            <Toggle checked={vibration} onChange={setVibration} />
                        </div>
                        <div className="h-[1px] bg-[#f3f4f6]" />
                        {/* 自动播放 */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-[14px] flex items-center justify-center"
                                    style={{
                                        backgroundImage: 'linear-gradient(135deg, rgb(220, 252, 231) 0%, rgb(208, 250, 229) 100%)',
                                    }}
                                >
                                    <Image
                                        src="/images/settings/icon-play.svg"
                                        alt="play"
                                        width={20}
                                        height={20}
                                    />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-base font-bold text-[#1e2939]">自动播放</span>
                                    <span className="text-xs font-normal text-[#6a7282]">进入游戏自动开始</span>
                                </div>
                            </div>
                            <Toggle checked={autoplay} onChange={setAutoplay} />
                        </div>
                    </div>
                </div>

                {/* 隐私设置 */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Image
                            src="/images/settings/icon-shield.svg"
                            alt="shield"
                            width={20}
                            height={20}
                        />
                        <h2 className="text-lg font-black text-[#1e2939]">隐私设置</h2>
                    </div>
                    <div className="bg-white rounded-3xl shadow-lg p-4 space-y-4">
                        {/* 公开资料 */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-[14px] flex items-center justify-center"
                                    style={{
                                        backgroundImage: 'linear-gradient(135deg, rgb(220, 252, 231) 0%, rgb(208, 250, 229) 100%)',
                                    }}
                                >
                                    <Image
                                        src="/images/settings/icon-eye.svg"
                                        alt="eye"
                                        width={20}
                                        height={20}
                                    />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-base font-bold text-[#1e2939]">公开资料</span>
                                    <span className="text-xs font-normal text-[#6a7282]">允许他人查看我的信息</span>
                                </div>
                            </div>
                            <Toggle checked={publicProfile} onChange={setPublicProfile} />
                        </div>
                        <div className="h-[1px] bg-[#f3f4f6]" />
                        {/* 黑名单管理 */}
                        <button className="w-full flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-[14px] flex items-center justify-center"
                                    style={{
                                        backgroundImage: 'linear-gradient(135deg, rgb(219, 234, 254) 0%, rgb(206, 250, 254) 100%)',
                                    }}
                                >
                                    <Image
                                        src="/images/settings/icon-blacklist.svg"
                                        alt="blacklist"
                                        width={20}
                                        height={20}
                                    />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-base font-bold text-[#1e2939]">黑名单管理</span>
                                    <span className="text-xs font-normal text-[#6a7282]">管理已屏蔽的用户</span>
                                </div>
                            </div>
                            <Image
                                src="/images/settings/icon-edit.svg"
                                alt="arrow"
                                width={20}
                                height={20}
                            />
                        </button>
                    </div>
                </div>

                {/* 更多 */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Image
                            src="/images/settings/icon-info.svg"
                            alt="info"
                            width={20}
                            height={20}
                        />
                        <h2 className="text-lg font-black text-[#1e2939]">更多</h2>
                    </div>
                    <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                        {/* 关于我们 */}
                        <button className="w-full px-4 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-[14px] flex items-center justify-center"
                                    style={{
                                        backgroundImage: 'linear-gradient(135deg, rgb(243, 232, 255) 0%, rgb(224, 231, 255) 100%)',
                                    }}
                                >
                                    <Image
                                        src="/images/settings/icon-info.svg"
                                        alt="info"
                                        width={20}
                                        height={20}
                                    />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-base font-bold text-[#1e2939]">关于我们</span>
                                    <span className="text-xs font-normal text-[#6a7282]">版本 1.0.0</span>
                                </div>
                            </div>
                            <Image
                                src="/images/settings/icon-edit.svg"
                                alt="arrow"
                                width={20}
                                height={20}
                            />
                        </button>
                        <div className="h-[1px] bg-[#f3f4f6]" />
                        {/* 帮助与反馈 */}
                        <button className="w-full px-4 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-[14px] flex items-center justify-center"
                                    style={{
                                        backgroundImage: 'linear-gradient(135deg, rgb(255, 237, 212) 0%, rgb(254, 243, 198) 100%)',
                                    }}
                                >
                                    <Image
                                        src="/images/settings/icon-help.svg"
                                        alt="help"
                                        width={20}
                                        height={20}
                                    />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-base font-bold text-[#1e2939]">帮助与反馈</span>
                                    <span className="text-xs font-normal text-[#6a7282]">遇到问题？告诉我们</span>
                                </div>
                            </div>
                            <Image
                                src="/images/settings/icon-edit.svg"
                                alt="arrow"
                                width={20}
                                height={20}
                            />
                        </button>
                        <div className="h-[1px] bg-[#f3f4f6]" />
                        {/* 清除缓存 */}
                        <button className="w-full px-4 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-[14px] flex items-center justify-center"
                                    style={{
                                        backgroundImage: 'linear-gradient(135deg, rgb(255, 226, 226) 0%, rgb(252, 231, 243) 100%)',
                                    }}
                                >
                                    <Image
                                        src="/images/settings/icon-trash.svg"
                                        alt="trash"
                                        width={20}
                                        height={20}
                                    />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-base font-bold text-[#1e2939]">清除缓存</span>
                                    <span className="text-xs font-normal text-[#6a7282]">释放存储空间</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-normal text-[#6a7282]">125 MB</span>
                                <Image
                                    src="/images/settings/icon-edit.svg"
                                    alt="arrow"
                                    width={20}
                                    height={20}
                                />
                            </div>
                        </button>
                    </div>
                </div>

                {/* 退出登录 */}
                <button
                    onClick={handleLogout}
                    className="w-full py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2"
                    style={{
                        backgroundImage: 'linear-gradient(to right, #fb2c36, #f6339a)',
                    }}
                >
                    <Image
                        src="/images/settings/icon-logout.svg"
                        alt="logout"
                        width={20}
                        height={20}
                    />
                    <span className="text-base font-black text-white">退出登录</span>
                </button>
            </div>
        </div>
    );
}
