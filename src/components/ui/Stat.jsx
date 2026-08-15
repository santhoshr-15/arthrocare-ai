import React from 'react';

const Stat = ({ label, value, sub, valueClass = 'text-slate-900', subClass = 'text-slate-500', icon: Icon }) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        {Icon && <Icon className="h-4 w-4 shrink-0 text-slate-400" />}
      </div>
      <p className={`mt-1.5 text-2xl font-bold tracking-tight ${valueClass}`}>{value}</p>
      {sub && <p className={`mt-1 text-xs font-medium ${subClass}`}>{sub}</p>}
    </div>
  );
};

export default Stat;