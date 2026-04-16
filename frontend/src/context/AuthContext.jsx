import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getStoredUser());
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Écoute les événements d'expiration JWT émis par l'intercepteur Axios
  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      navigate('/login?reason=expired');
    };
    const handleForbidden = () => {
      navigate('/403');
    };

    window.addEventListener('auth:expired', handleExpired);
    window.addEventListener('auth:forbidden', handleForbidden);
    return () => {
      window.removeEventListener('auth:expired', handleExpired);
      window.removeEventListener('auth:forbidden', handleForbidden);
    };
  }, [navigate]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (nom, prenom, email, password, formation) => {
    setLoading(true);
    try {
      const data = await authService.register(nom, prenom, email, password, formation);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const isAdmin = user?.role === 'admin';
  const isDirector = user?.role === 'director';
  const isStudent = user?.role === 'student';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isDirector, isStudent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
};