import api from './api.js';

const register = async (nom, prenom, email, password, formation) => {
  const { data } = await api.post('/auth/register', { nom, prenom, email, password, formation });
  localStorage.setItem('gridlock_token', data.token);
  localStorage.setItem('gridlock_user', JSON.stringify(data.user));
  return data;
};

const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem('gridlock_token', data.token);
  localStorage.setItem('gridlock_user', JSON.stringify(data.user));
  return data;
};

const logout = async () => {
  try {
    await api.post('/auth/logout');
  } finally {
    localStorage.removeItem('gridlock_token');
    localStorage.removeItem('gridlock_user');
  }
};

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('gridlock_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getToken = () => localStorage.getItem('gridlock_token');

export default { register, login, logout, getStoredUser, getToken };