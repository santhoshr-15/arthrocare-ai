import React from 'react';

const PageHeader = ({ eyebrow, title, description, actions }) => {
  return (
    <header className="mb-8">
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-600">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-3 mt-4 sm:mt-0">{actions}</div>}
      </div>
    </header>
  );
};

export default PageHeader;