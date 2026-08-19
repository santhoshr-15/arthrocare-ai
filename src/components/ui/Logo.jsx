import React from 'react';
import { HeartPulse } from 'lucide-react';

const Logo = ({ subtitle, dark = false, size = 'md' }) => {
  const markSize = size === 'lg' ? 'h-11 w-11' : 'h-10 w-10';
  const iconSize = size === 'lg' ? 'h-5.5 w-5.5' : 'h-5 w-5';
  const titleSize = size === 'lg' ? 'text-lg' : 'text-[15px]';

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`${markSize} flex shrink-0 items-center justify-center rounded-xl ${
          dark
            ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-600/30'
            : 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-md shadow-primary-600/20'
        }`}
      >
        <HeartPulse className={`${iconSize} stroke-[2]`} aria-hidden="true" />
      </div>
      <div className="leading-tight">
        <p className={`${titleSize} font-bold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
          ArthroCare
          <span className={`ml-1 font-bold ${dark ? 'text-primary-300' : 'text-primary-600'}`}>AI</span>
        </p>
        {subtitle && (
          <p className={`text-[10px] font-medium uppercase tracking-[0.14em] ${dark ? 'text-slate-400' : 'text-slate-400'}`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default Logo;
