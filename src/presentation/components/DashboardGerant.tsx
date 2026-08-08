'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Users, Download, Trophy, QrCode, Search, RefreshCw, Calendar, Clock, Check, Save, ShieldCheck, Lock, Dices, Gift, FileText, Loader2, Phone, Mail, Trash2, AlertTriangle, X, Key, Eye, EyeOff, LogOut } from 'lucide-react';
import { AfficheQrCodeImprimable } from './AfficheQrCodeImprimable';
import { TirageAuSortAdminSuspense } from './TirageAuSortAdminSuspense';
import { SelecteurDateHeure } from './SelecteurDateHeure';
import { ServiceExportPdfParticipants } from '@/infrastructure/services/ServiceExportPdfParticipants';
import { toast } from 'sonner';

export interface ParticipantAdmin {
  id: string;
  nom: string;
  prenom: string;
  telephone?: string;
  email?: string;
  numeroTicket: string;
  dateInscription: string;
  estGagnant: boolean;
  aCompteCih?: boolean;
}

export interface ConfigurationAdmin {
  nomEvenement: string;
  nomStand: string;
  descriptionLot: string;
  dateTirage: string;
  heureTirage: string;
  urlSiteClient: string;
  nombreGagnantsPrevu: number;
  lotsParRang: string[];
}

