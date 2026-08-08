'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Dices, Eye, Sparkles, CheckCircle2, Lock, Unlock, Gift, Award, Crown, RefreshCw, Medal, AlertTriangle, Users, Minus, Plus, Calendar } from 'lucide-react';
import canvasConfetti from 'canvas-confetti';
import { toast } from 'sonner';

export interface GagnantTirageSuspense {
  id: string;
  rang: number;
  nomComplet: string;
  nom: string;
  prenom: string;
  numeroTicket: string;
  dateInscription: string;
}

export const TirageAuSortAdminSuspense: React.FC = () => {
  const [nombreGagnants, setNombreGagnants] = useState<number>(1);
  const [totalParticipants, setTotalParticipants] = useState<number>(0);
  const [totalParticipantsJour, setTotalParticipantsJour] = useState<number>(0);
  const [lotsParRang, setLotsParRang] = useState<string[]>([]);
  const [chargement, setChargement] = useState<boolean>(false);
  const [gagnants, setGagnants] = useState<GagnantTirageSuspense[]>([]);
  const [masques, setMasques] = useState<Record<string, boolean>>({});
  const [erreur, setErreur] = useState<string | null>(null);

  // Charger le nombre total de participants inscrits et filtrer par inscrits du jour même
  const chargerDonneesInitiales = async () => {
    try {
      const [repPart, repConfig] = await Promise.all([
        fetch('/api/participations'),
        fetch('/api/admin')
      ]);

      if (repPart.ok) {
        const dataP = await repPart.json();
        const liste = dataP.participants || [];
        setTotalParticipants(dataP.total || liste.length);

        const aujourdhui = new Date();
        const duJour = liste.filter((p: any) => {
          const d = new Date(p.dateInscription);
          return (
            d.getFullYear() === aujourdhui.getFullYear() &&
            d.getMonth() === aujourdhui.getMonth() &&
            d.getDate() === aujourdhui.getDate()
          );
        });
        setTotalParticipantsJour(duJour.length);
      }

      if (repConfig.ok) {
        const dataC = await repConfig.json();
        if (dataC.configuration) {
          const cfg = dataC.configuration;
          if (cfg.nombreGagnantsPrevu) {
            setNombreGagnants(cfg.nombreGagnantsPrevu);
          }
          if (cfg.lotsParRang && Array.isArray(cfg.lotsParRang)) {
            setLotsParRang(cfg.lotsParRang);
          }
        }
      }
    } catch (e) {
      console.error("Erreur chargement données:", e);
    }
  };

  useEffect(() => {
    chargerDonneesInitiales();
  }, []);

  // Validation du nombre de gagnants restreint aux inscrits du jour avec notification Toast
  const validerEtChangerNombreGagnants = (nouvelleValeur: number) => {
    if (isNaN(nouvelleValeur) || nouvelleValeur < 1) {
      setNombreGagnants(1);
      toast.warning("Le nombre de gagnants minimum est de 1.");
      return;
    }

    if (totalParticipantsJour > 0 && nouvelleValeur > totalParticipantsJour) {
      toast.error(`Sélection invalide : vous demandez ${nouvelleValeur} gagnant(s) alors qu'il n'y a que ${totalParticipantsJour} inscrit(s) aujourd'hui.`, {
        duration: 4000,
      });
      setNombreGagnants(totalParticipantsJour);
      return;
    }

    setNombreGagnants(nouvelleValeur);
  };

  // Déclencher le tirage au sort (Brassage des inscrits du jour même)
  const lancerTirage = async () => {
    if (totalParticipantsJour === 0) {
      toast.error("Impossible de lancer le tirage : aucun inscrit enregistré aujourd'hui.");
      return;
    }

    if (nombreGagnants > totalParticipantsJour) {
      toast.error(`Erreur de validation : ${nombreGagnants} gagnants demandés mais seulement ${totalParticipantsJour} inscrit(s) aujourd'hui.`, {
        duration: 5000,
      });
      return;
    }

    try {
      setChargement(true);
      setErreur(null);
      setGagnants([]);

      const rep = await fetch('/api/tirage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreGagnants }),
      });

      const data = await rep.json();

      if (!rep.ok || !data.succes) {
        const msg = data.erreur || "Erreur lors du tirage au sort.";
        setErreur(msg);
        toast.error(msg);
        return;
      }

      const liste = data.gagnants || (data.gagnant ? [{ ...data.gagnant, rang: 1 }] : []);
      setGagnants(liste);

      // Par défaut : Tous les gagnants tirés sont MASQUÉS (true = masqué)
      const masquesInit: Record<string, boolean> = {};
      liste.forEach((g: GagnantTirageSuspense) => {
        masquesInit[g.id] = true;
      });
      setMasques(masquesInit);

      toast.success(`Tirage réussi ! ${liste.length} gagnant(s) sélectionné(s) parmi les inscrits du jour. Cliquez sur les cartes pour révéler !`);

      // Mettre à jour les stats
      chargerDonneesInitiales();
    } catch (e: any) {
      const msg = e.message || "Erreur de connexion.";
      setErreur(msg);
      toast.error(msg);
    } finally {
      setChargement(false);
    }
  };

  // Basculer la révélation d'un gagnant spécifique
  const revelerGagnant = (id: string) => {
    if (!masques[id]) return; // Déjà révélé

    setMasques((prev) => ({
      ...prev,
      [id]: false,
    }));

    try {
      canvasConfetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#0f172a', '#ffffff'],
      });
    } catch (e) {}
  };

  // Tout dévoiler en un clic
  const toutReveler = () => {
    const tousDevelopped: Record<string, boolean> = {};
    gagnants.forEach((g) => {
      tousDevelopped[g.id] = false;
    });
    setMasques(tousDevelopped);

    try {
      canvasConfetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
      });
    } catch (e) {}
  };

  // Obtenir le badge de classement avec Icônes Lucide uniquement
  const obtenirBadgeRang = (rang: number) => {
    switch (rang) {
      case 1:
        return {
          label: '1er Prix (Grand Gagnant)',
          icon: Crown,
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
        };
      case 2:
        return {
          label: '2ème Prix',
          icon: Medal,
          bg: 'bg-slate-200 text-slate-900 border-slate-300',
        };
      case 3:
        return {
          label: '3ème Prix',
          icon: Award,
          bg: 'bg-amber-900/10 text-amber-800 border-amber-700/30',
        };
      default:
        return {
          label: `Rang N°${rang}`,
          icon: Trophy,
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  // Obtenir la description du lot attribué à ce rang
  const obtenirLotDuRang = (rang: number) => {
    const idx = rang - 1;
    if (lotsParRang && lotsParRang[idx]) {
      return lotsParRang[idx];
    }
    return "Cadeau Surprise Prestige";
  };

  const nombreDeMasquesRestants = Object.values(masques).filter(Boolean).length;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 font-sans">
      {/* Panneau de Contrôle du Tirage */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center font-black text-xl shadow-md border border-amber-300">
              <Dices className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Tirage au Sort du Jour</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black border border-amber-200">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>{totalParticipantsJour} inscrit(s) aujourd'hui</span>
                </span>
                <span className="text-xs text-slate-400 font-medium">({totalParticipants} au total)</span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Seuls les participants inscrits aujourd'hui sont éligibles pour ce tirage.
              </p>
            </div>
          </div>

          {/* Saisie Libre & Sélecteur Rapide avec Validation & Toast Sonner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider pl-1">Gagnants à tirer :</span>
            
            {/* Champ de Saisie Numérique Libre avec Boutons - et + */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => validerEtChangerNombreGagnants(nombreGagnants - 1)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs transition-all"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <input
                type="number"
                min={1}
                max={totalParticipantsJour || 1}
                value={nombreGagnants}
                onChange={(e) => validerEtChangerNombreGagnants(parseInt(e.target.value, 10))}
                className="w-12 text-center text-sm font-black text-slate-900 outline-none"
              />

              <button
                type="button"
                onClick={() => validerEtChangerNombreGagnants(nombreGagnants + 1)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Raccourcis Rapides 1, 3, 5 */}
            <div className="flex items-center gap-1">
              {[1, 3, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => validerEtChangerNombreGagnants(num)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    nombreGagnants === num
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bouton d'action principal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={lancerTirage}
            disabled={chargement || totalParticipantsJour === 0}
            className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-linear-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-extrabold text-sm shadow-xl shadow-amber-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-2 border border-amber-300/40 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {chargement ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-white" />
                <span>Tirage du Jour en Cours...</span>
              </>
            ) : (
              <>
                <Dices className="w-5 h-5 text-amber-100" />
                <span>Lancer le Tirage du Jour ({nombreGagnants} Gagnant{nombreGagnants > 1 ? 's' : ''})</span>
              </>
            )}
          </button>

          {gagnants.length > 0 && nombreDeMasquesRestants > 0 && (
            <button
              onClick={toutReveler}
              className="py-3 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-xs shadow-md transition-all flex items-center gap-2 border border-slate-700"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Tout Dévoiler ({nombreDeMasquesRestants} restant{nombreDeMasquesRestants > 1 ? 's' : ''})</span>
            </button>
          )}
        </div>

        {/* Bannières d'erreur / Information */}
        {erreur && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{erreur}</span>
          </div>
        )}
      </div>

      {/* Cartes de Gagnants avec Effet de Révélation et Suspense */}
      {gagnants.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Résultats du Tirage du Jour ({gagnants.length})</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Cliquez sur chaque carte pour lever le suspense</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gagnants.map((g) => {
              const estMasque = masques[g.id];
              const badge = obtenirBadgeRang(g.rang);
              const IconBadge = badge.icon;
              const lotAttr = obtenirLotDuRang(g.rang);

              return (
                <div
                  key={g.id}
                  onClick={() => revelerGagnant(g.id)}
                  className={`rounded-3xl p-6 border-2 transition-all cursor-pointer relative overflow-hidden select-none shadow-md ${
                    estMasque
                      ? 'bg-slate-950 border-amber-400/80 hover:border-amber-400 text-white'
                      : 'bg-white border-amber-300 text-slate-900'
                  }`}
                >
                  {/* Badge de Rang (1er, 2ème, 3ème...) */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${badge.bg}`}>
                      <IconBadge className="w-3.5 h-3.5" />
                      <span>{badge.label}</span>
                    </div>

                    <div className="text-xs font-mono font-bold text-amber-500 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                      Ticket : {g.numeroTicket}
                    </div>
                  </div>

                  {/* Zone de Révélation / Masquage avec Suspense */}
                  {estMasque ? (
                    <div className="py-8 text-center space-y-3">
                      <div className="w-14 h-14 bg-amber-500/10 rounded-2xl border border-amber-400/30 flex items-center justify-center mx-auto text-amber-400 animate-pulse">
                        <Lock className="w-7 h-7 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-base font-black text-amber-300 uppercase tracking-wider">Identité Masquée</p>
                        <p className="text-xs text-slate-400 font-medium">Cliquez pour révéler le gagnant du {badge.label}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200/80 text-center">
                        <span className="text-amber-800 font-extrabold text-xs uppercase tracking-wider block mb-0.5">Grand Gagnant</span>
                        <span className="text-2xl font-black text-slate-950 block tracking-tight">{g.nomComplet}</span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-between">
                        <span className="text-slate-500">Cadeau Attribué :</span>
                        <span className="font-extrabold text-amber-900">{lotAttr}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Inscrit le : {new Date(g.dateInscription).toLocaleDateString('fr-FR')}</span>
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Identité Révélée</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
