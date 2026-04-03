/**
 * 单张扑克展示：牌背资源或点数花色文字
 */

import Image from 'next/image';

import { zjhAssets } from '@/lib/zhajinhua/assets';
import type { Card } from '@/types/zjh';

const SUIT_CHAR: Record<Card['suit'], string> = {
  spade: '♠',
  heart: '♥',
  club: '♣',
  diamond: '♦',
};

function isRedSuit(suit: Card['suit']) {
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
  return (
    <div
      className={`relative rounded-lg shadow-md bg-white flex flex-col items-center justify-center shrink-0 w-[52px] h-[72px] sm:w-[58px] sm:h-[80px] border border-white/40 ${className}`}
    >
      <span
        className={`text-[15px] font-black leading-none ${red ? 'text-red-600' : 'text-zinc-900'}`}
      >
        {card.rank}
      </span>
      <span
        className={`text-[22px] leading-none mt-0.5 ${red ? 'text-red-600' : 'text-zinc-900'}`}
      >
        {SUIT_CHAR[card.suit]}
      </span>
    </div>
  );
}
