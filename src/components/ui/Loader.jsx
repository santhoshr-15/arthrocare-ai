import React from 'react';

const Loader = ({ label = 'Loading…' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-teal-600" />
      <p className="mt-3 text-sm text-slate-500">{label}</p>
    </div>
  );
};

export default Loader;