import api from './api.js';

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

export default { login, logout, getStoredUser, getToken };
