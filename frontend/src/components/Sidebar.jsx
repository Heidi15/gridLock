import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_ADMIN = [
  { to: '/dashboard', label: 'Tableau de bord', icon: '📊' },
  { to: '/events', label: 'Événements', icon: '📅' },
  { to: '/students', label: 'Étudiants', icon: '🎓' },
];

const NAV_STUDENT = [
  { to: '/dashboard', label: 'Tableau de bord', icon: '📊' },
  { to: '/events', label: 'Événements', icon: '📅' },
  { to: '/my-participations', label: 'Mes participations', icon: '📋' },
];

const Sidebar = () => {
  const { user, logout, isAdmin, isDirector } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = (isAdmin || isDirector) ? NAV_ADMIN : NAV_STUDENT;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <span className="font-display text-xl font-bold text-white tracking-wide">
          Grid<span className="text-accent">Lock</span>
        </span>
        <p className="text-xs text-slate-400 mt-0.5">Suivi participations</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <span>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Compte utilisateur */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="text-xs text-slate-400 mb-1 truncate">{user?.email}</div>
        <div className="text-xs text-accent font-medium uppercase mb-3">
          {user?.role}
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-slate-400 hover:text-white transition-colors"
        >
          → Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen bg-navy fixed left-0 top-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(true)}
          className="bg-navy text-white p-2 rounded-lg"
          aria-label="Ouvrir le menu"
        >
          ☰
        </button>
      </div>

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-navy/70"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="w-60 h-full bg-navy"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
