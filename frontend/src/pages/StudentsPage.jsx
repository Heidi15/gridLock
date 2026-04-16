import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

const StudentsPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef(null);

  const search = useCallback((q) => {
    if (q.length < 2) { setResults([]); setSearched(false); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get('/students', { params: { q } });
        setResults(res.data);
        setSearched(true);
      } catch { /* silencieux */ }
    }, 300);
  }, []);

  const handleChange = (e) => {
    setQuery(e.target.value);
    search(e.target.value);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-navy">Étudiants</h1>
        <p className="text-slate-500 text-sm mt-1">Recherchez un étudiant pour consulter son récapitulatif</p>
      </div>

      <div className="card p-6 mb-6 max-w-xl">
        <label htmlFor="search" className="label">Rechercher par nom ou prénom</label>
        <input
          id="search"
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Tapez au moins 2 caractères..."
          className="input"
          autoFocus
          autoComplete="off"
        />
      </div>

      {searched && results.length === 0 && (
        <div className="card p-6 text-sm text-slate-500">
          Aucun étudiant trouvé pour &quot;{query}&quot;
        </div>
      )}

      {results.length > 0 && (
        <div className="card overflow-hidden">
          <div className="divide-y divide-neutral-100">
            {results.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-neutral-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/students/${s.id}`)}
              >
                <div>
                  <p className="font-medium text-navy">{s.nom} {s.prenom}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.formation}</p>
                </div>
                <span className="text-accent text-sm">Voir le récap →</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
