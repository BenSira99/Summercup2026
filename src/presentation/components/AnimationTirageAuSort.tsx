'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, RefreshCw, Users, Award, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ParticipantTirage {
  id: string;
  nomComplet: string;
  numeroTicket: string;
}

interface ProprietesAnimationTirage {
  listeParticipants: ParticipantTirage[];
  nomEvenement?: string;
  descriptionLot?: string;
  onTirerGagnantServeur?: () => Promise<ParticipantTirage>;
}

export const AnimationTirageAuSort: React.FC<ProprietesAnimationTirage> = ({
  listeParticipants,
  nomEvenement = "Grand Tirage au Sort Royal",
  descriptionLot = "Un iPad Pro avec ses accessoires de luxe",
  onTirerGagnantServeur,
}) => {
  const [enCoursDeTirage, setEnCoursDeTirage] = useState(false);
  const [participantEnDefilement, setParticipantEnDefilement] = useState<string>("Prêt pour le tirage...");
  const [gagnantOfficiel, setGagnantOfficiel] = useState<ParticipantTirage | null>(null);

  const declencherConfettisRoyaux = () => {
    // Effet d'explosion de confettis dorés et bleus royaux
    const duree = 4 * 1000;
    const finAnimation = Date.now() + duree;

    const intervalle: any = setInterval(() => {
      const tempsRestant = finAnimation - Date.now();
      if (tempsRestant <= 0) {
        return clearInterval(intervalle);
      }

      confetti({
        particleCount: 50,
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#f59e0b', '#d97706', '#fbbf24', '#1e1b4b', '#ffffff'],
      });
    }, 250);
  };

  const lancerTirageAuSort = async () => {
    if (listeParticipants.length === 0) {
      alert("Aucun participant inscrit pour effectuer un tirage au sort.");
      return;
    }

    setEnCoursDeTirage(true);
    setGagnantOfficiel(null);

    // Récupérer le gagnant (via l'API serveur ou la liste fournie)
    let gagnantFinal: ParticipantTirage;
    try {
      if (onTirerGagnantServeur) {
        gagnantFinal = await onTirerGagnantServeur();
      } else {
        const index = Math.floor(Math.random() * listeParticipants.length);
        gagnantFinal = listeParticipants[index];
      }
    } catch (e) {
      const index = Math.floor(Math.random() * listeParticipants.length);
      gagnantFinal = listeParticipants[index];
    }

    // Animation du défilement des noms (Roulette / Machine à sous)
    let vitesse = 50; // ms
    let compteTours = 0;
    const maxTours = 40;

    const faireDefiler = () => {
      compteTours++;
      const participantAleatoire = listeParticipants[Math.floor(Math.random() * listeParticipants.length)];
      setParticipantEnDefilement(`${participantAleatoire.nomComplet} (${participantAleatoire.numeroTicket})`);

      if (compteTours < maxTours) {
        vitesse += 10; // Ralentissement progressif
        setTimeout(faireDefiler, vitesse);
      } else {
        // Fin de l'animation -> Affichage du vrai Gagnant
        setGagnantOfficiel(gagnantFinal);
        setEnCoursDeTirage(false);
        declencherConfettisRoyaux();
      }
    };

    faireDefiler();
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-linear-to-b from-white via-slate-50 to-amber-50/40 rounded-3xl p-8 sm:p-12 shadow-2xl border-4 border-amber-300/80 text-center relative overflow-hidden font-sans">
      {/* Motifs d'arrière-plan majesteux */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* En-tête événementiel */}
      <div className="space-y-4 mb-8 relative">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-linear-to-r from-amber-500 via-amber-600 to-yellow-600 text-white font-black text-xs uppercase tracking-widest shadow-lg">
          <Trophy className="w-4 h-4 text-amber-200" />
          <span>Grande Cérémonie du Tirage au Sort</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none">
          {nomEvenement}
        </h1>
        <p className="text-base text-slate-600 max-w-lg mx-auto font-medium">
          Dotation du jour : <span className="font-extrabold text-amber-800">{descriptionLot}</span>
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-900 text-amber-300 text-xs font-bold shadow-sm">
          <Users className="w-4 h-4 text-amber-400" />
          <span>{listeParticipants.length} Participants Enregistrés</span>
        </div>
      </div>

      {/* Zone centrale d'animation / Roulette */}
      <div className="my-8 py-10 px-6 bg-linear-to-r from-slate-950 via-indigo-950 to-slate-950 rounded-3xl shadow-2xl border-2 border-amber-400/50 relative overflow-hidden min-h-56 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {gagnantOfficiel ? (
            <motion.div
              key="gagnant"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 12 }}
              className="space-y-4 relative z-10"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest shadow-md animate-bounce">
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Heureux Gagnant</span>
              </div>
              <h2 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-linear-to-r from-amber-200 via-amber-400 to-yellow-300 tracking-tight">
                {gagnantOfficiel.nomComplet}
              </h2>
              <div className="inline-block px-6 py-2 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-200 font-mono text-2xl font-black tracking-widest shadow-inner">
                {gagnantOfficiel.numeroTicket}
              </div>
            </motion.div>
          ) : (
            <motion.div key="defilement" className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/80">
                {enCoursDeTirage ? "Tirage en cours..." : "Le tirage va commencer"}
              </p>
              <div className="text-2xl sm:text-4xl font-extrabold text-white font-mono tracking-wider">
                {participantEnDefilement}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bouton d'action du Tirage */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          onClick={lancerTirageAuSort}
          disabled={enCoursDeTirage}
          className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-linear-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-black text-lg shadow-xl shadow-amber-500/30 border border-amber-300/50 transition-all transform active:scale-95 flex items-center justify-center gap-3"
        >
          {enCoursDeTirage ? (
            <>
              <RefreshCw className="w-6 h-6 animate-spin text-amber-200" />
              <span>Sélection Aléatoire en cours...</span>
            </>
          ) : (
            <>
              <Play className="w-6 h-6 fill-amber-200 text-amber-200" />
              <span>{gagnantOfficiel ? "Remettre en Jeu & Relancer" : "Lancer le Tirage au Sort Royal"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
