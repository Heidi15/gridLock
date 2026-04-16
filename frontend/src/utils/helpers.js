/**
 * Formate une date ISO en format lisible français.
 * @param {string|Date} date
 * @returns {string} Ex: "14 octobre 2025"
 */
export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Retourne les classes Tailwind pour un badge de statut de participation.
 * @param {'confirme'|'present'|'absent'} statut
 * @returns {string}
 */
export const statutColor = (statut) => {
  const map = {
    confirme: 'bg-gold/20 text-yellow-800',
    present: 'bg-success/20 text-green-800',
    absent: 'bg-slate-100 text-slate-600',
  };
  return map[statut] || 'bg-slate-100 text-slate-600';
};

/**
 * Retourne les classes Tailwind pour un badge de type d'événement.
 * @param {'JPO'|'Salon'|'Forum'|'Evenement'} type
 * @returns {string}
 */
export const typeColor = (type) => {
  const map = {
    JPO: 'bg-accent/15 text-accent',
    Salon: 'bg-gold/20 text-yellow-800',
    Forum: 'bg-success/20 text-green-800',
    Evenement: 'bg-purple-100 text-purple-800',
  };
  return map[type] || 'bg-slate-100 text-slate-600';
};

/**
 * Retourne le libellé affiché pour un statut de participation.
 * @param {string} statut
 * @returns {string}
 */
export const statutLabel = (statut) => {
  const map = { confirme: 'Confirmé', present: 'Présent', absent: 'Absent' };
  return map[statut] || statut;
};

/**
 * Extrait le message d'erreur depuis une réponse Axios.
 * @param {unknown} err
 * @returns {string}
 */
export const getErrorMessage = (err) => {
  return err?.response?.data?.error || err?.message || 'Une erreur est survenue.';
};
