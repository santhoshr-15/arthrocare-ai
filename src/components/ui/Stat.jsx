import React from 'react';

const Stat = ({ label, value, sub, valueClass = 'text-slate-900', subClass = 'text-slate-500', icon: Icon }) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
        {Icon && <Icon className="h-5 w-5 shrink-0 text-slate-400" />}
      </div>
      <p className={`mt-2 text-3xl font-bold tracking-tight ${valueClass}`}>{value}</p>
      {sub && <p className={`mt-1 text-sm font-medium ${subClass}`}>{sub}</p>}
    </div>
  );
};

export default Stat;