import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Button from '../components/Button.jsx';
import { getErrorMessage } from '../utils/helpers.js';

const LoginPage = () => {
  const { login, user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Redirect si déjà connecté
  useEffect(() => {
    if (user) {
      navigate(user.role === 'student' ? '/my-participations' : '/dashboard');
    }
  }, [user, navigate]);

  // Affiche un message si la session a expiré
  useEffect(() => {
    if (searchParams.get('reason') === 'expired') {
      toastError('Session expirée. Veuillez vous reconnecter.');
    }
  }, [searchParams, toastError]);

  const validate = () => {
    const errs = {};
    if (!email) errs.email = "L'email est requis.";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Format email invalide.';
    if (!password) errs.password = 'Le mot de passe est requis.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});
    try {
      const u = await login(email, password);
      success('Connexion réussie !');
      navigate(u.role === 'student' ? '/my-participations' : '/dashboard');
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-white">
            Grid<span className="text-accent">Lock</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2">Suivi des participations étudiantes</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-xl p-6 shadow-xl">
          <h2 className="font-display text-lg font-bold text-navy mb-5">Connexion</h2>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label htmlFor="email" className="label">Adresse email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => {
                  if (!email) setErrors((p) => ({ ...p, email: "L'email est requis." }));
                }}
                placeholder="sophie@esiee-it.fr"
                className={`input ${errors.email ? 'ring-2 ring-danger border-danger' : ''}`}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-danger text-xs mt-1" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="label">Mot de passe</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => {
                  if (!password) setErrors((p) => ({ ...p, password: 'Le mot de passe est requis.' }));
                }}
                placeholder="••••••••"
                className={`input ${errors.password ? 'ring-2 ring-danger border-danger' : ''}`}
                aria-describedby={errors.password ? 'pwd-error' : undefined}
              />
              {errors.password && (
                <p id="pwd-error" className="text-danger text-xs mt-1" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={!email || !password}
              className="w-full justify-center"
            >
              Se connecter
            </Button>
          </form>

          {/* Comptes de démo */}
          <details className="mt-5">
            <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">
              Comptes de démo
            </summary>
            <div className="mt-2 text-xs text-slate-500 space-y-1 bg-neutral-50 rounded-lg p-3">
              <div>👩‍💼 <strong>Admin :</strong> sophie@esiee-it.fr / Admin123!</div>
              <div>📋 <strong>Director :</strong> marc@esiee-it.fr / Director1!</div>
              <div>🎓 <strong>Étudiant :</strong> enzo.martin@edu.esiee-it.fr / Student1!</div>
            </div>
          </details>

          <p className="text-center text-xs text-slate-400 mt-4">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-accent hover:underline">S'inscrire</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
