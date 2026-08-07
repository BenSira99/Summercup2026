'use client';

import React, { useState } from 'react';
import { User, Sparkles, Trophy, Loader2, ArrowRight, ShieldCheck, Gift, Phone, Mail, CreditCard, CheckSquare, Square } from 'lucide-react';
import { TicketParticipationImage } from './TicketParticipationImage';
import { BoutonTelechargerTicket } from './BoutonTelechargerTicket';

export interface ProprietesFormulaireParticipation {
  nomEvenement: string;
  nomStand: string;
  descriptionLot: string;
  horodatageTirage: string;
  lotsParRang?: string[];
}

export const FormulaireParticipation: React.FC<ProprietesFormulaireParticipation> = ({
  nomEvenement,
  nomStand,
  descriptionLot,
  horodatageTirage,
  lotsParRang = [],
}) => {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [aCompteCih, setACompteCih] = useState(false);

  const [enCoursDeSoumission, setEnCoursDeSoumission] = useState(false);
  const [messageErreur, setMessageErreur] = useState<string | null>(null);

  // Ticket généré après soumission
  const [ticketGenere, setTicketGenere] = useState<any | null>(null);

  // Empêcher la touche Espace sur le champ Nom
  const empecherEspaceSurNom = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
    }
  };

  // Filtrer les caractères non autorisés dans le NOM (lettres, tirets, apostrophes uniquement, AUCUN ESPACE)
  const gererChangementNom = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\s/g, ''); // Retirer tous les espaces
    const valFiltree = val.replace(/[^a-zA-Zà-öø-ÿÀ-ÖØ-ßÇç'-]/g, '');
    setNom(valFiltree);
  };

  // Filtrer les caractères non autorisés dans le PRÉNOM (lettres, espaces, tirets, apostrophes)
  const gererChangementPrenom = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const valFiltree = val.replace(/[^a-zA-Zà-öø-ÿÀ-ÖØ-ßÇç'\s-]/g, '');
    setPrenom(valFiltree);
  };

  // Filtrer le numéro de téléphone (chiffres, espaces et +)
  const gererChangementTelephone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const valFiltree = val.replace(/[^0-9+\s-]/g, '');
    setTelephone(valFiltree);
  };

  // Soumettre le formulaire avec validation complète
  const soumettreFormulaire = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setMessageErreur(null);

    const nomNet = nom.trim();
    const prenomNet = prenom.trim();
    const telNet = telephone.trim();
    const emailNet = email.trim();

    // 1. Validation Nom
    if (!nomNet || nomNet.length < 2) {
      setMessageErreur("Le nom doit contenir au moins 2 lettres.");
      return;
    }
    if (/\s/.test(nomNet)) {
      setMessageErreur("Le nom doit contenir un seul mot sans espace.");
      return;
    }

    // 2. Validation Prénom (chaque mot >= 2 lettres)
    if (!prenomNet) {
      setMessageErreur("Veuillez saisir votre prénom.");
      return;
    }
    const motsPrenom = prenomNet.split(/\s+/).filter(Boolean);
    for (const mot of motsPrenom) {
      if (mot.length < 2) {
        setMessageErreur(`Chaque mot du prénom doit contenir au moins 2 lettres (ex: "${mot}" est trop court).`);
        return;
      }
    }

    // 3. Validation Téléphone (9 chiffres : 6/7 ou 10 chiffres : 06/07)
    if (!telNet) {
      setMessageErreur("Le numéro de téléphone est obligatoire.");
      return;
    }

    const chiffresTel = telNet.replace(/\D/g, '');
    if (chiffresTel.length === 9) {
      if (!/^[67]/.test(chiffresTel)) {
        setMessageErreur("Un numéro à 9 chiffres doit obligatoirement commencer par 6 ou 7.");
        return;
      }
    } else if (chiffresTel.length === 10) {
      if (!/^(06|07)/.test(chiffresTel)) {
        setMessageErreur("Un numéro à 10 chiffres doit obligatoirement commencer par 06 ou 07.");
        return;
      }
    } else {
      setMessageErreur("Le numéro de téléphone doit comporter 9 chiffres (ex: 612345678) ou 10 chiffres (ex: 0612345678).");
      return;
    }

    // 4. Validation Email
    if (!emailNet) {
      setMessageErreur("L'adresse email est obligatoire.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailNet)) {
      setMessageErreur("L'adresse email saisie n'est pas valide.");
      return;
    }

    try {
      setEnCoursDeSoumission(true);

      const reponse = await fetch('/api/participations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: nomNet,
          prenom: prenomNet,
          telephone: telNet,
          email: emailNet,
          aCompteCih: aCompteCih,
        }),
      });

      const donnees = await reponse.json();

      if (!reponse.ok) {
        throw new Error(donnees.erreur || "Une erreur s'est produite lors de votre inscription.");
      }

      setTicketGenere(donnees.ticket);
    } catch (erreur: any) {
      console.error("Erreur de soumission :", erreur);
      setMessageErreur(erreur.message || "Erreur de connexion réseau. Veuillez réessayer.");
    } finally {
      setEnCoursDeSoumission(false);
    }
  };

  // Si le ticket est généré avec succès, afficher la confirmation
  if (ticketGenere) {
    return (
      <div className="w-full max-w-md mx-auto space-y-6 animate-in fade-in zoom-in duration-300 font-sans">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-xs">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Félicitations ! Votre ticket est prêt</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Participation Confirmée</h1>
          <p className="text-sm text-slate-600">
            Téléchargez votre ticket sous forme d'image PNG pour enregistrer votre numéro de tirage.
          </p>
        </div>

        {/* Composant du Ticket Royal */}
        <TicketParticipationImage
          numeroTicket={ticketGenere.numeroTicket}
          nomComplet={ticketGenere.nomCompletParticipant}
          nomEvenement={ticketGenere.nomEvenement || nomEvenement}
          nomStand={ticketGenere.nomStand || nomStand}
          horodatageTirage={ticketGenere.horodatageTirage || horodatageTirage}
        />

        {/* Bouton de téléchargement image PNG */}
        <div className="pt-2 space-y-3">
          <BoutonTelechargerTicket
            idElementCible="ticket-royal-image"
            nomFichier={`ticket-tirage-${ticketGenere.numeroTicket.replace('#', '')}.png`}
          />

          <button
            onClick={() => {
              setTicketGenere(null);
              setNom('');
              setPrenom('');
              setTelephone('');
              setEmail('');
              setACompteCih(false);
            }}
            className="w-full py-3 px-4 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors text-center"
          >
            Inscrire un autre participant
          </button>
        </div>
      </div>
    );
  }

  const listeLotsAfficher = lotsParRang.length > 0 ? lotsParRang : (descriptionLot ? [descriptionLot] : []);

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-200/80 relative overflow-hidden text-slate-900 font-sans">
      {/* Motifs décoratifs dorés */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-amber-200/40 via-yellow-100/20 to-transparent rounded-bl-full pointer-events-none" />

      {/* En-tête du Stand */}
      <div className="text-center space-y-3 mb-6 relative">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-linear-to-r from-amber-500 to-yellow-600 text-white text-xs font-bold shadow-md uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5 text-amber-200" />
          <span>{nomStand}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
          {nomEvenement}
        </h1>

        {/* Détails des Lots à Gagner Configurés */}
        {listeLotsAfficher.length > 0 && (
          <div className="p-4 bg-amber-50/80 border border-amber-200/70 rounded-2xl text-xs text-amber-950 font-medium space-y-2">
            <p className="font-extrabold text-amber-900 flex items-center justify-center gap-1.5 text-sm">
              <Gift className="w-4 h-4 text-amber-600" />
              <span>Cadeaux à Gagner par Tirage</span>
            </p>

            <div className="space-y-1 text-left pt-1">
              {listeLotsAfficher.map((lot, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-amber-200/60 font-bold text-slate-800">
                  <span className="text-amber-800 text-[11px]">
                    {idx === 0 ? "🥇 1er Prix" : idx === 1 ? "🥈 2ème Prix" : idx === 2 ? "🥉 3ème Prix" : `🏅 Prix N°${idx + 1}`} :
                  </span>
                  <span className="text-slate-900">{lot}</span>
                </div>
              ))}
            </div>

            <p className="text-slate-600 text-center pt-1">
              Tirage au sort : <span className="font-bold text-slate-900">{horodatageTirage}</span>
            </p>
          </div>
        )}
      </div>

      {/* Affichage des Erreurs */}
      {messageErreur && (
        <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold shadow-xs">
          {messageErreur}
        </div>
      )}

      {/* Formulaire de participation */}
      <form onSubmit={soumettreFormulaire} className="space-y-4">
        
        {/* Champ Nom (1 seul mot, la touche espace est bloquée) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Nom <span className="text-amber-600">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={nom}
              onKeyDown={empecherEspaceSurNom}
              onChange={gererChangementNom}
              placeholder="Ex: Dupont"
              className="w-full pl-9 pr-3 py-3 text-sm rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all bg-slate-50/50 font-medium text-slate-900 placeholder:text-slate-400 outline-none"
            />
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          </div>
          <span className="text-[10px] text-amber-700 pl-1 font-bold">Un seul mot sans aucun espace (min. 2 lettres)</span>
        </div>

        {/* Champ Prénom */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Prénom <span className="text-amber-600">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={prenom}
              onChange={gererChangementPrenom}
              placeholder="Ex: Jean-Luc"
              className="w-full pl-9 pr-3 py-3 text-sm rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all bg-slate-50/50 font-medium text-slate-900 placeholder:text-slate-400 outline-none"
            />
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          </div>
          <span className="text-[10px] text-slate-400 pl-1 font-medium">Chaque mot doit faire au moins 2 lettres</span>
        </div>

        {/* Champ Téléphone */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Numéro de Téléphone <span className="text-amber-600">*</span>
          </label>
          <div className="relative">
            <input
              type="tel"
              required
              value={telephone}
              onChange={gererChangementTelephone}
              placeholder="Ex: 0612345678 ou 612345678"
              className="w-full pl-9 pr-3 py-3 text-sm rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all bg-slate-50/50 font-medium text-slate-900 placeholder:text-slate-400 outline-none"
            />
            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          </div>
          <span className="text-[10px] text-slate-500 pl-1 font-medium">
            9 ch. (commençant par 6 ou 7) ou 10 ch. (commençant par 06 ou 07)
          </span>
        </div>

        {/* Champ Adresse Email */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Adresse Email <span className="text-amber-600">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: participant@exemple.com"
              className="w-full pl-9 pr-3 py-3 text-sm rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all bg-slate-50/50 font-medium text-slate-900 placeholder:text-slate-400 outline-none"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          </div>
        </div>

        {/* Case à cocher Compte CIH (Booléenne, par défaut false) */}
        <div
          onClick={() => setACompteCih(!aCompteCih)}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between gap-3 ${
            aCompteCih
              ? 'bg-amber-50/90 border-amber-400 shadow-xs'
              : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              aCompteCih ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-900 leading-snug">
                Possédez-vous un compte CIH Bank ?
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                {aCompteCih ? "Oui, je suis client CIH Bank" : "Non, pas encore de compte CIH"}
              </p>
            </div>
          </div>

          <div className="shrink-0 text-amber-600">
            {aCompteCih ? (
              <CheckSquare className="w-5 h-5 text-amber-600" />
            ) : (
              <Square className="w-5 h-5 text-slate-300" />
            )}
          </div>
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={enCoursDeSoumission}
          className="w-full py-4 px-6 rounded-2xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-slate-800 hover:to-indigo-900 text-white font-extrabold text-sm shadow-xl shadow-slate-900/25 border border-amber-400/40 transition-all transform active:scale-95 flex items-center justify-center gap-2 mt-4"
        >
          {enCoursDeSoumission ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
              <span>Validation de votre ticket...</span>
            </>
          ) : (
            <>
              <span>Obtenir mon Ticket de Tirage</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </>
          )}
        </button>
      </form>

      {/* Pied de carte */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Participation instantanée & Données sécurisées</span>
      </div>
    </div>
  );
};
