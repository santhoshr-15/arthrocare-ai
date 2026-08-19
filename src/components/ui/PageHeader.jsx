import React from 'react';

const PageHeader = ({ eyebrow, title, description, actions }) => {
  return (
    <header className="mb-6">
      {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="page-title">{title}</h1>
          {description && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
};

export default PageHeader;