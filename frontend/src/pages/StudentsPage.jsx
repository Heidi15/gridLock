import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

const StudentsPage = () => {
  const navigate = useNavigate();
  const [allStudents, setAllStudents] = useState([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null); // null = pas encore cherché
  const [loadingAll, setLoadingAll] = useState(true);
  const debounceRef = useRef(null);

  // Charge la liste complète au montage
  useEffect(() => {
    api.get('/students/all')
      .then((res) => setAllStudents(res.data))
      .catch(() => { /* silently ignore load error */ })
      .finally(() => setLoadingAll(false));
  }, []);

  const search = useCallback((q) => {
    if (q.length < 2) { setResults(null); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get('/students', { params: { q } });
        setResults(res.data);
      } catch { /* silently ignore search error */ }
    }, 300);
  }, []);

  const handleChange = (e) => {
    setQuery(e.target.value);
    search(e.target.value);
  };

  const displayed = results !== null ? results : allStudents;
  const isSearching = query.length >= 2;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-navy">Étudiants</h1>
        <p className="text-slate-500 text-sm mt-1">
          {loadingAll ? '...' : `${allStudents.length} étudiant${allStudents.length > 1 ? 's' : ''} au total`}
        </p>
      </div>

      <div className="card p-4 mb-6 max-w-xl">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Rechercher par nom ou prénom..."
          className="input"
          autoComplete="off"
        />
      </div>

      {loadingAll && !isSearching ? (
        <div className="flex justify-center h-32 items-center">
          <div className="animate-spin h-6 w-6 border-4 border-accent border-t-transparent rounded-full" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="card p-6 text-sm text-slate-500">
          {isSearching ? `Aucun résultat pour "${query}"` : 'Aucun étudiant enregistré.'}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-100 text-xs font-semibold text-slate-500 uppercase tracking-wide grid grid-cols-12">
            <span className="col-span-4">Nom</span>
            <span className="col-span-5">Formation</span>
            <span className="col-span-2 text-right">Participations</span>
            <span className="col-span-1" />
          </div>
          <div className="divide-y divide-neutral-100">
            {displayed.map((s) => (
              <div
                key={s.id}
                className="grid grid-cols-12 items-center px-5 py-3 hover:bg-neutral-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/students/${s.id}`)}
              >
                <div className="col-span-4">
                  <p className="font-medium text-navy text-sm">{s.nom} {s.prenom}</p>
                  {s.email && <p className="text-xs text-slate-400">{s.email}</p>}
                </div>
                <p className="col-span-5 text-xs text-slate-500">{s.formation}</p>
                <p className="col-span-2 text-right text-sm font-semibold text-navy">
                  {s._count?.participations ?? 0}
                </p>
                <span className="col-span-1 text-right text-accent text-sm">→</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;