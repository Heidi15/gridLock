import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Button from '../components/Button.jsx';
import Modal from '../components/Modal.jsx';
import { TypeBadge } from '../components/Badge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatDate, getErrorMessage } from '../utils/helpers.js';

const EVENT_TYPES = ['JPO', 'Salon', 'Forum', 'Evenement'];
const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

const EventForm = ({ initial = {}, onSubmit, loading }) => {
  const [form, setForm] = useState({
    mois: '', type: 'JPO', dateEvent: '', nomStructure: '',
    nomEvenement: '', ville: '', horaires: '', besoins: '',
    ...initial,
  });
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.mois) errs.mois = 'Requis';
    if (!form.dateEvent) errs.dateEvent = 'Requis';
    if (!form.nomStructure) errs.nomStructure = 'Requis';
    if (!form.nomEvenement) errs.nomEvenement = 'Requis';
    if (!form.ville) errs.ville = 'Requis';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit(form);
  };

  const F = ({ id, label, children }) => (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {errors[id] && <p className="text-danger text-xs mt-1">{errors[id]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <F id="mois" label="Mois *">
          <select id="mois" value={form.mois} onChange={set('mois')}
            className={`input ${errors.mois ? 'ring-2 ring-danger' : ''}`}>
            <option value="">— Choisir —</option>
            {MOIS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </F>
        <F id="type" label="Type *">
          <select id="type" value={form.type} onChange={set('type')} className="input">
            {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </F>
        <F id="dateEvent" label="Date *">
          <input id="dateEvent" type="date" value={form.dateEvent} onChange={set('dateEvent')}
            className={`input ${errors.dateEvent ? 'ring-2 ring-danger' : ''}`} />
        </F>
        <F id="ville" label="Ville *">
          <input id="ville" type="text" value={form.ville} onChange={set('ville')}
            placeholder="Paris" className={`input ${errors.ville ? 'ring-2 ring-danger' : ''}`} />
        </F>
        <F id="nomStructure" label="Structure *">
          <input id="nomStructure" type="text" value={form.nomStructure} onChange={set('nomStructure')}
            placeholder="ESIEE-IT Cergy" className={`input col-span-2 ${errors.nomStructure ? 'ring-2 ring-danger' : ''}`} />
        </F>
        <F id="nomEvenement" label="Nom de l'événement *">
          <input id="nomEvenement" type="text" value={form.nomEvenement} onChange={set('nomEvenement')}
            placeholder="JPO Printemps" className={`input col-span-2 ${errors.nomEvenement ? 'ring-2 ring-danger' : ''}`} />
        </F>
        <F id="horaires" label="Horaires">
          <input id="horaires" type="text" value={form.horaires} onChange={set('horaires')}
            placeholder="10h - 17h" className="input" />
        </F>
        <F id="besoins" label="Besoins">
          <input id="besoins" type="text" value={form.besoins} onChange={set('besoins')}
            placeholder="2 étudiants Coding" className="input" />
        </F>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading} disabled={loading}>Enregistrer</Button>
      </div>
    </form>
  );
};

const EventsPage = () => {
  const { isAdmin } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(searchParams.get('new') === '1');
  const [creating, setCreating] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterMois, setFilterMois] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType) params.type = filterType;
      if (filterMois) params.mois = filterMois;
      const res = await api.get('/events', { params });
      setEvents(res.data);
    } catch {
      toastError('Impossible de charger les événements.');
    } finally {
      setLoading(false);
    }
  }, [filterType, filterMois, toastError]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (form) => {
    setCreating(true);
    try {
      await api.post('/events', form);
      success('Événement créé avec succès.');
      setShowCreate(false);
      setSearchParams({});
      load();
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Événements</h1>
          <p className="text-slate-500 text-sm mt-1">{events.length} événement{events.length > 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowCreate(true)}>+ Nouvel événement</Button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
          className="input w-auto">
          <option value="">Tous les types</option>
          {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterMois} onChange={(e) => setFilterMois(e.target.value)}
          className="input w-auto">
          <option value="">Tous les mois</option>
          {MOIS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        {(filterType || filterMois) && (
          <button onClick={() => { setFilterType(''); setFilterMois(''); }}
            className="text-sm text-accent hover:underline">
            Réinitialiser
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin h-6 w-6 border-4 border-accent border-t-transparent rounded-full" />
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            icon="📅"
            message="Aucun événement cette année."
            cta={isAdmin && <Button onClick={() => setShowCreate(true)}>Créer le premier événement</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-100">
                <tr>
                  {['Événement', 'Type', 'Date', 'Ville', 'Inscrits', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-neutral-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/events/${ev.id}`)}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy">{ev.nomEvenement}</p>
                      <p className="text-xs text-slate-400">{ev.nomStructure}</p>
                    </td>
                    <td className="px-4 py-3"><TypeBadge type={ev.type} /></td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(ev.dateEvent)}</td>
                    <td className="px-4 py-3 text-slate-600">{ev.ville}</td>
                    <td className="px-4 py-3 text-slate-600">{ev._count?.participations ?? 0}</td>
                    <td className="px-4 py-3 text-accent text-right">→</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); setSearchParams({}); }} title="Nouvel événement">
        <EventForm onSubmit={handleCreate} loading={creating} />
      </Modal>
    </div>
  );
};

export default EventsPage;
