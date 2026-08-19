import React from 'react';

const toneClasses = {
  slate: 'bg-slate-50 text-slate-600 ring-slate-200',
  primary: 'bg-primary-50 text-primary-700 ring-primary-200',
  blue: 'bg-primary-50 text-primary-700 ring-primary-200',
  teal: 'bg-primary-50 text-primary-700 ring-primary-200',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  orange: 'bg-orange-50 text-orange-700 ring-orange-200',
  rose: 'bg-rose-50 text-rose-700 ring-rose-200'
};

const dotClasses = {
  slate: 'bg-slate-400',
  primary: 'bg-primary-600',
  blue: 'bg-primary-600',
  teal: 'bg-primary-600',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  orange: 'bg-orange-500',
  rose: 'bg-rose-500'
};

const Badge = ({ tone = 'slate', showDot = false, children, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${toneClasses[tone] || toneClasses.slate} ${className}`}
    >
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${dotClasses[tone] || dotClasses.slate}`} aria-hidden="true" />}
      {children}
    </span>
  );
};

export default Badge;
