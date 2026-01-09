/**
 * 游戏卡片组件
 * 基于 Figma 设计实现
 */

'use client';

import Image from 'next/image';

// 游戏卡片背景渐变色配置
const gradientColors: Record<string, string> = {
    pink: 'linear-gradient(135deg, rgb(251, 100, 182) 0%, rgb(255, 99, 126) 100%)',
    blue: 'linear-gradient(135deg, rgb(81, 162, 255) 0%, rgb(0, 211, 242) 100%)',
    purple: 'linear-gradient(135deg, rgb(194, 122, 255) 0%, rgb(124, 134, 255) 100%)',
    green: 'linear-gradient(135deg, rgb(5, 223, 114) 0%, rgb(0, 212, 146) 100%)',
    orange: 'linear-gradient(135deg, rgb(255, 137, 4) 0%, rgb(255, 185, 0) 100%)',
    red: 'linear-gradient(135deg, rgb(255, 100, 103) 0%, rgb(251, 100, 182) 100%)',
    cyan: 'linear-gradient(135deg, rgb(0, 213, 190) 0%, rgb(0, 211, 242) 100%)',
    violet: 'linear-gradient(135deg, rgb(166, 132, 255) 0%, rgb(194, 122, 255) 100%)',
};

export interface GameCardData {
    id: string;
    name: string;
    category: string;
    icon: string;
    rating: number;
    playCount: string;
    isHot?: boolean;
    isNew?: boolean;
    gradientColor: keyof typeof gradientColors;
}

interface GameCardProps {
    game: GameCardData;
    onClick: (gameId: string) => void;
}

export function GameCard({ game, onClick }: GameCardProps) {
    return (
        <button
            onClick={() => onClick(game.id)}
            className="bg-white rounded-3xl overflow-hidden shadow-lg
                hover:scale-[1.02] active:scale-[0.98] transition-transform
                text-left relative"
        >
            {/* HOT/NEW 标签 */}
            {(game.isHot || game.isNew) && (
                <div
                    className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 rounded-full shadow-lg"
                    style={{
                        backgroundImage: game.isHot
                            ? 'linear-gradient(to right, #fb2c36, #ff6900)'
                            : 'linear-gradient(to right, #00c950, #00bc7d)',
                    }}
                >
                    <Image
                        src={game.isHot ? '/images/home/icon-flame.svg' : '/images/home/icon-sparkles.svg'}
                        alt={game.isHot ? 'hot' : 'new'}
                        width={12}
                        height={12}
                    />
                    <span className="text-[12px] font-black text-white">
                        {game.isHot ? 'HOT' : 'NEW'}
                    </span>
                </div>
            )}

            {/* 图标区域 */}
            <div className="p-4 pb-0">
                <div
                    className="w-full aspect-square rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ backgroundImage: gradientColors[game.gradientColor] }}
                >
                    <span className="text-[60px]">{game.icon}</span>
                </div>
            </div>

            {/* 信息区域 */}
            <div className="p-4 pt-3">
                {/* 游戏名称 */}
                <h3 className="text-[16px] font-black text-[#1e2939] leading-6 mb-1">
                    {game.name}
                </h3>

                {/* 分类 */}
                <p className="text-[12px] font-medium text-[#6a7282] leading-4 mb-2">
                    {game.category}
                </p>

                {/* 评分和玩家数 */}
                <div className="flex items-center justify-between">
                    {/* 评分 */}
                    <div className="flex items-center gap-1">
                        <Image
                            src="/images/home/icon-star.svg"
                            alt="star"
                            width={12}
                            height={12}
                        />
                        <span className="text-[12px] font-bold text-[#364153]">
                            {game.rating}
                        </span>
                    </div>

                    {/* 玩家数 */}
                    <div className="flex items-center gap-1">
                        <Image
                            src="/images/home/icon-users.svg"
                            alt="users"
                            width={12}
                            height={12}
                        />
                        <span className="text-[12px] font-medium text-[#6a7282]">
                            {game.playCount}
                        </span>
                    </div>
                </div>
            </div>
        </button>
    );
}
