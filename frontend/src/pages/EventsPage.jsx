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

// ─── Formulaire extrait en dehors du composant parent ─────────────────────
// IMPORTANT : définir EventForm HORS de EventsPage évite la recréation du
// composant à chaque render, ce qui causait la perte de focus à chaque frappe.
const EventForm = React.memo(({ onSubmit, loading }) => {
  const formRef = React.useRef(null);
  const typeRef = React.useRef(null);
  const dateRef = React.useRef(null);
  const structureRef = React.useRef(null);
  const nameRef = React.useRef(null);
  const cityRef = React.useRef(null);
  const scheduleRef = React.useRef(null);
  const needsRef = React.useRef(null);
  const [errors, setErrors] = useState({});

  const getFormValues = () => ({
    type: typeRef.current?.value || 'JPO',
    dateEvent: dateRef.current?.value || '',
    nomStructure: structureRef.current?.value || '',
    nomEvenement: nameRef.current?.value || '',
    ville: cityRef.current?.value || '',
    horaires: scheduleRef.current?.value || '',
    besoins: needsRef.current?.value || '',
  });

  const validate = () => {
    const values = getFormValues();
    const errs = {};
    if (!values.dateEvent) errs.dateEvent = 'Requis';
    if (!values.nomEvenement) errs.nomEvenement = 'Requis';
    if (!values.nomStructure) errs.nomStructure = 'Requis';
    if (!values.ville) errs.ville = 'Requis';
    return { values, errs };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { values, errs } = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    await onSubmit(values);
  };

  const clearFieldError = (field) => () => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const F = ({ id, label, colSpan = '', children }) => (
    <div className={colSpan}>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {errors[id] && <p className="text-danger text-xs mt-1">{errors[id]}</p>}
    </div>
  );

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-4 mb-4">
        {/* Nom de l'événement en premier */}
        <F id="nomEvenement" label="Nom de l'événement *">
          <input id="nomEvenement" type="text" ref={nameRef} onChange={clearFieldError('nomEvenement')}
            placeholder="JPO Printemps Cergy"
            className={`input ${errors.nomEvenement ? 'ring-2 ring-danger' : ''}`} />
        </F>

        <div className="grid grid-cols-2 gap-4">
          <F id="type" label="Type *">
            <select id="type" ref={typeRef} defaultValue="JPO" className="input" onChange={clearFieldError('type')}>
              {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </F>
          <F id="dateEvent" label="Date *">
            <input id="dateEvent" type="date" ref={dateRef} onChange={clearFieldError('dateEvent')}
              className={`input ${errors.dateEvent ? 'ring-2 ring-danger' : ''}`} />
          </F>
          <F id="nomStructure" label="Structure *">
            <input id="nomStructure" type="text" ref={structureRef} onChange={clearFieldError('nomStructure')}
              placeholder="ESIEE-IT Cergy"
              className={`input ${errors.nomStructure ? 'ring-2 ring-danger' : ''}`} />
          </F>
          <F id="ville" label="Ville *">
            <input id="ville" type="text" ref={cityRef} onChange={clearFieldError('ville')}
              placeholder="Cergy"
              className={`input ${errors.ville ? 'ring-2 ring-danger' : ''}`} />
          </F>
          <F id="horaires" label="Horaires">
            <input id="horaires" type="text" ref={scheduleRef} onChange={clearFieldError('horaires')}
              placeholder="10h - 17h" className="input" />
          </F>
          <F id="besoins" label="Besoins">
            <input id="besoins" type="text" ref={needsRef} onChange={clearFieldError('besoins')}
              placeholder="2 étudiants Coding" className="input" />
          </F>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-neutral-100">
        <Button type="submit" loading={loading} disabled={loading}>Enregistrer</Button>
      </div>
    </form>
  );
});
EventForm.displayName = 'EventForm';

// ─── Page principale ────────────────────────────────────────────────────────
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
  const [filterPeriod, setFilterPeriod] = useState(''); // '' | 'upcoming' | 'past'

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType) params.type = filterType;
      const res = await api.get('/events', { params });
      setEvents(res.data);
    } catch {
      toastError('Impossible de charger les événements.');
    } finally {
      setLoading(false);
    }
  }, [filterType, toastError]);

  useEffect(() => { load(); }, [load]);

  // Mémoriser handleCreate pour éviter la recréation à chaque rendu
  // et éviter les re-rendus inutiles du formulaire
  const handleCreate = useCallback(async (form) => {
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
  }, [success, toastError, load, setSearchParams]);

  // Filtre passé/à venir côté frontend
  const now = new Date();
  const displayed = events.filter((ev) => {
    if (!filterPeriod) return true;
    const d = new Date(ev.dateEvent);
    return filterPeriod === 'upcoming' ? d >= now : d < now;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Événements</h1>
          <p className="text-slate-500 text-sm mt-1">{displayed.length} événement{displayed.length > 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowCreate(true)}>+ Nouvel événement</Button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input w-auto">
          <option value="">Tous les types</option>
          {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)} className="input w-auto">
          <option value="">Tous les événements</option>
          <option value="upcoming">À venir</option>
          <option value="past">Passés</option>
        </select>
        {(filterType || filterPeriod) && (
          <button onClick={() => { setFilterType(''); setFilterPeriod(''); }}
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
        ) : displayed.length === 0 ? (
          <EmptyState
            icon="📅"
            message="Aucun événement pour ces filtres."
            cta={isAdmin && !filterType && !filterPeriod && (
              <Button onClick={() => setShowCreate(true)}>Créer le premier événement</Button>
            )}
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
                {displayed.map((ev) => {
                  const isPast = new Date(ev.dateEvent) < now;
                  return (
                    <tr key={ev.id}
                      className={`hover:bg-neutral-50 cursor-pointer transition-colors ${isPast ? 'opacity-60' : ''}`}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isAdmin && (
        <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); setSearchParams({}); }} title="Nouvel événement">
          <EventForm onSubmit={handleCreate} loading={creating} />
        </Modal>
      )}
    </div>
  );
};

export default EventsPage;