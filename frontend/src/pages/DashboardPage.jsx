import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import KpiCard from '../components/KpiCard.jsx';
import { TypeBadge } from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatDate } from '../utils/helpers.js';

const DashboardPage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data);
      } catch {
        setFetchError(true);
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

  if (fetchError) {
    return (
      <div className="bg-danger/10 border border-danger/20 text-danger rounded-lg p-4 text-sm">
        Impossible de charger les données.{' '}
        <button className="underline" onClick={() => window.location.reload()}>Réessayer</button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Tableau de bord</h1>
          <p className="text-slate-500 text-sm mt-1">Vue globale des participations</p>
        </div>
        {isAdmin && (
          <Button onClick={() => navigate('/events?new=1')}>
            + Nouvel événement
          </Button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Événements" value={data.totalEvents} icon="📅" color="text-accent" />
        <KpiCard label="Participations" value={data.totalParticipations} icon="👥" color="text-navy" />
        <KpiCard label="Présents" value={data.totalPresents} icon="✅" color="text-success" />
        <KpiCard label="Ambassadeurs" value={data.totalAmbassadeurs} icon="⭐" color="text-yellow-600" />
      </div>

      {/* Répartition par type */}
      {data.byType.length > 0 && (
        <div className="card p-5 mb-6">
          <h2 className="font-display text-base font-bold text-navy mb-4">Répartition par type</h2>
          <div className="flex flex-wrap gap-3">
            {data.byType.map((b) => (
              <div key={b.type} className="flex items-center gap-2">
                <TypeBadge type={b.type} />
                <span className="text-sm font-semibold text-navy">{b.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Événements récents */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <h2 className="font-display text-base font-bold text-navy">Événements récents</h2>
          <button
            className="text-sm text-accent hover:underline"
            onClick={() => navigate('/events')}
          >
            Voir tous →
          </button>
        </div>

        {data.recentEvents.length === 0 ? (
          <EmptyState
            icon="📅"
            message="Aucun événement cette année."
            cta={isAdmin && (
              <Button onClick={() => navigate('/events?new=1')}>
                Créer le premier événement
              </Button>
            )}
          />
        ) : (
          <div className="divide-y divide-neutral-100">
            {data.recentEvents.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center justify-between p-4 hover:bg-neutral-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/events/${ev.id}`)}
              >
                <div>
                  <p className="text-sm font-medium text-navy">{ev.nomEvenement}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDate(ev.dateEvent)} · {ev.ville}</p>
                </div>
                <div className="flex items-center gap-3">
                  <TypeBadge type={ev.type} />
                  <span className="text-xs text-slate-500">
                    {ev._count.participations} inscrits
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