export const DashboardGerant: React.FC = () => {
  const [participants, setParticipants] = useState<ParticipantAdmin[]>([]);
  const [configuration, setConfiguration] = useState<ConfigurationAdmin>({
    nomEvenement: 'Grand Tirage au Sort Royal',
    nomStand: 'Stand Prestige',
    descriptionLot: 'Un iPad Pro avec ses accessoires de luxe',
    dateTirage: '2026-08-07',
    heureTirage: '17h00',
    urlSiteClient: typeof window !== 'undefined' ? `${window.location.origin}/participer` : 'http://localhost:3000/participer',
    nombreGagnantsPrevu: 1,
    lotsParRang: ['Un iPad Pro avec ses accessoires de luxe'],
  });

  const [motDePasseSaisi, setMotDePasseSaisi] = useState('');
  const [afficherMotDePasseConnexion, setAfficherMotDePasseConnexion] = useState(false);
  const [estAuthentifie, setEstAuthentifie] = useState(false);
  const [connexionEnCours, setConnexionEnCours] = useState(false);
  const [recherche, setRecherche] = useState('');
  const [filtreDate, setFiltreDate] = useState<string>('toutes');
  const [chargement, setChargement] = useState(false);
  const [exportPdfEnCours, setExportPdfEnCours] = useState(false);
  const [sauvegardeReussie, setSauvegardeReussie] = useState(false);
  const [ongletActif, setOngletActif] = useState<'participants' | 'tirage' | 'configuration' | 'affiche'>('participants');

  // GESTION DU CHANGEMENT DE MOT DE PASSE ADMIN
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmerMotDePasse, setConfirmerMotDePasse] = useState('');
  const [afficherMotDePasseConfig, setAfficherMotDePasseConfig] = useState(false);

  // GESTION DE LA MULTISÉLECTION ET DE LA SUPPRESSION AVEC MODAL
  const [idsSelectionnes, setIdsSelectionnes] = useState<string[]>([]);
  const [modalSuppressionOuvert, setModalSuppressionOuvert] = useState(false);
  const [elementsASupprimer, setElementsASupprimer] = useState<{ id?: string; nomComplet?: string; nombre?: number } | null>(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);

  // Chargement des données
  const chargerDonnees = async () => {
    try {
      setChargement(true);
      const [repPart, repConfig] = await Promise.all([
        fetch('/api/participations'),
        fetch('/api/admin')
      ]);

      // Session expirée ou invalide → retour à l'écran de connexion
      if (repPart.status === 401 || repConfig.status === 401) {
        setEstAuthentifie(false);
        setMotDePasseSaisi('');
        toast.error("Votre session a expiré. Veuillez vous reconnecter.");
        return;
      }

      if (repPart.ok) {
        const dPart = await repPart.json();
        setParticipants(dPart.participants || []);
      }

      if (repConfig.ok) {
        const dConfig = await repConfig.json();
        if (dConfig.configuration) {
          const cfg = dConfig.configuration;
          const numGagnants = cfg.nombreGagnantsPrevu || 1;
          let lots: string[] = cfg.lotsParRang || [];

          if (lots.length < numGagnants) {
            const complement = Array(numGagnants - lots.length).fill(cfg.descriptionLot || 'Cadeau Surprise');
            lots = [...lots, ...complement];
          }

          setConfiguration(prev => ({
            ...prev,
            ...cfg,
            nombreGagnantsPrevu: numGagnants,
            lotsParRang: lots.slice(0, numGagnants),
            urlSiteClient: typeof window !== 'undefined' ? `${window.location.origin}/participer` : 'http://localhost:3000/participer',
          }));
        }
      }
    } catch (e) {
      console.error("Erreur de chargement d'administration:", e);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    if (estAuthentifie) {
      chargerDonnees();
    }
  }, [estAuthentifie]);

  // Multisélection : Cocher / Décocher tout
  const basculerToutSelectionner = () => {
    if (idsSelectionnes.length === participantsFiltres.length) {
      setIdsSelectionnes([]);
    } else {
      setIdsSelectionnes(participantsFiltres.map((p) => p.id));
    }
  };

  // Multisélection : Cocher / Décocher une ligne
  const basculerSelectionUn = (id: string) => {
    setIdsSelectionnes((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Demande de suppression individuelle
  const demanderSuppressionIndividuelle = (p: ParticipantAdmin) => {
    setElementsASupprimer({
      id: p.id,
      nomComplet: `${p.prenom} ${p.nom} (${p.numeroTicket})`,
    });
    setModalSuppressionOuvert(true);
  };

  // Demande de suppression groupée (multisélection)
  const demanderSuppressionGroupes = () => {
    if (idsSelectionnes.length === 0) return;
    setElementsASupprimer({
      nombre: idsSelectionnes.length,
    });
    setModalSuppressionOuvert(true);
  };

  // Confirmer la suppression via API DELETE
  const confirmerSuppression = async () => {
    try {
      setSuppressionEnCours(true);
      let payload = {};

      if (elementsASupprimer?.id) {
        payload = { id: elementsASupprimer.id };
      } else if (idsSelectionnes.length > 0) {
        payload = { ids: idsSelectionnes };
      }

      const rep = await fetch('/api/participations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await rep.json();

      if (rep.status === 401) {
        setEstAuthentifie(false);
        setMotDePasseSaisi('');
        setModalSuppressionOuvert(false);
        setElementsASupprimer(null);
        toast.error("Votre session a expiré. Veuillez vous reconnecter.");
        return;
      }

      if (!rep.ok || !data.succes) {
        toast.error(data.erreur || "Erreur lors de la suppression.");
        return;
      }

      toast.success(data.message || "Suppression effectuée avec succès.");
      setIdsSelectionnes([]);
      setModalSuppressionOuvert(false);
      setElementsASupprimer(null);

      // Rafraîchir les données
      chargerDonnees();
    } catch (e: any) {
      toast.error(e.message || "Erreur de connexion.");
    } finally {
      setSuppressionEnCours(false);
    }
  };

  const changerNombreGagnantsPrevu = (nouveauNombre: number) => {
    const num = Math.max(1, Math.min(20, nouveauNombre));
    const anciensLots = [...configuration.lotsParRang];
    const nouveauxLots: string[] = [];

    for (let i = 0; i < num; i++) {
      nouveauxLots[i] = anciensLots[i] || (i === 0 ? configuration.descriptionLot : `Cadeau Rang N°${i + 1}`);
    }

    setConfiguration({
      ...configuration,
      nombreGagnantsPrevu: num,
      lotsParRang: nouveauxLots,
    });
  };

  const modifierLotPourRang = (index: number, valeur: string) => {
    const copieLots = [...configuration.lotsParRang];
    copieLots[index] = valeur;

    setConfiguration({
      ...configuration,
      descriptionLot: index === 0 ? valeur : configuration.descriptionLot,
      lotsParRang: copieLots,
    });
  };

  // Authentification sécurisée de l'admin via POST /api/admin/login
  const authentifierAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setConnexionEnCours(true);
      const reponse = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motDePasse: motDePasseSaisi }),
      });

      const donnees = await reponse.json();

      if (reponse.ok && donnees.succes) {
        setEstAuthentifie(true);
        toast.success(donnees.message || "Authentification réussie.");
      } else {
        toast.error(donnees.erreur || "Mot de passe incorrect.");
      }
    } catch (e) {
      toast.error("Erreur de connexion serveur.");
    } finally {
      setConnexionEnCours(false);
    }
  };

  // Enregistrement de la configuration et hachage du mot de passe
  const sauvegarderConfiguration = async (e: React.FormEvent) => {
    e.preventDefault();

    let payload: any = { ...configuration };

    // Si des nouveaux mots de passe ont été saisis, valider
    if (nouveauMotDePasse.trim()) {
      if (nouveauMotDePasse.length < 8) {
        toast.error("Le nouveau mot de passe doit comporter au moins 8 caractères.");
        return;
      }
      if (nouveauMotDePasse !== confirmerMotDePasse) {
        toast.error("Les deux mots de passe ne correspondent pas.");
        return;
      }
      payload.motDePasseAdmin = nouveauMotDePasse.trim();
    }

    try {
      setChargement(true);
      const reponse = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (reponse.status === 401) {
        setEstAuthentifie(false);
        setMotDePasseSaisi('');
        toast.error("Votre session a expiré. Veuillez vous reconnecter.");
        return;
      }

      if (reponse.ok) {
        setSauvegardeReussie(true);
        if (nouveauMotDePasse.trim()) {
          toast.success("Mot de passe administrateur enregistré avec succès!");
          setNouveauMotDePasse('');
          setConfirmerMotDePasse('');
        } else {
          toast.success("Configuration mise à jour avec succès.");
        }
        setTimeout(() => setSauvegardeReussie(false), 3000);
      } else {
        toast.error("Erreur lors de la sauvegarde.");
      }
    } catch (e) {
      toast.error("Erreur de connexion serveur.");
    } finally {
      setChargement(false);
    }
  };

  const exporterCsv = () => {
    window.open('/api/exporter', '_blank');
  };

  // Déconnexion sécurisée : suppression de la session serveur (cookie HttpOnly)
  const deconnecterAdmin = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {
      console.error("Erreur lors de la déconnexion:", e);
    } finally {
      setEstAuthentifie(false);
      setMotDePasseSaisi('');
      toast.success("Vous êtes déconnecté(e).");
    }
  };

  const exporterPdfMultipage = async () => {
    try {
      setExportPdfEnCours(true);
      await ServiceExportPdfParticipants.exporterRapportParticipantsPdf(participants, configuration);
    } catch (e) {
      console.error("Erreur génération PDF multipage:", e);
      alert("Une erreur s'est produite lors de la création du fichier PDF.");
    } finally {
      setExportPdfEnCours(false);
    }
  };

  // Liste des dates uniques d'inscription triées de la plus récente à la plus ancienne
  const listeDatesInscriptions = Array.from(
    new Set(
      participants
        .map((p) => {
          const d = new Date(p.dateInscription);
          if (isNaN(d.getTime())) return null;
          return d.toISOString().split('T')[0];
        })
        .filter(Boolean) as string[]
    )
  ).sort((a, b) => b.localeCompare(a));

  const participantsFiltres = participants.filter((p) => {
    // 1. Filtre par date
    if (filtreDate !== 'toutes') {
      const d = new Date(p.dateInscription);
      if (!isNaN(d.getTime())) {
        const dateIso = d.toISOString().split('T')[0];
        if (dateIso !== filtreDate) return false;
      }
    }

    // 2. Filtre par texte de recherche
    const terme = recherche.toLowerCase();
    return (
      p.nom.toLowerCase().includes(terme) ||
      p.prenom.toLowerCase().includes(terme) ||
      (p.telephone && p.telephone.toLowerCase().includes(terme)) ||
      (p.email && p.email.toLowerCase().includes(terme)) ||
      p.numeroTicket.toLowerCase().includes(terme)
    );
  });

  const urlFormulaireParticipant = typeof window !== 'undefined' ? `${window.location.origin}/participer` : 'http://localhost:3000/participer';

  // Mire de connexion Administrateur avec bouton de masquage / affichage de mot de passe (icône Œil)
  if (!estAuthentifie) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-100/80 font-sans">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-amber-200/80 text-center">
          <div className="w-13 h-13 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-center mx-auto mb-4 text-amber-600 shadow-sm">
            <Lock className="w-6 h-6 text-amber-600" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Espace Gérant</h2>
          <p className="text-xs text-slate-500 mb-6 font-medium">Saisissez votre mot de passe administrateur pour accéder au tirage et aux réglages.</p>

          <form onSubmit={authentifierAdmin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Mot de passe Administrateur</label>
              <div className="relative">
                <input
                  type={afficherMotDePasseConnexion ? "text" : "password"}
                  required
                  value={motDePasseSaisi}
                  onChange={(e) => setMotDePasseSaisi(e.target.value)}
                  placeholder="Saisissez le mot de passe"
                  className="w-full pl-4 pr-10 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all font-medium"
                />
                {/* Icône Œil pour Afficher / Masquer le mot de passe */}
                <button
                  type="button"
                  onClick={() => setAfficherMotDePasseConnexion(!afficherMotDePasseConnexion)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-amber-600 transition-colors"
                  title={afficherMotDePasseConnexion ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {afficherMotDePasseConnexion ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={connexionEnCours}
              className="w-full py-3.5 px-4 rounded-xl bg-linear-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-extrabold text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {connexionEnCours ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <span>Se Connecter au Dashboard</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Accès Sécurisé (Mot de passe haché PBKDF2)</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative">
      {/* MODAL DE CONFIRMATION DE SUPPRESSION STYLISÉ THÈME ROYAL */}
      {modalSuppressionOuvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-rose-300 space-y-5 relative">
            <button
              onClick={() => setModalSuppressionOuvert(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 bg-rose-100 rounded-2xl border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
              <AlertTriangle className="w-7 h-7 text-rose-600" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Confirmer la Suppression</h3>
              <p className="text-xs text-slate-600 font-medium">
                {elementsASupprimer?.nomComplet ? (
                  <>Êtes-vous sûr de vouloir supprimer définitivement le participant <strong className="text-slate-900">{elementsASupprimer.nomComplet}</strong> ?</>
                ) : (
                  <>Êtes-vous sûr de vouloir supprimer définitivement les <strong className="text-rose-700">{idsSelectionnes.length} participant(s) sélectionné(s)</strong> ?</>
                )}
              </p>
              <p className="text-[11px] font-bold text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200">
                Cette action est irréversible et supprimera le ticket du tirage.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalSuppressionOuvert(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={confirmerSuppression}
                disabled={suppressionEnCours}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
              >
                {suppressionEnCours ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Trash2 className="w-4 h-4 text-white" />
                )}
                <span>Supprimer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Pleine Largeur Responsive */}
      <header className="w-full bg-white border-b border-slate-200/90 px-4 sm:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center font-black text-lg sm:text-xl shadow-md border border-amber-300 shrink-0">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200">
                Administration Stand
              </span>
              <span className="text-xs text-slate-500 font-semibold truncate">• {configuration.nomStand}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight truncate">{configuration.nomEvenement}</h1>
          </div>
        </div>

        {/* Actions Rapides Responsive */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="hidden lg:flex items-center gap-2 bg-slate-100 px-3.5 py-2 rounded-xl text-xs text-slate-600 font-semibold border border-slate-200">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>Tirage : <strong className="text-slate-900">{configuration.dateTirage} à {configuration.heureTirage}</strong></span>
          </div>

          <button
            onClick={chargerDonnees}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-all shrink-0"
            title="Rafraîchir les données"
          >
            <RefreshCw className={`w-4 h-4 ${chargement ? 'animate-spin text-amber-600' : ''}`} />
          </button>

          <button
            onClick={deconnecterAdmin}
            className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200 transition-all shrink-0"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
          </button>

          <button
            onClick={exporterPdfMultipage}
            disabled={exportPdfEnCours || participants.length === 0}
            className="flex-1 sm:flex-initial py-2.5 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {exportPdfEnCours ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>PDF Multipage...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 text-amber-400" />
                <span>PDF Multipage</span>
              </>
            )}
          </button>

          <button
            onClick={exporterCsv}
            disabled={participants.length === 0}
            className="flex-1 sm:flex-initial py-2.5 px-3.5 rounded-xl bg-linear-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 text-amber-100" />
            <span>Export CSV</span>
          </button>
        </div>
      </header>

      {/* Navigation Onglets Pleine Largeur - Défilement horizontal fluide sur mobile */}
      <nav className="w-full bg-white border-b border-slate-200 px-4 sm:px-8 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        <button
          onClick={() => setOngletActif('participants')}
          className={`py-2.5 px-4 font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            ongletActif === 'participants'
              ? 'bg-linear-to-r from-amber-500 to-yellow-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Inscrits ({participants.length})</span>
        </button>

        <button
          onClick={() => setOngletActif('tirage')}
          className={`py-2.5 px-4 font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            ongletActif === 'tirage'
              ? 'bg-linear-to-r from-amber-500 to-yellow-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Dices className="w-4 h-4 text-amber-300" />
          <span>Tirage au Sort</span>
        </button>

        <button
          onClick={() => setOngletActif('configuration')}
          className={`py-2.5 px-4 font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            ongletActif === 'configuration'
              ? 'bg-linear-to-r from-amber-500 to-yellow-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Réglages</span>
        </button>

        <button
          onClick={() => setOngletActif('affiche')}
          className={`py-2.5 px-4 font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            ongletActif === 'affiche'
              ? 'bg-linear-to-r from-amber-500 to-yellow-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Affiche & QR Code</span>
        </button>
      </nav>

      {/* Contenu Principal avec Padding Adaptatif */}
      <main className="flex-1 w-full px-3 sm:px-8 py-4 sm:py-8 space-y-6">
        {/* Onglet 1 : Liste des Inscrits */}
        {ongletActif === 'participants' && (
          <div className="space-y-4 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                {/* Champ de recherche texte */}
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    value={recherche}
                    onChange={(e) => setRecherche(e.target.value)}
                    placeholder="Rechercher par nom, téléphone, email, ticket..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 font-medium"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>

                {/* Filtre déroulant par Date d'inscription */}
                <div className="relative shrink-0">
                  <select
                    value={filtreDate}
                    onChange={(e) => setFiltreDate(e.target.value)}
                    className="w-full sm:w-auto pl-9 pr-8 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 font-bold cursor-pointer appearance-none"
                  >
                    <option value="toutes">Toutes les dates ({participants.length})</option>
                    {listeDatesInscriptions.map((dateStr) => {
                      const parts = dateStr.split('-');
                      const dateFormatee = `${parts[2]}/${parts[1]}/${parts[0]}`;
                      const estAujourdhui = dateStr === new Date().toISOString().split('T')[0];
                      const countDate = participants.filter((p) => {
                        const d = new Date(p.dateInscription);
                        return !isNaN(d.getTime()) && d.toISOString().split('T')[0] === dateStr;
                      }).length;

                      return (
                        <option key={dateStr} value={dateStr}>
                          {estAujourdhui ? `Aujourd'hui (${dateFormatee})` : dateFormatee} ({countDate})
                        </option>
                      );
                    })}
                  </select>
                  <Calendar className="w-4 h-4 text-amber-600 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {idsSelectionnes.length > 0 && (
                  <button
                    onClick={demanderSuppressionGroupes}
                    className="py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 animate-in fade-in"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                    <span>Supprimer ({idsSelectionnes.length})</span>
                  </button>
                )}

                <button
                  onClick={exporterPdfMultipage}
                  disabled={exportPdfEnCours || participants.length === 0}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 transition-all"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  <span>PDF Multipage</span>
                </button>

                <div className="text-xs text-slate-600 font-bold bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
                  Total : <span className="text-amber-900">{participantsFiltres.length} inscrit(s)</span>
                </div>
              </div>
            </div>

            <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100/90 text-slate-900 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-4 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={participantsFiltres.length > 0 && idsSelectionnes.length === participantsFiltres.length}
                          onChange={basculerToutSelectionner}
                          className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                        />
                      </th>
                      <th className="p-4 font-extrabold text-slate-900">Numéro Unique Ticket</th>
                      <th className="p-4 font-extrabold text-slate-900">Prénom & Nom du Participant</th>
                      <th className="p-4 font-extrabold text-slate-900">Téléphone & Email</th>
                      <th className="p-4 font-extrabold text-slate-900 text-center">Compte CIH</th>
                      <th className="p-4 font-extrabold text-slate-900">Date & Heure d'Inscription</th>
                      <th className="p-4 text-center font-extrabold text-slate-900">Statut</th>
                      <th className="p-4 text-center font-extrabold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {participantsFiltres.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-slate-400 font-semibold text-sm">
                          Aucun inscrit enregistré pour le moment.
                        </td>
                      </tr>
                    ) : (
                      participantsFiltres.map((p) => {
                        const estCoche = idsSelectionnes.includes(p.id);

                        return (
                          <tr key={p.id} className={`hover:bg-slate-50/80 transition-colors ${estCoche ? 'bg-amber-50/40' : ''}`}>
                            <td className="p-4 text-center">
                              <input
                                type="checkbox"
                                checked={estCoche}
                                onChange={() => basculerSelectionUn(p.id)}
                                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                              />
                            </td>
                            <td className="p-4 font-mono font-black text-amber-700 text-sm">{p.numeroTicket}</td>
                            <td className="p-4 font-extrabold text-slate-900 text-sm">{p.prenom} {p.nom}</td>
                             <td className="p-4 space-y-0.5">
                              {p.telephone && (
                                <div className="flex items-center gap-1 text-slate-800 font-bold">
                                  <Phone className="w-3 h-3 text-amber-600" />
                                  <span>{p.telephone}</span>
                                </div>
                              )}
                              {p.email && (
                                <div className="flex items-center gap-1 text-slate-500 font-medium">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  <span>{p.email}</span>
                                </div>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              {p.aCompteCih ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px] border border-emerald-300 shadow-2xs">
                                  Oui (CIH)
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-semibold text-[11px]">
                                  Non
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-slate-500 font-medium">
                              {new Date(p.dateInscription).toLocaleString('fr-FR')}
                            </td>
                            <td className="p-4 text-center">
                              {p.estGagnant ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] uppercase shadow-sm">
                                  <Trophy className="w-3.5 h-3.5 text-slate-950" />
                                  <span>GAGNANT</span>
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-[11px]">
                                  Inscrit
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => demanderSuppressionIndividuelle(p)}
                                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-200"
                                title={`Supprimer ${p.prenom} ${p.nom}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Onglet 2 : Tirage au Sort Suspense */}
        {ongletActif === 'tirage' && (
          <TirageAuSortAdminSuspense />
        )}

        {/* Onglet 3 : Réglages & Changement de Mot de Passe Admin */}
        {ongletActif === 'configuration' && (
          <div className="w-full max-w-4xl mx-auto space-y-6">
            <form onSubmit={sauvegarderConfiguration} className="bg-white rounded-3xl p-8 border border-slate-200 space-y-6 shadow-sm">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-xl font-black text-slate-900">Paramètres Généraux & Sécurité</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">Configurez le nom du stand, les dates, les lots et modifiez le mot de passe administrateur (haché en base).</p>
              </div>

              {sauvegardeReussie && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Modifications enregistrées avec succès en base de données !</span>
                </div>
              )}

              {/* SÉLECTEUR DE DATE ET HEURE STYLISÉ */}
              <SelecteurDateHeure
                date={configuration.dateTirage}
                heure={configuration.heureTirage}
                surChangementDate={(d) => setConfiguration({ ...configuration, dateTirage: d })}
                surChangementHeure={(h) => setConfiguration({ ...configuration, heureTirage: h })}
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Nom de l'Événement
                </label>
                <input
                  type="text"
                  required
                  value={configuration.nomEvenement}
                  onChange={(e) => setConfiguration({ ...configuration, nomEvenement: e.target.value })}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Nom du Stand
                </label>
                <input
                  type="text"
                  required
                  value={configuration.nomStand}
                  onChange={(e) => setConfiguration({ ...configuration, nomStand: e.target.value })}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* CONFIGURATION DES GAGNANTS ET CADEAUX PAR RANG */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Gift className="w-4 h-4 text-amber-600" />
                      <span>Configuration des Gagnants & Cadeaux</span>
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Saisissez le nombre de gagnants prévus et attribuez un lot spécifique à chacun.</p>
                  </div>

                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-700">Nombre :</span>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={configuration.nombreGagnantsPrevu}
                      onChange={(e) => changerNombreGagnantsPrevu(parseInt(e.target.value, 10))}
                      className="w-12 text-center text-sm font-black text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  {configuration.lotsParRang.map((lot, index) => (
                    <div key={index} className="space-y-1">
                      <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider">
                        {index === 0 ? "🥇 Cadeau du 1er Gagnant (Grand Prix)" : index === 1 ? "🥈 Cadeau du 2ème Gagnant" : index === 2 ? "🥉 Cadeau du 3ème Gagnant" : `🏅 Cadeau du Gagnant N°${index + 1}`}
                      </label>
                      <input
                        type="text"
                        required
                        value={lot}
                        onChange={(e) => modifierLotPourRang(index, e.target.value)}
                        placeholder={`Ex: ${index === 0 ? 'Un iPad Pro' : index === 1 ? 'Une Montre Connectée' : 'Un Écouteur sans fil'}`}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-amber-500 font-medium"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* HACHAGE SÉCURISÉ DU MOT DE PASSE ADMINISTRATEUR */}
              <div className="p-6 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-amber-500 text-slate-950 rounded-xl flex items-center justify-center font-bold">
                      <Key className="w-5 h-5 text-slate-950" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Changer le Mot de Passe Administrateur (Hachage Sécurisé)</h4>
                      <p className="text-xs text-slate-600 font-medium">Laissez ces champs vides si vous ne souhaitez pas modifier votre mot de passe actuel.</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAfficherMotDePasseConfig(!afficherMotDePasseConfig)}
                    className="text-xs font-bold text-amber-900 flex items-center gap-1 hover:underline"
                  >
                    {afficherMotDePasseConfig ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{afficherMotDePasseConfig ? "Masquer" : "Afficher"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Nouveau Mot de Passe
                    </label>
                    <input
                      type={afficherMotDePasseConfig ? "text" : "password"}
                      value={nouveauMotDePasse}
                      onChange={(e) => setNouveauMotDePasse(e.target.value)}
                      placeholder="Saisissez le nouveau mot de passe"
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-amber-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Confirmer le Mot de Passe
                    </label>
                    <input
                      type={afficherMotDePasseConfig ? "text" : "password"}
                      value={confirmerMotDePasse}
                      onChange={(e) => setConfirmerMotDePasse(e.target.value)}
                      placeholder="Répétez le nouveau mot de passe"
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-amber-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={chargement}
                className="w-full py-4 px-6 rounded-2xl bg-linear-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-extrabold text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5 text-amber-100" />
                <span>Enregistrer les Réglages & Mot de Passe Haché</span>
              </button>
            </form>
          </div>
        )}

        {/* Onglet 4 : Affiche avec Gros QR Code */}
        {ongletActif === 'affiche' && (
          <div className="w-full py-2">
            <AfficheQrCodeImprimable
              urlInscription={urlFormulaireParticipant}
              nomEvenement={configuration.nomEvenement}
              nomStand={configuration.nomStand}
              dateTirage={configuration.dateTirage}
              heureTirage={configuration.heureTirage}
            />
          </div>
        )}
      </main>
    </div>
  );
};
