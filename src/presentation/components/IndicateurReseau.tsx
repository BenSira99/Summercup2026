'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export const IndicateurReseau: React.FC = () => {
  const [estEnLigne, setEstEnLigne] = useState<boolean>(true);
  const [afficherNotification, setAfficherNotification] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setEstEnLigne(navigator.onLine);

    const gestionnaireEnLigne = () => {
      setEstEnLigne(true);
      setAfficherNotification(true);
      setTimeout(() => setAfficherNotification(false), 3500);
    };

    const gestionnaireHorsLigne = () => {
      setEstEnLigne(false);
      setAfficherNotification(true);
    };

    window.addEventListener('online', gestionnaireEnLigne);
    window.addEventListener('offline', gestionnaireHorsLigne);

    return () => {
      window.removeEventListener('online', gestionnaireEnLigne);
      window.removeEventListener('offline', gestionnaireHorsLigne);
    };
  }, []);

  if (!afficherNotification && estEnLigne) return null;

  return (
    <div
      className={`fixed top-3 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-xs font-bold shadow-lg border backdrop-blur-md transition-all duration-300 flex items-center gap-2 ${
        estEnLigne
          ? 'bg-emerald-900/90 text-emerald-100 border-emerald-500/40 shadow-emerald-900/30'
          : 'bg-amber-950/95 text-amber-100 border-amber-500/50 shadow-amber-950/40 animate-pulse'
      }`}
    >
      {estEnLigne ? (
        <>
          <Wifi className="w-4 h-4 text-emerald-400" />
          <span>Connexion réseau rétablie</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-amber-400" />
          <span>Connexion instable — Mode sauvegarde hors-ligne actif</span>
        </>
      )}
    </div>
  );
};
