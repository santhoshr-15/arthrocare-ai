import React from 'react';

const tones = {
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  teal: 'bg-teal-50 text-teal-800 border-teal-200',
  emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  orange: 'bg-orange-50 text-orange-800 border-orange-200',
  rose: 'bg-rose-50 text-rose-800 border-rose-200'
};

const Badge = ({ tone = 'slate', children, className = '' }) => {
  const cls = tones[tone] || tones.slate;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium ${cls} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;