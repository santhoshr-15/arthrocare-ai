import React from 'react';

const EmptyState = ({ icon, title, description, action }) => {
  const Icon = icon;
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      {Icon && (
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {description && <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;