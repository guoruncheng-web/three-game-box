/**
 * 底部导航栏组件
 * 基于 Figma 设计实现
 */

'use client';

import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';

export interface TabItem {
    key: string;
    label: string;
    icon?: string;
    activeIcon?: string;
    path: string;
}

interface TabBarProps {
    tabs: TabItem[];
}

export function TabBar({ tabs }: TabBarProps) {
    const router = useRouter();
    const pathname = usePathname();

    const handleTabClick = (tab: TabItem) => {
        router.push(tab.path);
    };

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white safe-area-inset"
            style={{
                borderTop: '4px solid #e9d4ff',
                boxShadow: '0px -4px 20px rgba(0, 0, 0, 0.08)',
            }}
        >
            <div className="flex items-center h-[76px] px-4 pt-4 pb-0">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.path || pathname.startsWith(tab.path + '/');

                    return (
                        <button
                            key={tab.key}
                            onClick={() => handleTabClick(tab)}
                            className={`
                                flex-1 h-full relative
                                flex flex-col items-center justify-center
                                transition-all duration-200
                            `}
                        >
                            {isActive ? (
                                // 激活状态 - 渐变背景按钮
                                <div
                                    className="flex flex-col items-center justify-center gap-[5px] w-[182px] h-[80px] rounded-[16px]"
                                    style={{
                                        backgroundImage: 'linear-gradient(156.284deg, rgb(173, 70, 255) 0%, rgb(246, 51, 154) 100%)',
                                        boxShadow: '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                    }}
                                >
                                    {/* 激活状态图标 */}
                                    <div className="relative w-[29px] h-[29px]">
                                        {tab.activeIcon ? (
                                            <Image
                                                src={tab.activeIcon}
                                                alt={tab.label}
                                                width={29}
                                                height={29}
                                                className="object-contain"
                                            />
                                        ) : (
                                            <span className="text-white text-xl">
                                                {tab.key === 'home' ? '🏠' : '👤'}
                                            </span>
                                        )}
                                    </div>
                                    {/* 激活状态文字 */}
                                    <span className="font-bold text-[14px] text-white leading-[20px] tracking-[-0.15px]">
                                        {tab.label}
                                    </span>
                                </div>
                            ) : (
                                // 未激活状态
                                <div className="flex flex-col items-center justify-center gap-1 w-[173px] h-[76px] rounded-[16px]">
                                    {/* 未激活状态图标 */}
                                    <div className="relative w-[28px] h-[28px]">
                                        {tab.icon ? (
                                            <Image
                                                src={tab.icon}
                                                alt={tab.label}
                                                width={28}
                                                height={28}
                                                className="object-contain"
                                            />
                                        ) : (
                                            <span className="text-[#99a1af] text-xl">
                                                {tab.key === 'home' ? '🏠' : '👤'}
                                            </span>
                                        )}
                                    </div>
                                    {/* 未激活状态文字 */}
                                    <span className="font-bold text-[14px] text-[#99a1af] leading-[20px] tracking-[-0.15px]">
                                        {tab.label}
                                    </span>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
