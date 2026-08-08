'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';

export interface OptionDateFilter {
  valeur: string;
  libelle: string;
  compte: number;
}

interface ProprietesSelecteurDateFilter {
  valeurActive: string;
  options: OptionDateFilter[];
  totalTous: number;
  surChangement: (nouvelleValeur: string) => void;
}

export const SelecteurDateFilter: React.FC<ProprietesSelecteurDateFilter> = ({
  valeurActive,
  options,
  totalTous,
  surChangement,
}) => {
  const [ouvert, setOuvert] = useState(false);
  const refConteneur = useRef<HTMLDivElement>(null);

  // Fermeture automatique au clic à l'extérieur
  useEffect(() => {
    const fermerAuClicExterieur = (e: MouseEvent) => {
      if (refConteneur.current && !refConteneur.current.contains(e.target as Node)) {
        setOuvert(false);
      }
    };
    document.addEventListener('mousedown', fermerAuClicExterieur);
    return () => document.removeEventListener('mousedown', fermerAuClicExterieur);
  }, []);

  // Déterminer le libellé de l'option active
  const obtenirLibelleActif = () => {
    if (valeurActive === 'toutes') {
      return `Toutes les dates (${totalTous})`;
    }
    const trouve = options.find((o) => o.valeur === valeurActive);
    if (trouve) {
      return `${trouve.libelle} (${trouve.compte})`;
    }
    return `Toutes les dates (${totalTous})`;
  };

  const choisirOption = (val: string) => {
    surChangement(val);
    setOuvert(false);
  };

  return (
    <div ref={refConteneur} className="relative font-sans inline-block w-full sm:w-auto">
      {/* Bouton Déclencheur sur-mesure Thème Royal */}
      <button
        type="button"
        onClick={() => setOuvert(!ouvert)}
        className={`w-full sm:w-auto px-4 py-2.5 rounded-full border transition-all flex items-center justify-between sm:justify-start gap-2.5 shadow-2xs font-extrabold text-xs cursor-pointer select-none ${
          ouvert
            ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-200 text-amber-950 scale-102'
            : 'bg-white hover:bg-slate-50 border-amber-300/90 hover:border-amber-400 text-slate-900'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-100/80 border border-amber-300/60 flex items-center justify-center text-amber-700 shrink-0">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <span className="truncate">{obtenirLibelleActif()}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-amber-600 shrink-0 transition-transform duration-200 ${ouvert ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover / Menu Déroulant Stylisé Prestige */}
      {ouvert && (
        <div className="absolute top-full left-0 sm:right-0 mt-2 z-50 min-w-[220px] max-w-xs w-full bg-white rounded-2xl p-2 shadow-2xl border-2 border-amber-300 space-y-1 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[10px] font-black text-amber-800 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
            <span>Filtrer par date d'inscription</span>
            <span className="text-slate-400 font-normal">{options.length + 1} option(s)</span>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-amber-300">
            {/* Option "Toutes les dates" */}
            <button
              type="button"
              onClick={() => choisirOption('toutes')}
              className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-2 ${
                valeurActive === 'toutes'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-700 hover:bg-amber-50 hover:text-amber-950'
              }`}
            >
              <span>Toutes les dates ({totalTous})</span>
              {valeurActive === 'toutes' && <Check className="w-4 h-4 text-slate-950 shrink-0" />}
            </button>

            {/* Options des dates spécifiques */}
            {options.map((opt) => {
              const estActive = valeurActive === opt.valeur;

              return (
                <button
                  key={opt.valeur}
                  type="button"
                  onClick={() => choisirOption(opt.valeur)}
                  className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-2 ${
                    estActive
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-700 hover:bg-amber-50 hover:text-amber-950'
                  }`}
                >
                  <span className="truncate">{opt.libelle} ({opt.compte})</span>
                  {estActive && <Check className="w-4 h-4 text-slate-950 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
