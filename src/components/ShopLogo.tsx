'use client';

import React from 'react';

interface ShopLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'badge' | 'horizontal';
  className?: string;
  showSubtitle?: boolean;
}

export const ShopLogo: React.FC<ShopLogoProps> = ({
  size = 'md',
  variant = 'badge',
  className = '',
  showSubtitle = true,
}) => {
  const sizeConfig = {
    xs: { dim: 'w-7 h-7 text-[7px]', radius: 'rounded-xs' },
    sm: { dim: 'w-8 h-8 text-[8px]', radius: 'rounded-xs' },
    md: { dim: 'w-10 h-10 text-[10px]', radius: 'rounded-sm' },
    lg: { dim: 'w-14 h-14 text-[13px]', radius: 'rounded-md' },
    xl: { dim: 'w-20 h-20 text-[18px]', radius: 'rounded-lg' },
  }[size];

  const badgeElement = (
    <div
      className={`relative overflow-hidden flex flex-col shrink-0 shadow-xs border border-slate-900/10 font-bold select-none ${sizeConfig.dim} ${sizeConfig.radius} ${className}`}
      title="Kathir Xerox & E-Sevai Maiyam (கதிர் ஜெராக்ஸ் & இ-சேவை மையம்)"
    >
      {/* Top Black Section: Kathir Xerox */}
      <div className="bg-black text-white flex-1 flex flex-col items-center justify-center px-0.5 leading-none">
        <span className="font-serif tracking-tight font-black scale-y-105">கதிர்</span>
        <span className="text-[0.42em] font-sans tracking-tight text-slate-200 mt-0.2">ஜெராக்ஸ்</span>
      </div>

      {/* Bottom Cyan Section: e-Sevai Maiyam */}
      <div className="bg-[#46D8E7] text-black flex-1 flex flex-col items-center justify-center px-0.5 leading-none">
        <span className="text-[0.52em] font-sans font-extrabold tracking-tight">e - சேவை</span>
        <span className="text-[0.45em] font-mono tracking-widest font-black mt-0.2">MAIYAM</span>
      </div>
    </div>
  );

  if (variant === 'badge') {
    return badgeElement;
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {badgeElement}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-tight">
          <span className="font-serif font-bold text-slate-900 tracking-tight text-base sm:text-lg">
            Kathir Xerox
          </span>
          <span className="hidden xs:inline-block bg-sky-50 text-[#008ba3] text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-xs border border-sky-200">
            E-SEVAI
          </span>
        </div>
        {showSubtitle && (
          <p className="text-[10px] text-slate-500 font-sans leading-tight mt-0.5">
            கதிர் ஜெராக்ஸ் & இ-சேவை மையம் • Merchant Daybook
          </p>
        )}
      </div>
    </div>
  );
};
