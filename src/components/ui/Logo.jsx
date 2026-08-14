import React from 'react';
import { Activity } from 'lucide-react';

const Logo = ({ subtitle, dark = false }) => {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-white">
        <Activity className="h-4 w-4" />
      </div>
      <div className="leading-tight">
        <p className={`text-[15px] font-semibold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
          ArthroCare <span className={dark ? 'text-teal-400' : 'text-teal-700'}>AI</span>
        </p>
        {subtitle && (
          <p className={`text-[10px] uppercase tracking-widest ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default Logo;