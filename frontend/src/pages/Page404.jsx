import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';

const Page404 = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl mb-6">🔍</p>
        <h1 className="font-display text-3xl font-bold text-navy mb-3">Page introuvable</h1>
        <p className="text-slate-500 text-sm mb-8">
          La ressource que vous cherchez n&apos;existe pas ou a été supprimée.
        </p>
        <Button onClick={() => navigate('/dashboard')}>← Retour au tableau de bord</Button>
      </div>
    </div>
  );
};

export default Page404;
