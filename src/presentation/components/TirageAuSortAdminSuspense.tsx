'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Dices, Eye, Sparkles, CheckCircle2, Lock, Unlock, Gift, Award, Crown, RefreshCw, Medal, AlertTriangle, Users, Minus, Plus } from 'lucide-react';
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
  const [lotsParRang, setLotsParRang] = useState<string[]>([]);
  const [chargement, setChargement] = useState<boolean>(false);
  const [gagnants, setGagnants] = useState<GagnantTirageSuspense[]>([]);
  const [masques, setMasques] = useState<Record<string, boolean>>({});
  const [erreur, setErreur] = useState<string | null>(null);

  // Charger le nombre total de participants inscrits et la config des lots
  const chargerDonneesInitiales = async () => {
    try {
      const [repPart, repConfig] = await Promise.all([
        fetch('/api/participations'),
        fetch('/api/admin')
      ]);

      if (repPart.ok) {
        const dataP = await repPart.json();
        const total = dataP.total || (dataP.participants ? dataP.participants.length : 0);
        setTotalParticipants(total);
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

  // Validation du nombre de gagnants avec notification Sonner Toast
  const validerEtChangerNombreGagnants = (nouvelleValeur: number) => {
    if (isNaN(nouvelleValeur) || nouvelleValeur < 1) {
      setNombreGagnants(1);
      toast.warning("Le nombre de gagnants minimum est de 1.");
      return;
    }

    if (totalParticipants > 0 && nouvelleValeur > totalParticipants) {
      toast.error(`Sélection invalide : vous demandez ${nouvelleValeur} gagnant(s) alors qu'il n'y a que ${totalParticipants} inscrit(s) au total.`, {
        duration: 4000,
      });
      setNombreGagnants(totalParticipants);
      return;
    }

    setNombreGagnants(nouvelleValeur);
  };

  // Déclencher le tirage au sort (Brassage de 100% des inscrits)
  const lancerTirage = async () => {
    if (totalParticipants === 0) {
      toast.error("Impossible de lancer le tirage : aucun inscrit enregistré.");
      return;
    }

    if (nombreGagnants > totalParticipants) {
      toast.error(`Erreur de validation : ${nombreGagnants} gagnants demandés mais seulement ${totalParticipants} participant(s) inscrit(s).`, {
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

      toast.success(`Tirage réussi ! ${liste.length} gagnant(s) sélectionné(s) par classement. Cliquez sur les cartes pour révéler !`);

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
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Tirage au Sort</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  <span>{totalParticipants} inscrit(s)</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Saisissez le nombre de gagnants et révélez-les un par un !</p>
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
                max={totalParticipants || 1}
                value={nombreGagnants}
                onChange={(e) => validerEtChangerNombreGagnants(parseInt(e.target.value, 10))}
                className="w-12 text-center text-sm font-black text-slate-900 outline-none bg-transparent"
              />

              <button
                type="button"
                onClick={() => validerEtChangerNombreGagnants(nombreGagnants + 1)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Boutons Raccourcis Rapides (1, 2, 3, 5, 10) */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 5, 10].map((num) => {
                const estDesactive = totalParticipants > 0 && num > totalParticipants;
                const estActif = nombreGagnants === num;

                return (
                  <button
                    key={num}
                    type="button"
                    disabled={estDesactive || totalParticipants === 0}
                    onClick={() => validerEtChangerNombreGagnants(num)}
                    className={`w-8 h-8 rounded-lg font-black text-xs transition-all ${
                      estActif && !estDesactive
                        ? 'bg-amber-500 text-slate-950 shadow-md border border-amber-300 scale-105'
                        : estDesactive || totalParticipants === 0
                        ? 'bg-slate-200/50 text-slate-400 border border-slate-200 cursor-not-allowed opacity-40'
                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bouton de Lancement du Tirage */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={lancerTirage}
            disabled={chargement || totalParticipants === 0}
            className={`w-full sm:w-auto flex-1 py-4 px-8 rounded-2xl font-black text-sm shadow-xl transition-all flex items-center justify-center gap-3 border ${
              totalParticipants === 0
                ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed shadow-none'
                : 'bg-linear-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white shadow-amber-500/20 border-amber-300/40'
            }`}
          >
            {chargement ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-amber-100" />
                <span>TIRAGE ALÉATOIRE EN COURS...</span>
              </>
            ) : totalParticipants === 0 ? (
              <>
                <Users className="w-5 h-5 text-slate-400" />
                <span>AUCUN INSCRIT POUR LE TIRAGE</span>
              </>
            ) : (
              <>
                <Dices className="w-5 h-5 text-amber-200" />
                <span>LANCER LE TIRAGE DE {nombreGagnants} GAGNANT(S)</span>
              </>
            )}
          </button>

          {gagnants.length > 0 && nombreDeMasquesRestants > 0 && (
            <button
              onClick={toutReveler}
              className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Tout Dévoiler ({nombreDeMasquesRestants} masqué(s))</span>
            </button>
          )}
        </div>

        {erreur && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{erreur}</span>
          </div>
        )}
      </div>

      {/* Grille des Cartes Gagnants avec Effet de Suspense & Lot Spécifique */}
      {gagnants.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>Gagnants Sélectionnés — Cliquez pour Dévoiler</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">
              {gagnants.length - nombreDeMasquesRestants} / {gagnants.length} Révélé(s)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gagnants.map((g) => {
              const estMasque = masques[g.id];
              const badge = obtenirBadgeRang(g.rang);
              const BadgeIcone = badge.icon;
              const lotGagne = obtenirLotDuRang(g.rang);

              return (
                <div
                  key={g.id}
                  onClick={() => revelerGagnant(g.id)}
                  className={`relative rounded-3xl p-6 transition-all duration-300 cursor-pointer overflow-hidden border-2 shadow-md ${
                    estMasque
                      ? 'bg-slate-900 border-amber-400/50 hover:border-amber-400 hover:scale-[1.02]'
                      : 'bg-white border-amber-300 shadow-xl'
                  }`}
                >
                  {/* Badge de Rang */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border flex items-center gap-1.5 ${badge.bg}`}>
                      <BadgeIcone className="w-3.5 h-3.5" />
                      <span>{badge.label}</span>
                    </span>

                    {estMasque ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span>MASQUÉ</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>RÉVÉLÉ</span>
                      </span>
                    )}
                  </div>

                  {/* Vue Masquée */}
                  {estMasque ? (
                    <div className="py-6 text-center space-y-3">
                      <div className="w-14 h-14 bg-amber-500/10 rounded-2xl border border-amber-400/30 flex items-center justify-center mx-auto text-amber-400 animate-pulse">
                        <Gift className="w-7 h-7 text-amber-300" />
                      </div>
                      <div>
                        <p className="text-xs text-amber-300 font-bold uppercase tracking-wider mb-1">
                          À Gagner : {lotGagne}
                        </p>
                        <p className="text-base font-black text-white tracking-wide">
                          ??? ??????
                        </p>
                        <p className="text-xs text-amber-300/80 font-mono mt-1 font-bold">
                          #ROYAL-XXXXX
                        </p>
                      </div>
                      <div className="pt-2">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/20">
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Cliquez pour Révéler</span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Vue Révélée */
                    <div className="py-2 space-y-3 animate-in fade-in zoom-in-95 duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-800 font-black text-lg border border-amber-200">
                          <Crown className="w-6 h-6 text-amber-700" />
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-slate-900 leading-tight">
                            {g.prenom} {g.nom}
                          </h4>
                          <p className="text-xs font-mono font-black text-amber-700 mt-0.5">
                            Ticket : {g.numeroTicket}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs font-extrabold text-amber-900 flex items-center gap-2">
                        <Gift className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Lot Remporté : {lotGagne}</span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span>Inscrit le {new Date(g.dateInscription).toLocaleDateString('fr-FR')}</span>
                        <span className="font-bold text-amber-800">Sélectionné par tirage</span>
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
