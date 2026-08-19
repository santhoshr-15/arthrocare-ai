import React from 'react';

const iconToneClasses = {
  slate: 'bg-slate-50 text-slate-500',
  primary: 'bg-primary-50 text-primary-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600'
};

const Stat = ({
  label,
  value,
  sub,
  valueClass = 'text-slate-900',
  subClass = 'text-slate-500',
  icon: Icon,
  iconTone = 'primary'
}) => {
  return (
    <div className="panel flex flex-col justify-between p-5 transition-all duration-300 hover:shadow-md hover:shadow-slate-900/5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
        {Icon && (
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconToneClasses[iconTone] || iconToneClasses.slate}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className={`text-[28px] font-bold leading-none tracking-tight tabular-nums ${valueClass}`}>{value}</p>
        {sub && <p className={`mt-1.5 text-[13px] font-medium ${subClass}`}>{sub}</p>}
      </div>
    </div>
  );
};

export default Stat;
