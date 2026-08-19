import React from 'react';

const Loader = ({ label = 'Loading…' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary-200 border-t-primary-600" />
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
};

export default Loader;
