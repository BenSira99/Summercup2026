'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock as ClockIcon, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface ProprietesSelecteurDateHeure {
  date: string;
  heure: string;
  surChangementDate: (nouvelleDate: string) => void;
  surChangementHeure: (nouvelleHeure: string) => void;
}

const NOMS_MOIS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const JOURS_SEMAINE = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

// Heures de 00 à 23
const LISTE_HEURES = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
// Minutes de 00 à 59 (ou par pas de 5 pour une meilleure ergometrie, avec option 00, 05, 10... 55 ou tous)
const LISTE_MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

export const SelecteurDateHeure: React.FC<ProprietesSelecteurDateHeure> = ({
  date,
  heure,
  surChangementDate,
  surChangementHeure,
}) => {
  const [popoverCalendrierOuvert, setPopoverCalendrierOuvert] = useState(false);
  const [popoverHeureOuvert, setPopoverHeureOuvert] = useState(false);

  // Date actuelle du calendrier
  const aujourdhui = new Date();
  const [anneeCal, setAnneeCal] = useState(aujourdhui.getFullYear());
  const [moisCal, setMoisCal] = useState(aujourdhui.getMonth());
  const [jourSelectionne, setJourSelectionne] = useState<number | null>(aujourdhui.getDate());

  // Extrait de l'heure et minute actuelles depuis la chaîne '17h00' ou '17:00'
  const extraireHeureEtMinute = (val: string) => {
    if (!val) return { h: '17', m: '00' };
    const propre = val.replace('h', ':');
    const parts = propre.split(':');
    const h = parts[0] ? parts[0].padStart(2, '0') : '17';
    const m = parts[1] ? parts[1].padStart(2, '0') : '00';
    return { h, m };
  };

  const { h: heureActive, m: minuteActive } = extraireHeureEtMinute(heure);

  const refCalendrier = useRef<HTMLDivElement>(null);
  const refHeure = useRef<HTMLDivElement>(null);

  // Fermeture au clic extérieur
  useEffect(() => {
    const toutFermer = (e: MouseEvent) => {
      if (refCalendrier.current && !refCalendrier.current.contains(e.target as Node)) {
        setPopoverCalendrierOuvert(false);
      }
      if (refHeure.current && !refHeure.current.contains(e.target as Node)) {
        setPopoverHeureOuvert(false);
      }
    };
    document.addEventListener('mousedown', toutFermer);
    return () => document.removeEventListener('mousedown', toutFermer);
  }, []);

  // Obtenir le nombre de jours dans un mois
  const obtenirJoursDansMois = (annee: number, mois: number) => {
    return new Date(annee, mois + 1, 0).getDate();
  };

  // Obtenir le 1er jour de la semaine (0 = Lundi, 6 = Dimanche)
  const obtenirPremierJourSemaine = (annee: number, mois: number) => {
    const day = new Date(annee, mois, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const moisPrecedent = () => {
    if (moisCal === 0) {
      setMoisCal(11);
      setAnneeCal(anneeCal - 1);
    } else {
      setMoisCal(moisCal - 1);
    }
  };

  const moisSuivant = () => {
    if (moisCal === 11) {
      setMoisCal(0);
      setAnneeCal(anneeCal + 1);
    } else {
      setMoisCal(moisCal + 1);
    }
  };

  const choisirJour = (j: number) => {
    setJourSelectionne(j);
    const mStr = NOMS_MOIS[moisCal];
    const dateFormatted = `${String(j).padStart(2, '0')} ${mStr} ${anneeCal}`;
    surChangementDate(dateFormatted);
    setPopoverCalendrierOuvert(false);
  };

  // Changer l'heure (colonne heures)
  const choisirHeureUnAUn = (h: string) => {
    surChangementHeure(`${h}h${minuteActive}`);
  };

  // Changer la minute (colonne minutes)
  const choisirMinuteUnAUn = (m: string) => {
    surChangementHeure(`${heureActive}h${m}`);
  };

  const totalJours = obtenirJoursDansMois(anneeCal, moisCal);
  const decalageDebut = obtenirPremierJourSemaine(anneeCal, moisCal);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans relative">
      {/* SÉLECTEUR DE DATE SUR-MESURE THÈME ROYAL & SUPABASE */}
      <div ref={refCalendrier} className="relative">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-amber-600" />
          <span>Date du Tirage au Sort</span>
        </label>

        {/* Déclencheur du DatePicker Custom */}
        <button
          type="button"
          onClick={() => {
            setPopoverCalendrierOuvert(!popoverCalendrierOuvert);
            setPopoverHeureOuvert(false);
          }}
          className={`w-full text-left pl-10 pr-4 py-3 text-sm rounded-2xl border transition-all flex items-center justify-between shadow-2xs font-bold ${
            popoverCalendrierOuvert
              ? 'bg-amber-50/50 border-amber-500 ring-2 ring-amber-200 text-slate-900'
              : 'bg-white border-slate-200 text-slate-900 hover:border-amber-400'
          }`}
        >
          <span className="truncate">{date || "Sélectionnez une date"}</span>
          <CalendarIcon className="w-4 h-4 text-amber-600 shrink-0" />
        </button>

        {/* POPOVER CALENDRIER TOTALEMENT STYLISÉ THÈME ROYAL */}
        {popoverCalendrierOuvert && (
          <div className="absolute top-full left-0 mt-2 z-50 w-72 bg-white rounded-3xl p-4 shadow-2xl border-2 border-amber-300 space-y-3 animate-in fade-in zoom-in-95 duration-200">
            {/* Header du Calendrier */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <button
                type="button"
                onClick={moisPrecedent}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 flex items-center justify-center transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-black text-slate-900 text-sm tracking-tight">
                {NOMS_MOIS[moisCal]} {anneeCal}
              </span>

              <button
                type="button"
                onClick={moisSuivant}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 flex items-center justify-center transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* En-tête des jours de la semaine */}
            <div className="grid grid-cols-7 text-center gap-1">
              {JOURS_SEMAINE.map((j, idx) => (
                <span key={idx} className="text-[11px] font-black text-amber-700 uppercase">
                  {j}
                </span>
              ))}
            </div>

            {/* Grille des Jours du Mois */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: decalageDebut }).map((_, idx) => (
                <div key={`blank-${idx}`} className="h-8" />
              ))}

              {Array.from({ length: totalJours }).map((_, idx) => {
                const numJour = idx + 1;
                const estAujourdhui =
                  numJour === aujourdhui.getDate() &&
                  moisCal === aujourdhui.getMonth() &&
                  anneeCal === aujourdhui.getFullYear();

                const estSelec = jourSelectionne === numJour;

                return (
                  <button
                    key={numJour}
                    type="button"
                    onClick={() => choisirJour(numJour)}
                    className={`h-8 rounded-xl font-bold text-xs transition-all flex items-center justify-center ${
                      estSelec
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md border border-amber-300 scale-105'
                        : estAujourdhui
                        ? 'bg-amber-100 text-amber-900 font-extrabold border border-amber-300'
                        : 'text-slate-800 hover:bg-amber-50 hover:text-amber-900'
                    }`}
                  >
                    {numJour}
                  </button>
                );
              })}
            </div>

            {/* Pied de Calendrier */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setAnneeCal(aujourdhui.getFullYear());
                  setMoisCal(aujourdhui.getMonth());
                  choisirJour(aujourdhui.getDate());
                }}
                className="text-[11px] font-black text-amber-800 hover:text-amber-900 uppercase tracking-wider"
              >
                Aujourd'hui
              </button>

              <span className="text-[10px] text-slate-400 font-medium">Fermer ×</span>
            </div>
          </div>
        )}
      </div>

      {/* SÉLECTEUR D'HEURE DEUX COLONNES DÉROULANTES (HEURES | MINUTES) AU STYLE ROYAL */}
      <div ref={refHeure} className="relative">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <ClockIcon className="w-3.5 h-3.5 text-amber-600" />
          <span>Heure du Tirage au Sort</span>
        </label>

        {/* Déclencheur du TimePicker Custom 2 Colonnes */}
        <button
          type="button"
          onClick={() => {
            setPopoverHeureOuvert(!popoverHeureOuvert);
            setPopoverCalendrierOuvert(false);
          }}
          className={`w-full text-left pl-10 pr-4 py-3 text-sm rounded-2xl border transition-all flex items-center justify-between shadow-2xs font-bold ${
            popoverHeureOuvert
              ? 'bg-amber-50/50 border-amber-500 ring-2 ring-amber-200 text-slate-900'
              : 'bg-white border-slate-200 text-slate-900 hover:border-amber-400'
          }`}
        >
          <span className="truncate font-black">{heureActive}h{minuteActive}</span>
          <ClockIcon className="w-4 h-4 text-amber-600 shrink-0" />
        </button>

        {/* POPOVER HEURE 2 COLONNES THÈME ROYAL (HEURES | MINUTES) */}
        {popoverHeureOuvert && (
          <div className="absolute top-full left-0 mt-2 z-50 w-64 bg-white rounded-3xl p-4 shadow-2xl border-2 border-amber-300 space-y-3 animate-in fade-in zoom-in-95 duration-200">
            {/* Titre & En-tête des 2 colonnes */}
            <div className="grid grid-cols-2 text-center pb-2 border-b border-slate-100 font-black text-xs uppercase tracking-wider text-amber-800">
              <span>Heures</span>
              <span>Minutes</span>
            </div>

            {/* Grille des 2 Colonnes avec Défilement Indépendant */}
            <div className="grid grid-cols-2 gap-2 h-48">
              {/* Colonne 1 : HEURES (00..23) */}
              <div className="overflow-y-auto pr-1 space-y-1 scrollbar-thin scrollbar-thumb-amber-300">
                {LISTE_HEURES.map((h) => {
                  const estActive = h === heureActive;
                  return (
                    <button
                      key={`h-${h}`}
                      type="button"
                      onClick={() => choisirHeureUnAUn(h)}
                      className={`w-full py-2 rounded-xl text-xs font-black transition-all text-center border ${
                        estActive
                          ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md scale-105'
                          : 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-amber-100 hover:text-amber-900'
                      }`}
                    >
                      {h} h
                    </button>
                  );
                })}
              </div>

              {/* Colonne 2 : MINUTES (00..59) */}
              <div className="overflow-y-auto pr-1 space-y-1 scrollbar-thin scrollbar-thumb-amber-300">
                {LISTE_MINUTES.map((m) => {
                  const estActive = m === minuteActive;
                  return (
                    <button
                      key={`m-${m}`}
                      type="button"
                      onClick={() => choisirMinuteUnAUn(m)}
                      className={`w-full py-2 rounded-xl text-xs font-black transition-all text-center border ${
                        estActive
                          ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md scale-105'
                          : 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-amber-100 hover:text-amber-900'
                      }`}
                    >
                      {m} min
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pied du Sélecteur : Valider / Fermer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-700 font-mono">
                {heureActive}h{minuteActive}
              </span>

              <button
                type="button"
                onClick={() => setPopoverHeureOuvert(false)}
                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-extrabold shadow-xs"
              >
                Terminé
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
