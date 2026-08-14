import React from 'react';

const Stat = ({ label, value, sub, valueClass = 'text-slate-900', subClass = 'text-slate-500' }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tracking-tight ${valueClass}`}>{value}</p>
      {sub && <p className={`mt-1 text-xs ${subClass}`}>{sub}</p>}
    </div>
  );
};

export default Stat;