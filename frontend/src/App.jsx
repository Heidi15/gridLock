import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import EventsPage from './pages/EventsPage.jsx';
import EventDetailPage from './pages/EventDetailPage.jsx';
import StudentsPage from './pages/StudentsPage.jsx';
import StudentDetailPage from './pages/StudentDetailPage.jsx';
import MyParticipationsPage from './pages/MyParticipationsPage.jsx';
import Page403 from './pages/Page403.jsx';
import Page404 from './pages/Page404.jsx';
import Layout from './components/Layout.jsx';

const PrivateRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/403" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/403" element={<Page403 />} />
    <Route path="*" element={<Page404 />} />

    <Route
      path="/"
      element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }
    >
      <Route index element={<Navigate to="/dashboard" replace />} />

      {/* Dashboard accessible à tous les rôles */}
      <Route path="dashboard" element={<DashboardPage />} />

      {/* Événements : lecture pour tous, écriture admin seulement (géré dans les composants) */}
      <Route path="events" element={<EventsPage />} />
      <Route path="events/:id" element={<EventDetailPage />} />

      {/* Étudiants : admin et director uniquement */}
      <Route
        path="students"
        element={
          <PrivateRoute roles={['admin', 'director']}>
            <StudentsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="students/:id"
        element={
          <PrivateRoute roles={['admin', 'director']}>
            <StudentDetailPage />
          </PrivateRoute>
        }
      />

      {/* Vue personnelle étudiant */}
      <Route
        path="my-participations"
        element={
          <PrivateRoute roles={['student']}>
            <MyParticipationsPage />
          </PrivateRoute>
        }
      />
    </Route>
  </Routes>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}