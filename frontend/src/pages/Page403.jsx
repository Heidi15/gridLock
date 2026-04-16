import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';

const Page403 = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl mb-6">🔒</p>
        <h1 className="font-display text-3xl font-bold text-navy mb-3">Accès refusé</h1>
        <p className="text-slate-500 text-sm mb-8">
          Vous n&apos;avez pas les droits pour accéder à cette page.
        </p>
        <Button onClick={() => navigate(-1)}>← Retour</Button>
      </div>
    </div>
  );
};

export default Page403;
