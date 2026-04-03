/**
 * 使用 manifest 中按钮 PNG 作为可点击区域（保证最小触控尺寸）
 */

'use client';

import Image from 'next/image';

export interface ZjhImageButtonProps {
  src: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function ZjhImageButton({
  src,
  label,
  onClick,
  disabled,
  loading,
  className = '',
}: ZjhImageButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={label}
      className={`relative w-full min-h-[56px] rounded-xl overflow-hidden touch-manipulation
        transition-all duration-150 ease-out
        active:scale-[0.94] hover:brightness-110
        disabled:opacity-45 disabled:active:scale-100 disabled:hover:brightness-100
        ${className}`}
    >
      <Image src={src} alt="" fill className="object-contain pointer-events-none" sizes="120px" unoptimized />
      {loading ? (
        <span
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-[1px]"
          aria-hidden
        >
          <span className="inline-block h-7 w-7 rounded-full border-2 border-white/85 border-t-transparent animate-spin" />
        </span>
      ) : null}
      <span className="sr-only">{label}</span>
    </button>
  );
}
