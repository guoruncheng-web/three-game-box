/**
 * 游戏分类标签组件
 * 基于 Figma 设计实现
 */

'use client';

import { useState } from 'react';

export interface Category {
    id: string;
    name: string;
    icon: string;
}

interface CategoryTabsProps {
    categories: Category[];
    activeCategory: string;
    onCategoryChange: (categoryId: string) => void;
}

export function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
    return (
        <div className="w-full">
            {/* 标题 */}
            <div className="flex items-center gap-2 mb-2">
                <h2 className="text-[16px] font-black text-[#1e2939] leading-6">
                    游戏分类
                </h2>
                <span className="text-[16px]">⚡</span>
            </div>

            {/* 分类标签 - 横向滚动 */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
                {categories.map((category) => {
                    const isActive = category.id === activeCategory;
                    return (
                        <button
                            key={category.id}
                            onClick={() => onCategoryChange(category.id)}
                            className={`
                                flex items-center gap-1.5 px-3.5 py-2 rounded-xl shrink-0
                                transition-all duration-200 active:scale-95
                                ${isActive
                                    ? 'text-white shadow-lg'
                                    : 'bg-white text-[#4a5565] shadow-sm'
                                }
                            `}
                            style={isActive ? {
                                backgroundImage: 'linear-gradient(to right, #ad46ff, #f6339a)',
                            } : undefined}
                        >
                            <span className="text-[15px]">{category.icon}</span>
                            <span className="text-[13px] font-bold whitespace-nowrap">
                                {category.name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// 默认分类数据
export const defaultCategories: Category[] = [
    { id: 'all', name: '全部', icon: '🎮' },
    { id: 'puzzle', name: '休闲益智', icon: '🧩' },
    { id: 'action', name: '动作跑酷', icon: '⚡' },
    { id: 'classic', name: '经典怀旧', icon: '👾' },
];
