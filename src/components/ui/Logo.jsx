import React from 'react';
import { HeartPulse } from 'lucide-react';

const Logo = ({ subtitle, dark = false, size = 'md' }) => {
  const markSize = size === 'lg' ? 'h-10 w-10' : 'h-9 w-9';
  const iconSize = size === 'lg' ? 'h-5 w-5' : 'h-5 w-5';
  const titleSize = size === 'lg' ? 'text-lg' : 'text-[15px]';

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`${markSize} flex shrink-0 items-center justify-center rounded-md ${
          dark ? 'bg-primary-600 text-white' : 'bg-primary-700 text-white'
        } shadow-sm`}
      >
        <HeartPulse className={`${iconSize} stroke-[2]`} aria-hidden="true" />
      </div>
      <div className="leading-tight">
        <p className={`${titleSize} font-bold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
          ArthroCare
          <span className={`ml-1 font-semibold ${dark ? 'text-primary-300' : 'text-primary-700'}`}>AI</span>
        </p>
        {subtitle && (
          <p className={`text-[10px] font-medium uppercase tracking-[0.14em] ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default Logo;