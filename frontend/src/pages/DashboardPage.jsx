import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import KpiCard from '../components/KpiCard.jsx';
import { TypeBadge } from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import { formatDate } from '../utils/helpers.js';

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => setData(res.data))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
    </div>
  );

  if (fetchError) return (
    <div className="bg-danger/10 border border-danger/20 text-danger rounded-lg p-4 text-sm">
      Impossible de charger les données.{' '}
      <button className="underline" onClick={() => window.location.reload()}>Réessayer</button>
    </div>
  );

  // ─── Vue étudiant ──────────────────────────────────────────────────────
  if (user?.role === 'student') {
    return (
      <div>
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-navy">Mon tableau de bord</h1>
          <p className="text-slate-500 text-sm mt-1">Aperçu de vos participations</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <KpiCard label="Participations totales" value={data.totalParticipations} icon="📋" color="text-navy" />
          <KpiCard label="Événements à venir" value={data.aVenir} icon="🗓️" color="text-accent" />
          <KpiCard label="Événements passés" value={data.passes} icon="✅" color="text-success" />
        </div>

        <div className="flex gap-3">
          <Button onClick={() => navigate('/my-participations')}>Voir mes participations</Button>
          <Button variant="secondary" onClick={() => navigate('/events')}>Parcourir les événements</Button>
        </div>
      </div>
    );
  }

  // ─── Vue admin / director ──────────────────────────────────────────────
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Tableau de bord</h1>
          <p className="text-slate-500 text-sm mt-1">Vue globale des événements</p>
        </div>
        {isAdmin && (
          <Button onClick={() => navigate('/events?new=1')}>+ Nouvel événement</Button>
        )}
      </div>

      {/* KPI : total événements et total étudiants */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-4xl">
        <KpiCard label="Événements total" value={data.totalEvents} icon="📅" color="text-accent" />
        <KpiCard label="Étudiants total" value={data.totalStudents} icon="👥" color="text-navy" />
        <KpiCard label="Événements à venir" value={data.upcomingEvents} icon="🕒" color="text-success" />
      </div>

      {/* Prochain événement */}
      <div className="card p-6">
        <h2 className="font-display text-base font-bold text-navy mb-4">Prochain événement</h2>

        {!data.nextEvent ? (
          <p className="text-slate-500 text-sm">Aucun événement à venir.</p>
        ) : (
          <div
            className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate(`/events/${data.nextEvent.id}`)}
          >
            <div>
              <div className="flex items-center gap-3 mb-1">
                <TypeBadge type={data.nextEvent.type} />
                <span className="text-xs text-slate-400">{data.nextEvent.mois}</span>
              </div>
              <p className="font-display text-xl font-bold text-navy">{data.nextEvent.nomEvenement}</p>
              <p className="text-slate-500 text-sm mt-1">{data.nextEvent.nomStructure}</p>
              <div className="flex gap-4 mt-2 text-sm text-slate-600">
                <span>📅 {formatDate(data.nextEvent.dateEvent)}</span>
                <span>📍 {data.nextEvent.ville}</span>
                {data.nextEvent.horaires && <span>🕐 {data.nextEvent.horaires}</span>}
              </div>
            </div>
            <div className="text-center ml-8 shrink-0">
              <p className="font-display text-4xl font-bold text-accent">
                {data.nextEvent._count.participations}
              </p>
              <p className="text-xs text-slate-500 mt-1">inscrit{data.nextEvent._count.participations > 1 ? 's' : ''}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;