import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Button from '../components/Button.jsx';
import { getErrorMessage } from '../utils/helpers.js';

const Field = ({ id, label, type = 'text', placeholder, autoComplete, value, onChange, error }) => (
  <div className="mb-4">
    <label htmlFor={id} className="label">{label}</label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className={`input ${error ? 'ring-2 ring-danger border-danger' : ''}`}
    />
    {error && <p className="text-danger text-xs mt-1" role="alert">{error}</p>}
  </div>
);

const RegisterPage = () => {
  const { register, user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ nom: '', prenom: '', email: '', password: '', confirm: '', formation: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate('/my-participations');
  }, [user, navigate]);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.nom.trim()) errs.nom = 'Le nom est requis.';
    if (!form.prenom.trim()) errs.prenom = 'Le prénom est requis.';
    if (!form.email) errs.email = "L'email est requis.";
    else if (!form.email.endsWith('@edu.esiee-it.fr'))
      errs.email = "L'email doit se terminer par @edu.esiee-it.fr.";
    if (!form.password) errs.password = 'Le mot de passe est requis.';
    else if (form.password.length < 8) errs.password = 'Minimum 8 caractères.';
    else if (!/[A-Z]/.test(form.password)) errs.password = 'Au moins une majuscule requise.';
    else if (!/[0-9]/.test(form.password)) errs.password = 'Au moins un chiffre requis.';
    else if (!/[^A-Za-z0-9]/.test(form.password)) errs.password = 'Au moins un caractère spécial requis.';
    if (!form.formation) errs.formation = 'La formation est requise.';
    if (form.password !== form.confirm) errs.confirm = 'Les mots de passe ne correspondent pas.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    setErrors({});
    try {
      await register(form.nom, form.prenom, form.email, form.password, form.formation);
      success('Compte créé avec succès !');
      navigate('/my-participations');
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = form.nom && form.prenom && form.email && form.password && form.confirm && form.formation;

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-white">
            Grid<span className="text-accent">Lock</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2">Créer un compte étudiant</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-xl">
          <h2 className="font-display text-lg font-bold text-navy mb-5">Inscription</h2>

          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label htmlFor="nom" className="label">Nom *</label>
                <input id="nom" type="text" value={form.nom} onChange={set('nom')}
                  placeholder="MARTIN" autoComplete="family-name"
                  className={`input ${errors.nom ? 'ring-2 ring-danger border-danger' : ''}`} />
                {errors.nom && <p className="text-danger text-xs mt-1">{errors.nom}</p>}
              </div>
              <div>
                <label htmlFor="prenom" className="label">Prénom *</label>
                <input id="prenom" type="text" value={form.prenom} onChange={set('prenom')}
                  placeholder="Enzo" autoComplete="given-name"
                  className={`input ${errors.prenom ? 'ring-2 ring-danger border-danger' : ''}`} />
                {errors.prenom && <p className="text-danger text-xs mt-1">{errors.prenom}</p>}
              </div>
            </div>

            <Field id="email" label="Email ESIEE-IT *" type="email"
              placeholder="prenom.nom@edu.esiee-it.fr" autoComplete="email"
              value={form.email} onChange={set('email')} error={errors.email} />

            <div className="mb-4">
              <label htmlFor="formation" className="label">Formation *</label>
              <input id="formation" type="text" value={form.formation} onChange={set('formation')}
                placeholder="Ex : Master Cyber"
                className={`input ${errors.formation ? 'ring-2 ring-danger' : ''}`} />
              {errors.formation && <p className="text-danger text-xs mt-1">{errors.formation}</p>}
            </div>

            <Field id="password" label="Mot de passe *" type="password"
              placeholder="Min. 8 car., 1 maj., 1 chiffre, 1 spécial" autoComplete="new-password"
              value={form.password} onChange={set('password')} error={errors.password} />

            <Field id="confirm" label="Confirmer le mot de passe *" type="password"
              placeholder="••••••••" autoComplete="new-password"
              value={form.confirm} onChange={set('confirm')} error={errors.confirm} />

            {/* Indicateur de force */}
            {form.password && (
              <div className="mb-4 -mt-2">
                <div className="flex gap-1 mb-1">
                  {(() => {
                    const criteria = [
                      form.password.length >= 8,
                      /[A-Z]/.test(form.password),
                      /[0-9]/.test(form.password),
                      /[^A-Za-z0-9]/.test(form.password),
                    ];
                    const metCount = criteria.filter(Boolean).length;
                    return criteria.map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i < metCount ? 'bg-success' : 'bg-neutral-100'}`} />
                    ));
                  })()}
                </div>
                <p className="text-xs text-slate-400">
                  {(() => {
                    const criteriaLabels = [
                      { met: form.password.length >= 8, label: 'Minimum 8 caractères' },
                      { met: /[A-Z]/.test(form.password), label: '1 majuscule' },
                      { met: /[0-9]/.test(form.password), label: '1 chiffre' },
                      { met: /[^A-Za-z0-9]/.test(form.password), label: '1 caractère spécial' },
                    ];
                    const missing = criteriaLabels.filter(c => !c.met).map(c => c.label);
                    return missing.length > 0 ? missing.join(' · ') : 'Mot de passe fort';
                  })()}
                </p>
              </div>
            )}

            <Button type="submit" loading={loading} disabled={!canSubmit || loading}
              className="w-full justify-center mt-2">
              Créer mon compte
            </Button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-5">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-accent hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;