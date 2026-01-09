/**
 * 搜索框组件
 * 基于 Figma 设计实现
 */

'use client';

import Image from 'next/image';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = '搜索你喜欢的游戏... 🔍' }: SearchBarProps) {
    return (
        <div className="relative w-full h-[60px]">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-full bg-white border-2 border-[#e9d4ff] rounded-2xl
                    pl-12 pr-4 py-4
                    text-[16px] font-medium text-[#1e2939] placeholder:text-[#99a1af]
                    shadow-md focus:outline-none focus:border-[#ad46ff] focus:ring-2 focus:ring-[#ad46ff]/20
                    transition-all"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Image
                    src="/images/home/icon-search.svg"
                    alt="search"
                    width={20}
                    height={20}
                />
            </div>
        </div>
    );
}
