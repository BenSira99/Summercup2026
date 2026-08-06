'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Trophy, Printer, FileText, Loader2 } from 'lucide-react';
import { ServiceGenerateurPdfAffiche } from '@/infrastructure/services/ServiceGenerateurPdfAffiche';

interface ProprietesAfficheQrCode {
  urlInscription: string;
  nomEvenement: string;
  nomStand: string;
  descriptionLot?: string;
  dateTirage: string;
  heureTirage: string;
}

export const AfficheQrCodeImprimable: React.FC<ProprietesAfficheQrCode> = ({
  urlInscription,
  nomEvenement,
  nomStand,
  dateTirage,
  heureTirage,
}) => {
  const [generationEnCours, setGenerationEnCours] = useState(false);

  const telechargerPdfNatifA4 = async () => {
    try {
      setGenerationEnCours(true);
      await ServiceGenerateurPdfAffiche.genererEtTelechargerPdfA4({
        urlInscription,
        nomEvenement,
        nomStand,
        dateTirage,
        heureTirage,
      });
    } catch (erreur) {
      console.error("Erreur lors de la création du fichier PDF:", erreur);
      alert("Une erreur s'est produite lors de la génération du PDF.");
    } finally {
      setGenerationEnCours(false);
    }
  };

  const imprimerAffiche = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto font-sans w-full px-2 sm:px-0">
      {/* Barre d'action pour le Gérant - Adaptée mobile & desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-center text-amber-600">
            <QrCode className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug">
              Affiche Officielle du Stand (Format A4)
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Affiche vectorielle haute définition pour impression
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={imprimerAffiche}
            className="flex-1 sm:flex-initial py-2.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Imprimer</span>
          </button>

          {/* Bouton de téléchargement du VRAI PDF vectoriel A4 */}
          <button
            onClick={telechargerPdfNatifA4}
            disabled={generationEnCours}
            className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-linear-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            {generationEnCours ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-100" />
                <span>Génération...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 text-amber-100" />
                <span>Télécharger PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Aperçu Visuel de l'Affiche Officielle A4 — Rendu 100% Responsive */}
      <div
        id="affiche-stand-qrcode"
        className="w-full bg-white rounded-3xl p-4 sm:p-10 border-4 sm:border-8 border-slate-950 text-center relative overflow-hidden shadow-2xl text-slate-900"
        style={{ backgroundColor: '#ffffff' }}
      >
        {/* En-tête Prestigieux */}
        <div className="space-y-2 sm:space-y-3 pb-4 sm:pb-6 border-b-2 sm:border-b-4 border-amber-400">
          <div className="inline-flex items-center gap-1.5 px-3 sm:px-5 py-1 rounded-full bg-slate-950 text-amber-400 text-[10px] sm:text-xs font-extrabold uppercase tracking-widest max-w-full truncate">
            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{nomStand}</span>
          </div>
          <h1 className="text-xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-950 uppercase leading-tight sm:leading-none break-words">
            {nomEvenement}
          </h1>
        </div>

        {/* Consigne d'appel à l'action */}
        <div className="my-4 sm:my-6 space-y-1">
          <p className="text-base sm:text-2xl font-black uppercase text-slate-900 tracking-tight">
            Scannez le QR Code ci-dessous
          </p>
          <p className="text-xs sm:text-sm font-semibold text-slate-600">
            Pour tenter votre chance au tirage au sort instantané !
          </p>
        </div>

        {/* Le GROS QR Code Central — Adapté aux petits écrans et grands écrans sans débordement */}
        <div className="my-4 sm:my-6 p-3 sm:p-6 bg-slate-50 border-2 sm:border-4 border-amber-400 rounded-2xl sm:rounded-3xl inline-flex items-center justify-center shadow-inner max-w-full">
          <div className="w-[200px] h-[200px] xs:w-[240px] xs:h-[240px] sm:w-[280px] sm:h-[280px]">
            <QRCodeSVG
              value={urlInscription}
              width="100%"
              height="100%"
              bgColor="#ffffff"
              fgColor="#0f172a"
              level="H"
              includeMargin={true}
            />
          </div>
        </div>

        {/* Horodatage & Rendez-vous */}
        <div className="mt-2 sm:mt-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950 text-white space-y-1">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-400">
            Rendez-vous du Tirage au Sort
          </p>
          <p className="text-sm sm:text-2xl font-black tracking-wide text-white">
            {dateTirage} à {heureTirage}
          </p>
        </div>

        {/* Lien direct d'inscription responsive sans tronquage cassé */}
        <div className="mt-4 pt-3 sm:pt-4 border-t border-slate-200 text-[11px] sm:text-xs font-mono text-slate-500 font-semibold leading-relaxed">
          <span className="block sm:inline">Lien direct d'inscription : </span>
          <a
            href={urlInscription}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-700 underline font-bold break-all hover:text-amber-800 transition-colors"
          >
            {urlInscription}
          </a>
        </div>
      </div>
    </div>
  );
};
