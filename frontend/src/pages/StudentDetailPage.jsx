import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { StatutBadge, TypeBadge, AmbassadeurBadge } from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import Modal from '../components/Modal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatDate, getErrorMessage } from '../utils/helpers.js';

const ANNEE_OPTIONS = [
  'B1', 'B2', 'B3', 'M1', 'M2',
  'ING 1', 'ING 2', 'ING 3', 'ING 4', 'ING 5',
];

const StudentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isDirector } = useAuth();
  const { success, error: toastError } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ nom: '', prenom: '', formation: '', annee: '' });
  const [editErrors, setEditErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/students/${id}/participations`);
        setData(res.data);
        setEditForm({
          nom: res.data.student.nom,
          prenom: res.data.student.prenom,
          formation: res.data.student.formation || '',
          annee: res.data.student.annee || '',
        });
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
  const canEditStudent = isAdmin || isDirector;
  const filtered = filterType
    ? participations.filter((p) => p.event.type === filterType)
    : participations;

  const types = [...new Set(participations.map((p) => p.event.type))];
  const nbPresents = participations.filter((p) => p.statut === 'present').length;
  const nbAmbassadeurs = participations.filter((p) => p.estAmbassadeur).length;

  const handleEditChange = (key) => (e) => setEditForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!editForm.nom.trim()) errors.nom = 'Le nom est requis.';
    if (!editForm.prenom.trim()) errors.prenom = 'Le prénom est requis.';
    if (!editForm.formation) errors.formation = 'La formation est requise.';
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    setEditLoading(true);
    try {
      const res = await api.put(`/students/${id}`, editForm);
      setData((prev) => ({ ...prev, student: { ...prev.student, ...res.data } }));
      success('Profil étudiant mis à jour.');
      setIsEditing(false);
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/students/${id}`);
      success('Étudiant supprimé avec succès.');
      navigate('/students');
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

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
        {student.annee && <p className="text-xs text-slate-400 mt-1">{student.annee}</p>}
        {student.email && <p className="text-xs text-slate-400 mt-1">{student.email}</p>}
        {canEditStudent && (
          <div className="mt-4 flex gap-3">
            <Button variant="secondary" onClick={() => {
              setEditErrors({});
              setEditForm({ nom: student.nom, prenom: student.prenom, formation: student.formation || '', annee: student.annee || '' });
              setIsEditing(true);
            }}>
              Modifier
            </Button>
            <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
              Supprimer
            </Button>
          </div>
        )}

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

      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Modifier l'étudiant"
      >
        <form onSubmit={handleEditSubmit} noValidate>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="edit-nom" className="label">Nom *</label>
              <input
                id="edit-nom"
                type="text"
                value={editForm.nom}
                onChange={handleEditChange('nom')}
                className={`input ${editErrors.nom ? 'ring-2 ring-danger' : ''}`}
              />
              {editErrors.nom && <p className="text-danger text-xs mt-1">{editErrors.nom}</p>}
            </div>
            <div>
              <label htmlFor="edit-prenom" className="label">Prénom *</label>
              <input
                id="edit-prenom"
                type="text"
                value={editForm.prenom}
                onChange={handleEditChange('prenom')}
                className={`input ${editErrors.prenom ? 'ring-2 ring-danger' : ''}`}
              />
              {editErrors.prenom && <p className="text-danger text-xs mt-1">{editErrors.prenom}</p>}
            </div>
            <div>
              <label htmlFor="edit-formation" className="label">Formation *</label>
              <input
                id="edit-formation"
                type="text"
                value={editForm.formation}
                onChange={handleEditChange('formation')}
                placeholder="Ex : Master Cyber"
                className={`input ${editErrors.formation ? 'ring-2 ring-danger' : ''}`}
              />
              {editErrors.formation && <p className="text-danger text-xs mt-1">{editErrors.formation}</p>}
            </div>
            <div>
              <label htmlFor="edit-annee" className="label">Année</label>
              <select
                id="edit-annee"
                value={editForm.annee}
                onChange={handleEditChange('annee')}
                className="input"
              >
                <option value="">Sélectionnez une année (optionnel)</option>
                {ANNEE_OPTIONS.map((annee) => (
                  <option key={annee} value={annee}>{annee}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsEditing(false)}>Annuler</Button>
            <Button type="submit" loading={editLoading}>Enregistrer</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirmer la suppression"
      >
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-navy font-medium mb-2">
            Êtes-vous sûr de vouloir supprimer cet étudiant ?
          </p>
          <p className="text-slate-500 text-sm mb-6">
            Cette action est irréversible. Toutes les données de l'étudiant, ses participations et son compte utilisateur seront supprimés.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
              Annuler
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={isDeleting}>
              Supprimer définitivement
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentDetailPage;
