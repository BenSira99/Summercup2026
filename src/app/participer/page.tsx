'use client';

import React, { useState, useEffect } from 'react';
import { FormulaireParticipation } from '@/presentation/components/FormulaireParticipation';
import { IndicateurReseau } from '@/presentation/components/IndicateurReseau';
import { Loader2 } from 'lucide-react';

export default function PageParticiperMobile() {
  const [configuration, setConfiguration] = useState<{
    nomEvenement: string;
    nomStand: string;
    descriptionLot: string;
    dateTirage: string;
    heureTirage: string;
    lotsParRang: string[];
  } | null>(null);

  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const chargerConfig = async () => {
      try {
        const reponse = await fetch('/api/admin');
        if (reponse.ok) {
          const data = await reponse.json();
          if (data.configuration) {
            setConfiguration(data.configuration);
          }
        }
      } catch (e) {
        console.error("Erreur de chargement de la configuration:", e);
      } finally {
        setChargement(false);
      }
    };

    chargerConfig();
  }, []);

  if (chargement || !configuration) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-3xl shadow-xl border border-amber-200">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Chargement du formulaire...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100/60 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="fixed top-0 left-0 right-0 h-48 bg-linear-to-b from-amber-100/50 via-slate-100/20 to-transparent pointer-events-none" />

      {/* Alerte Réseau discret */}
      <IndicateurReseau />

      <div className="w-full relative z-10 py-6">
        <FormulaireParticipation
          nomEvenement={configuration.nomEvenement}
          nomStand={configuration.nomStand}
          descriptionLot={configuration.descriptionLot}
          horodatageTirage={`${configuration.dateTirage} à ${configuration.heureTirage}`}
          lotsParRang={configuration.lotsParRang}
        />
      </div>
    </main>
  );
}
