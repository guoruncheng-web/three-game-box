/**
 * 热门游戏横幅组件
 * 基于 Figma 设计实现
 */

'use client';

import Image from 'next/image';

interface HotGameBannerProps {
    title: string;
    subtitle: string;
    playerCount: string;
    onPlay: () => void;
    /** 可选：底部铺一张封面图（如水果消消乐），其上叠渐变保证文字可读 */
    coverImageSrc?: string;
}

export function HotGameBanner({
    title,
    subtitle,
    playerCount,
    onPlay,
    coverImageSrc,
}: HotGameBannerProps) {
    return (
        <div
            className="relative w-full h-[208px] rounded-3xl overflow-hidden"
            style={{
                boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
                backgroundImage: coverImageSrc
                    ? undefined
                    : 'linear-gradient(to right, #ad46ff, #ff6900)',
            }}
        >
            {coverImageSrc ? (
                <>
                    <img
                        src={coverImageSrc}
                        alt=""
                        className="absolute inset-0 z-0 h-full w-full object-cover"
                        aria-hidden
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'linear-gradient(105deg, rgba(124, 58, 237, 0.88) 0%, rgba(234, 88, 12, 0.75) 55%, rgba(249, 115, 22, 0.55) 100%)',
                        }}
                    />
                </>
            ) : null}
            {/* 装饰圆形 */}
            <div
                className="absolute -top-16 right-[calc(100%-298px-128px)] w-32 h-32 rounded-full"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            />
            <div
                className="absolute -bottom-8 -left-12 w-24 h-24 rounded-full"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            />

            {/* 内容区域 */}
            <div className="absolute top-6 left-6 z-10 w-[314px] h-[160px]">
                {/* 标签 */}
                <div className="flex items-center gap-2 mb-2">
                    <Image
                        src="/images/home/icon-fire.svg"
                        alt="fire"
                        width={24}
                        height={24}
                    />
                    <span className="text-[18px] font-black text-white leading-7">
                        {subtitle}
                    </span>
                </div>

                {/* 游戏标题 */}
                <h3 className="text-[24px] font-black text-white leading-8 mb-2">
                    {title}
                </h3>

                {/* 玩家数量 */}
                <p className="text-[14px] font-normal text-white/90 leading-5 mb-6">
                    {playerCount}
                </p>

                {/* 开始按钮 */}
                <button
                    onClick={onPlay}
                    className="bg-white rounded-[14px] px-6 h-12 shadow-lg
                        text-[16px] font-black text-[#9810fa]
                        hover:scale-105 active:scale-95 transition-transform"
                >
                    立即开始 →
                </button>
            </div>
        </div>
    );
}
