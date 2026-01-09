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
            <div className="flex items-center gap-2 mb-3">
                <h2 className="text-[18px] font-black text-[#1e2939] leading-7">
                    游戏分类
                </h2>
                <span className="text-[18px]">⚡</span>
            </div>

            {/* 分类标签 */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((category) => {
                    const isActive = category.id === activeCategory;
                    return (
                        <button
                            key={category.id}
                            onClick={() => onCategoryChange(category.id)}
                            className={`
                                flex items-center gap-2 px-5 py-3 rounded-2xl shrink-0
                                transition-all duration-200
                                ${isActive
                                    ? 'text-white shadow-lg'
                                    : 'bg-white text-[#4a5565] shadow-md'
                                }
                            `}
                            style={isActive ? {
                                backgroundImage: 'linear-gradient(to right, #ad46ff, #f6339a)',
                            } : undefined}
                        >
                            <span className="text-[18px]">{category.icon}</span>
                            <span className="text-[14px] font-bold whitespace-nowrap">
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
