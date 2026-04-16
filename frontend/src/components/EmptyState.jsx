import React from 'react';

const EmptyState = ({ icon = '📭', message, cta }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-5xl mb-4">{icon}</div>
    <p className="text-slate-500 text-sm max-w-xs">{message}</p>
    {cta && <div className="mt-5">{cta}</div>}
  </div>
);

export default EmptyState;
