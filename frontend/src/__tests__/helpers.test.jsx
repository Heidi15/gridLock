import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { formatDate, statutColor, statutLabel, typeColor, getErrorMessage } from '../utils/helpers.js';
import { StatutBadge, TypeBadge, AmbassadeurBadge } from '../components/Badge.jsx';

// ─── helpers.js ────────────────────────────────────────────────────────────
describe('formatDate', () => {
  test('formate une date ISO en français', () => {
    const result = formatDate('2025-10-14');
    expect(result).toMatch(/14/);
    expect(result).toMatch(/octobre|2025/i);
  });

  test('retourne — pour une valeur nulle', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
  });
});

describe('statutColor', () => {
  test('retourne une classe pour confirme', () => {
    expect(statutColor('confirme')).toContain('gold');
  });
  test('retourne une classe pour present', () => {
    expect(statutColor('present')).toContain('success');
  });
  test('retourne une classe pour absent', () => {
    expect(statutColor('absent')).toContain('slate');
  });
  test('retourne un fallback pour un statut inconnu', () => {
    expect(statutColor('unknown')).toContain('slate');
  });
});

describe('statutLabel', () => {
  test('retourne Confirmé pour confirme', () => {
    expect(statutLabel('confirme')).toBe('Confirmé');
  });
  test('retourne Présent pour present', () => {
    expect(statutLabel('present')).toBe('Présent');
  });
  test('retourne Absent pour absent', () => {
    expect(statutLabel('absent')).toBe('Absent');
  });
});

describe('typeColor', () => {
  test('retourne une classe pour chaque type', () => {
    expect(typeColor('JPO')).toContain('accent');
    expect(typeColor('Salon')).toContain('gold');
    expect(typeColor('Forum')).toContain('success');
    expect(typeColor('Evenement')).toContain('purple');
  });
});

describe('getErrorMessage', () => {
  test('extrait le message depuis une réponse Axios', () => {
    const err = { response: { data: { error: 'Déjà inscrit' } } };
    expect(getErrorMessage(err)).toBe('Déjà inscrit');
  });

  test('retourne le message natif si pas de response', () => {
    const err = { message: 'Network Error' };
    expect(getErrorMessage(err)).toBe('Network Error');
  });

  test('retourne un fallback si err est vide', () => {
    expect(getErrorMessage({})).toBe('Une erreur est survenue.');
  });
});

// ─── Badge.jsx ──────────────────────────────────────────────────────────────
describe('StatutBadge', () => {
  test('affiche le label Confirmé', () => {
    render(<StatutBadge statut="confirme" />);
    expect(screen.getByText('Confirmé')).toBeInTheDocument();
  });

  test('affiche le label Présent', () => {
    render(<StatutBadge statut="present" />);
    expect(screen.getByText('Présent')).toBeInTheDocument();
  });

  test('affiche le label Absent', () => {
    render(<StatutBadge statut="absent" />);
    expect(screen.getByText('Absent')).toBeInTheDocument();
  });
});

describe('TypeBadge', () => {
  test('affiche JPO', () => {
    render(<TypeBadge type="JPO" />);
    expect(screen.getByText('JPO')).toBeInTheDocument();
  });

  test('affiche Salon', () => {
    render(<TypeBadge type="Salon" />);
    expect(screen.getByText('Salon')).toBeInTheDocument();
  });
});

describe('AmbassadeurBadge', () => {
  test('affiche le badge ambassadeur', () => {
    render(<AmbassadeurBadge />);
    expect(screen.getByText(/ambassadeur/i)).toBeInTheDocument();
  });
});
