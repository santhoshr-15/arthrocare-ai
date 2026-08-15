import React from 'react';
import { Activity } from 'lucide-react';

const Logo = ({ subtitle, dark = false }) => {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-teal-800 text-white shadow-2xs">
        <Activity className="h-4 w-4 stroke-[2.2]" />
      </div>
      <div className="leading-none">
        <p className={`text-[15px] font-bold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
          ArthroCare <span className={dark ? 'text-teal-400 font-medium' : 'text-teal-700 font-semibold'}>AI</span>
        </p>
        {subtitle && (
          <p className={`mt-0.5 text-[10px] font-medium uppercase tracking-wider ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default Logo;