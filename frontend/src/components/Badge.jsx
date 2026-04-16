import React from 'react';
import { statutColor, statutLabel, typeColor } from '../utils/helpers.js';

export const StatutBadge = ({ statut }) => (
  <span className={`badge ${statutColor(statut)}`}>
    {statutLabel(statut)}
  </span>
);

export const TypeBadge = ({ type }) => (
  <span className={`badge ${typeColor(type)}`}>
    {type}
  </span>
);

export const AmbassadeurBadge = () => (
  <span className="badge bg-gold/20 text-yellow-800">⭐ Ambassadeur</span>
);
