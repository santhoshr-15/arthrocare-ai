import React from 'react';

const tones = {
  slate: { bg: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-500' },
  blue: { bg: 'bg-blue-50 text-blue-800 border-blue-200', dot: 'bg-blue-600' },
  teal: { bg: 'bg-teal-50 text-teal-800 border-teal-200', dot: 'bg-teal-600' },
  emerald: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-600' },
  amber: { bg: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-600' },
  orange: { bg: 'bg-orange-50 text-orange-800 border-orange-200', dot: 'bg-orange-600' },
  rose: { bg: 'bg-rose-50 text-rose-800 border-rose-200', dot: 'bg-rose-600' }
};

const Badge = ({ tone = 'slate', showDot = false, children, className = '' }) => {
  const t = tones[tone] || tones.slate;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-semibold ${t.bg} ${className}`}>
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />}
      {children}
    </span>
  );
};

export default Badge;