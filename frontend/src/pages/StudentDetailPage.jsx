import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { StatutBadge, TypeBadge, AmbassadeurBadge } from '../components/Badge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatDate } from '../utils/helpers.js';

const StudentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { error: toastError } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/students/${id}/participations`);
        setData(res.data);
      } catch {
        toastError('Impossible de charger ce profil étudiant.');
        navigate('/students');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate, toastError]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) return null;

  const { student, participations } = data;
  const filtered = filterType
    ? participations.filter((p) => p.event.type === filterType)
    : participations;

  const types = [...new Set(participations.map((p) => p.event.type))];
  const nbPresents = participations.filter((p) => p.statut === 'present').length;
  const nbAmbassadeurs = participations.filter((p) => p.estAmbassadeur).length;

  return (
    <div>
      <button onClick={() => navigate('/students')}
        className="text-sm text-accent hover:underline mb-6 block">
        ← Retour aux étudiants
      </button>

      {/* Fiche étudiant */}
      <div className="card p-6 mb-6">
        <h1 className="font-display text-2xl font-bold text-navy">
          {student.nom} {student.prenom}
        </h1>
        <p className="text-slate-500 text-sm mt-1">{student.formation}</p>
        {student.email && <p className="text-xs text-slate-400 mt-1">{student.email}</p>}

        {/* Compteurs */}
        <div className="flex flex-wrap gap-6 mt-5 pt-5 border-t border-neutral-100 text-sm">
          <div>
            <span className="font-bold text-navy text-xl">{participations.length}</span>
            <span className="text-slate-500 ml-1">participation{participations.length > 1 ? 's' : ''}</span>
          </div>
          <div>
            <span className="font-bold text-success text-xl">{nbPresents}</span>
            <span className="text-slate-500 ml-1">présent{nbPresents > 1 ? 's' : ''}</span>
          </div>
          {nbAmbassadeurs > 0 && (
            <div>
              <span className="font-bold text-yellow-600 text-xl">{nbAmbassadeurs}</span>
              <span className="text-slate-500 ml-1">fois ambassadeur</span>
            </div>
          )}
        </div>
      </div>

      {/* Historique */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <h2 className="font-display text-base font-bold text-navy">Historique des participations</h2>
          {types.length > 1 && (
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
              className="input w-auto text-xs">
              <option value="">Tous les types</option>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon="📋"
            message={participations.length === 0
              ? "Cet étudiant n'a participé à aucun événement cette année."
              : "Aucune participation pour ce filtre."}
          />
        ) : (
          <div className="divide-y divide-neutral-100">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-neutral-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/events/${p.event.id}`)}
              >
                <div>
                  <p className="font-medium text-navy text-sm">{p.event.nomEvenement}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatDate(p.event.dateEvent)} · {p.event.ville}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <TypeBadge type={p.event.type} />
                  <StatutBadge statut={p.statut} />
                  {p.estAmbassadeur && <AmbassadeurBadge />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetailPage;
