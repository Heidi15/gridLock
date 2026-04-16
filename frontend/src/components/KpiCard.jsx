import React from 'react';

const KpiCard = ({ label, value, icon, color = 'text-accent' }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-2xl">{icon}</span>
      <span className={`font-display text-3xl font-bold ${color}`}>{value ?? '—'}</span>
    </div>
    <p className="text-sm text-slate-500 font-medium">{label}</p>
  </div>
);

export default KpiCard;
