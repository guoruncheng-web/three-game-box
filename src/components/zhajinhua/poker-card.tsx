/**
 * 单张扑克展示：牌背资源或点数花色文字
 */

import Image from 'next/image';

import { zjhAssets } from '@/lib/zhajinhua/assets';
import type { Card } from '@/types/zjh';

export const SUIT_CHAR: Record<Card['suit'], string> = {
  spade: '♠',
  heart: '♥',
  club: '♣',
  diamond: '♦',
};

export function isRedSuit(suit: Card['suit']) {
  return suit === 'heart' || suit === 'diamond';
}

export interface PokerCardProps {
  faceDown?: boolean;
  card?: Card;
  className?: string;
}

export function PokerCard({ faceDown, card, className = '' }: PokerCardProps) {
  if (faceDown || !card) {
    return (
      <div
        className={`relative rounded-lg overflow-hidden shadow-md bg-[#1e1035] shrink-0 w-[52px] h-[72px] sm:w-[58px] sm:h-[80px] ${className}`}
      >
        <Image
          src={zjhAssets.cardBack}
          alt="牌背"
          fill
          className="object-cover"
          sizes="60px"
          unoptimized
        />
      </div>
    );
  }

  const red = isRedSuit(card.suit);
  const colorClass = red ? 'text-red-600' : 'text-zinc-900';
  const suitChar = SUIT_CHAR[card.suit];

  return (
    <div
      className={`relative rounded-lg shadow-md shrink-0 w-[52px] h-[72px] sm:w-[58px] sm:h-[80px] border border-zinc-200 overflow-hidden ${className}`}
      style={{
        backgroundColor: '#fff',
        backgroundImage:
          'repeating-linear-gradient(0deg, transparent, transparent 9px, rgba(0,0,0,0.03) 9px, rgba(0,0,0,0.03) 10px), repeating-linear-gradient(90deg, transparent, transparent 9px, rgba(0,0,0,0.03) 9px, rgba(0,0,0,0.03) 10px)',
      }}
    >
      {/* 左上角：点数 + 花色，竖排 */}
      <div className={`absolute top-1 left-1.5 flex flex-col items-center leading-none ${colorClass}`}>
        <span className="text-[11px] font-black leading-none">{card.rank}</span>
        <span className="text-[10px] leading-none">{suitChar}</span>
      </div>

      {/* 中央大号花色 */}
      <div className={`absolute inset-0 flex items-center justify-center ${colorClass}`}>
        <span className="text-[24px] leading-none">{suitChar}</span>
      </div>

      {/* 右下角：旋转 180° 的点数 + 花色 */}
      <div className={`absolute bottom-1 right-1.5 flex flex-col items-center leading-none rotate-180 ${colorClass}`}>
        <span className="text-[11px] font-black leading-none">{card.rank}</span>
        <span className="text-[10px] leading-none">{suitChar}</span>
      </div>
    </div>
  );
}
