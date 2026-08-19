import React from 'react';

const EmptyState = ({ icon, title, description, action }) => {
  const Icon = icon;
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-14 text-center backdrop-blur-sm">
      {Icon && (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-500">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      {description && <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-slate-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;
