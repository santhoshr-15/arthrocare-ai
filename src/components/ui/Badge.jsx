import React from 'react';

const toneClasses = {
  slate: 'bg-slate-100 text-slate-700',
  primary: 'bg-primary-50 text-primary-800',
  blue: 'bg-primary-50 text-primary-800',
  teal: 'bg-primary-50 text-primary-800',
  emerald: 'bg-emerald-50 text-emerald-800',
  amber: 'bg-amber-50 text-amber-800',
  orange: 'bg-orange-50 text-orange-800',
  rose: 'bg-rose-50 text-rose-800'
};

const dotClasses = {
  slate: 'bg-slate-500',
  primary: 'bg-primary-700',
  blue: 'bg-primary-700',
  teal: 'bg-primary-700',
  emerald: 'bg-emerald-600',
  amber: 'bg-amber-600',
  orange: 'bg-orange-600',
  rose: 'bg-rose-600'
};

const Badge = ({ tone = 'slate', showDot = false, children, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${toneClasses[tone] || toneClasses.slate} ${className}`}
    >
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${dotClasses[tone] || dotClasses.slate}`} aria-hidden="true" />}
      {children}
    </span>
  );
};

export default Badge;