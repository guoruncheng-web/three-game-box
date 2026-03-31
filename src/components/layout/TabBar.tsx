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
            className="fixed bottom-0 left-0 right-0 z-50 bg-white"
            style={{
                borderTop: '4px solid #e9d4ff',
                boxShadow: '0px -4px 20px rgba(0, 0, 0, 0.08)',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
        >
            <div className="flex items-center h-[60px] px-3">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.path || pathname.startsWith(tab.path + '/');

                    return (
                        <button
                            key={tab.key}
                            onClick={() => handleTabClick(tab)}
                            className="flex-1 h-full flex flex-col items-center justify-center transition-all duration-200"
                        >
                            {isActive ? (
                                <div
                                    className="flex flex-col items-center justify-center gap-[4px] w-full max-w-[180px] h-[52px] rounded-[14px]"
                                    style={{
                                        backgroundImage: 'linear-gradient(156.284deg, rgb(173, 70, 255) 0%, rgb(246, 51, 154) 100%)',
                                        boxShadow: '0px 10px 20px -5px rgba(173, 70, 255, 0.3)',
                                    }}
                                >
                                    <div className="relative w-[24px] h-[24px]">
                                        {tab.activeIcon ? (
                                            <Image
                                                src={tab.activeIcon}
                                                alt={tab.label}
                                                width={24}
                                                height={24}
                                                className="object-contain"
                                            />
                                        ) : (
                                            <span className="text-white text-lg">
                                                {tab.key === 'home' ? '🏠' : '👤'}
                                            </span>
                                        )}
                                    </div>
                                    <span className="font-bold text-[12px] text-white leading-[16px] tracking-[-0.15px]">
                                        {tab.label}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-1 w-full h-full">
                                    <div className="relative w-[24px] h-[24px]">
                                        {tab.icon ? (
                                            <Image
                                                src={tab.icon}
                                                alt={tab.label}
                                                width={24}
                                                height={24}
                                                className="object-contain"
                                            />
                                        ) : (
                                            <span className="text-[#99a1af] text-lg">
                                                {tab.key === 'home' ? '🏠' : '👤'}
                                            </span>
                                        )}
                                    </div>
                                    <span className="font-bold text-[12px] text-[#99a1af] leading-[16px] tracking-[-0.15px]">
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
