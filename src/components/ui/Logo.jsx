import React from 'react';
import { Activity } from 'lucide-react';

const Logo = ({ subtitle, dark = false }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white">
        <Activity className="h-5 w-5 stroke-[2.5]" />
      </div>
      <div className="leading-none">
        <p className={`text-base font-bold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
          ArthroCare <span className={dark ? 'text-blue-400 font-medium' : 'text-blue-700 font-semibold'}>AI</span>
        </p>
        {subtitle && (
          <p className={`mt-0.5 text-xs font-medium uppercase tracking-widest ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default Logo;