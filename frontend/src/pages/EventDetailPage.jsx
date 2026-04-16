import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Button from '../components/Button.jsx';
import Modal from '../components/Modal.jsx';
import { StatutBadge, TypeBadge, AmbassadeurBadge } from '../components/Badge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatDate, statutLabel, getErrorMessage } from '../utils/helpers.js';

const STATUTS = ['confirme', 'present', 'absent'];

// ─── Modale d'ajout de participant ────────────────────────────────────────
const AddParticipantModal = ({ eventId, isOpen, onClose, onAdded }) => {
  const { error: toastError } = useToast();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [statut, setStatut] = useState('confirme');
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const search = useCallback((q) => {
    if (q.length < 2) { setSuggestions([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get('/students', { params: { q } });
        setSuggestions(res.data);
      } catch { /* silencieux */ }
    }, 250);
  }, []);

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setSelected(null);
    search(e.target.value);
  };

  const handleSelect = (s) => {
    setSelected(s);
    setQuery(`${s.nom} ${s.prenom}`);
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) { toastError('Sélectionnez un étudiant dans la liste.'); return; }
    setLoading(true);
    try {
      await api.post(`/events/${eventId}/participations`, {
        studentId: selected.id, statut,
      });
      onAdded();
      onClose();
      setQuery(''); setSelected(null); setStatut('confirme');
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Inscrire un étudiant">
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4 relative">
          <label className="label">Nom de l&apos;étudiant *</label>
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Tapez un nom (min. 2 caractères)"
            className="input"
            autoComplete="off"
            autoFocus
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-neutral-100 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
              {suggestions.map((s) => (
                <li
                  key={s.id}
                  onClick={() => handleSelect(s)}
                  className="px-4 py-2.5 hover:bg-neutral-50 cursor-pointer text-sm"
                >
                  <span className="font-medium text-navy">{s.nom} {s.prenom}</span>
                  <span className="text-slate-400 ml-2 text-xs">{s.formation}</span>
                </li>
              ))}
            </ul>
          )}
          {query.length >= 2 && suggestions.length === 0 && !selected && (
            <p className="text-xs text-slate-400 mt-1">Aucun étudiant trouvé pour &quot;{query}&quot;</p>
          )}
        </div>

        <div className="mb-6">
          <label className="label">Statut</label>
          <select value={statut} onChange={(e) => setStatut(e.target.value)} className="input">
            {STATUTS.map((s) => (
              <option key={s} value={s}>{statutLabel(s)}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} type="button">Annuler</Button>
          <Button type="submit" loading={loading} disabled={!selected || loading}>
            Inscrire
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Page principale ────────────────────────────────────────────────────────
const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { success, error: toastError } = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // id participation à supprimer

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data);
    } catch {
      toastError('Impossible de charger cet événement.');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toastError]);

  useEffect(() => { load(); }, [load]);

  const handleStatutChange = async (participationId, newStatut) => {
    try {
      await api.put(`/participations/${participationId}`, { statut: newStatut });
      success('Statut mis à jour.');
      load();
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  };

  const handleAmbassadeurToggle = async (participationId, current) => {
    try {
      await api.put(`/participations/${participationId}`, { estAmbassadeur: !current });
      load();
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  };

  const handleDelete = async (participationId) => {
    try {
      await api.delete(`/participations/${participationId}`);
      success('Participant supprimé.');
      setDeleteConfirm(null);
      load();
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm(`Supprimer "${event.nomEvenement}" et toutes ses participations ?`)) return;
    try {
      await api.delete(`/events/${id}`);
      success('Événement supprimé.');
      navigate('/events');
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!event) return null;

  const participations = event.participations || [];
  const nbPresents = participations.filter((p) => p.statut === 'present').length;
  const nbAmbassadeurs = participations.filter((p) => p.estAmbassadeur).length;

  return (
    <div>
      {/* Breadcrumb */}
      <button onClick={() => navigate('/events')}
        className="text-sm text-accent hover:underline mb-6 block">
        ← Retour aux événements
      </button>

      {/* En-tête fiche */}
      <div className="card p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <TypeBadge type={event.type} />
              <span className="text-xs text-slate-400">{event.mois}</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-navy">{event.nomEvenement}</h1>
            <p className="text-slate-500 text-sm mt-1">{event.nomStructure}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-600">
              <span>📅 {formatDate(event.dateEvent)}</span>
              <span>📍 {event.ville}</span>
              {event.horaires && <span>🕐 {event.horaires}</span>}
              {event.besoins && <span>💡 {event.besoins}</span>}
            </div>
          </div>

          {isAdmin && (
            <div className="flex gap-2">
              <Button variant="danger" onClick={handleDeleteEvent}>
                Supprimer
              </Button>
            </div>
          )}
        </div>

        {/* Compteurs */}
        <div className="flex gap-6 mt-5 pt-5 border-t border-neutral-100 text-sm">
          <div><span className="font-bold text-navy">{participations.length}</span>
            <span className="text-slate-500 ml-1">inscrit{participations.length > 1 ? 's' : ''}</span>
          </div>
          <div><span className="font-bold text-success">{nbPresents}</span>
            <span className="text-slate-500 ml-1">présent{nbPresents > 1 ? 's' : ''}</span>
          </div>
          <div><span className="font-bold text-yellow-600">{nbAmbassadeurs}</span>
            <span className="text-slate-500 ml-1">ambassadeur{nbAmbassadeurs > 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Liste participants */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <h2 className="font-display text-base font-bold text-navy">Participants</h2>
          {isAdmin && (
            <Button onClick={() => setShowAdd(true)}>+ Ajouter un participant</Button>
          )}
        </div>

        {participations.length === 0 ? (
          <EmptyState
            icon="👥"
            message="Aucun participant inscrit à cet événement."
            cta={isAdmin && <Button onClick={() => setShowAdd(true)}>Inscrire un étudiant</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-100">
                <tr>
                  {['Nom / Prénom', 'Formation', 'Statut', 'Ambassadeur', isAdmin ? 'Actions' : ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {participations.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-navy">
                      {p.student.nom} {p.student.prenom}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{p.student.formation}</td>
                    <td className="px-4 py-3">
                      {isAdmin ? (
                        <select
                          value={p.statut}
                          onChange={(e) => handleStatutChange(p.id, e.target.value)}
                          className="text-xs border border-neutral-100 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-accent"
                        >
                          {STATUTS.map((s) => (
                            <option key={s} value={s}>{statutLabel(s)}</option>
                          ))}
                        </select>
                      ) : (
                        <StatutBadge statut={p.statut} />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isAdmin ? (
                        <input
                          type="checkbox"
                          checked={p.estAmbassadeur}
                          onChange={() => handleAmbassadeurToggle(p.id, p.estAmbassadeur)}
                          className="w-4 h-4 accent-gold cursor-pointer"
                          aria-label="Ambassadeur"
                        />
                      ) : (
                        p.estAmbassadeur && <AmbassadeurBadge />
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setDeleteConfirm(p.id)}
                          className="text-danger hover:opacity-70 text-xs font-medium"
                          aria-label={`Supprimer ${p.student.nom} ${p.student.prenom}`}
                        >
                          Supprimer
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modale ajout */}
      <AddParticipantModal
        eventId={id}
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onAdded={() => { success('Inscrit avec succès.'); load(); }}
      />

      {/* Modale confirmation suppression */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirmer la suppression"
      >
        <p className="text-sm text-slate-600 mb-6">
          Êtes-vous sûr de vouloir supprimer ce participant ? Cette action est irréversible.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
          <Button variant="danger" onClick={() => handleDelete(deleteConfirm)}>Supprimer</Button>
        </div>
      </Modal>
    </div>
  );
};

export default EventDetailPage;
