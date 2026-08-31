'use client';

import React from 'react';

interface CloudDoLogoProps {
  className?: string;
  size?: 'inline' | 'sm' | 'md' | 'lg';
  showLink?: boolean;
  withText?: boolean;
}

export const CloudDoLogo: React.FC<CloudDoLogoProps> = ({
  className = '',
  size = 'inline',
  showLink = true,
  withText = false,
}) => {
  const sizeClasses = {
    inline: 'h-5 w-auto object-contain',
    sm: 'h-6 w-auto object-contain',
    md: 'h-8 w-auto object-contain',
    lg: 'h-11 w-auto object-contain',
  }[size];

  const logoImg = (
    <img
      src="/Cloud.do.png"
      alt="Cloud.DO Technologies Logo"
      className={`${sizeClasses} inline-block align-middle transition-transform hover:scale-105`}
    />
  );

  const content = withText ? (
    <div className={`inline-flex items-center gap-1.5 font-sans ${className}`}>
      <span className="text-xs text-slate-500 font-medium">Made by</span>
      <span className="text-xs font-bold text-slate-800 tracking-tight">Cloud.DO Technologies</span>
      {logoImg}
    </div>
  ) : (
    <div className={`inline-flex items-center ${className}`}>
      {logoImg}
    </div>
  );

  if (showLink) {
    return (
      <a
        href="https://cloud-do-cbe.web.app/"
        target="_blank"
        rel="noopener noreferrer"
        title="Cloud.DO Technologies — Turning Ideas Into Visual Experiences"
        className="inline-flex items-center group"
      >
        {content}
      </a>
    );
  }

  return content;
};
