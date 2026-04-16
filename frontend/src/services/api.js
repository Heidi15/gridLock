import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ─── Intercepteur de requête : injecte le JWT ──────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gridlock_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Intercepteur de réponse : gestion centralisée des erreurs ────────────
// La logique de redirect différée évite les boucles de login :
// on dispatch un événement custom plutôt que d'appeler navigate() directement
// (navigate() n'est pas accessible hors composant React).
// NOTE : Les erreurs 403 ne déclenchent PAS de redirect global — chaque page
// gère elle-même les cas d'accès refusé pour éviter les redirections intempestives.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem('gridlock_token');
      localStorage.removeItem('gridlock_user');
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }

    return Promise.reject(error);
  }
);

export default api;
