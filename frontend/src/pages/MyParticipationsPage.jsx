import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { StatutBadge, TypeBadge, AmbassadeurBadge } from '../components/Badge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatDate } from '../utils/helpers.js';

/**
 * Vue personnelle de l'étudiant connecté — lecture seule (cf. US08 Écran 5).
 * L'étudiant ne peut modifier aucune donnée.
 */
const MyParticipationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/students/me/participations');
        setData(res.data);
      } catch {
        // Erreur gérée par l'intercepteur Axios global
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  const participations = data?.participations || [];
  const student = data?.student;
  const filtered = filterType
    ? participations.filter((p) => p.event.type === filterType)
    : participations;

  const types = [...new Set(participations.map((p) => p.event.type))];
  const nbPresents = participations.filter((p) => p.statut === 'present').length;
  const nbAmbassadeurs = participations.filter((p) => p.estAmbassadeur).length;

  return (
    <div>
      {/* En-tête personnalisé */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-navy">
          Bonjour, {student?.prenom || user?.email} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {student?.formation && <span>{student.formation} · </span>}
          Votre récapitulatif de participations
        </p>
      </div>

      {/* Compteurs */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-5 text-center">
          <p className="font-display text-3xl font-bold text-navy">{participations.length}</p>
          <p className="text-xs text-slate-500 mt-1">participation{participations.length > 1 ? 's' : ''}</p>
        </div>
        <div className="card p-5 text-center">
          <p className="font-display text-3xl font-bold text-success">{nbPresents}</p>
          <p className="text-xs text-slate-500 mt-1">présence{nbPresents > 1 ? 's' : ''}</p>
        </div>
        <div className="card p-5 text-center">
          <p className="font-display text-3xl font-bold text-yellow-600">{nbAmbassadeurs}</p>
          <p className="text-xs text-slate-500 mt-1">ambassadeur</p>
        </div>
      </div>

      {/* Historique */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <h2 className="font-display text-base font-bold text-navy">Mes participations</h2>
          {types.length > 1 && (
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input w-auto text-xs"
            >
              <option value="">Tous les types</option>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon="📋"
            message={
              participations.length === 0
                ? "Vous n'avez pas encore participé à un événement. Contactez votre coordinateur Sourcing."
                : "Aucune participation pour ce filtre."
            }
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

export default MyParticipationsPage;
