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
    <div className="space-y-6 max-w-2xl mx-auto font-sans">
      {/* Barre d'action pour le Gérant */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-center text-amber-600">
            <QrCode className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">Affiche Officielle du Stand (Format A4)</h4>
            <p className="text-xs text-slate-500 font-medium font-sans">Générez un PDF vectoriel natif à imprimer pour le stand</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={imprimerAffiche}
            className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Imprimer</span>
          </button>

          {/* Bouton de téléchargement du VRAI PDF vectoriel A4 */}
          <button
            onClick={telechargerPdfNatifA4}
            disabled={generationEnCours}
            className="py-2.5 px-5 rounded-xl bg-linear-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
          >
            {generationEnCours ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-100" />
                <span>Génération du PDF...</span>
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

      {/* Aperçu Visuel de l'Affiche Officielle A4 avec le GROS QR Code */}
      <div
        id="affiche-stand-qrcode"
        className="w-full bg-white rounded-3xl p-8 sm:p-12 border-8 border-slate-950 text-center relative overflow-hidden shadow-2xl text-slate-900"
        style={{ backgroundColor: '#ffffff' }}
      >
        {/* En-tête Prestigiose */}
        <div className="space-y-3 pb-6 border-b-4 border-amber-400">
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-slate-950 text-amber-400 text-xs font-extrabold uppercase tracking-widest">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>{nomStand}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 uppercase leading-none">
            {nomEvenement}
          </h1>
        </div>

        {/* Consigne d'appel à l'action */}
        <div className="my-6 space-y-1">
          <p className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-tight">
            Scannez le QR Code ci-dessous
          </p>
          <p className="text-sm font-semibold text-slate-600">
            Pour tenter votre chance au tirage au sort instantané !
          </p>
        </div>

        {/* Le GROS QR Code Central */}
        <div className="my-6 p-6 bg-slate-50 border-4 border-amber-400 rounded-3xl inline-block shadow-inner">
          <QRCodeSVG
            value={urlInscription}
            size={280}
            bgColor="#ffffff"
            fgColor="#0f172a"
            level="H"
            includeMargin={true}
          />
        </div>

        {/* Horodatage & Lien */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-950 text-white space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Rendez-vous du Tirage au Sort
          </p>
          <p className="text-lg sm:text-2xl font-black tracking-wide text-white">
            {dateTirage} à {heureTirage}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200 text-xs font-mono text-slate-500 font-semibold truncate">
          Lien direct d'inscription : <a href={urlInscription} target="_blank" rel="noopener noreferrer" className="text-amber-700 underline font-bold">{urlInscription}</a>
        </div>
      </div>
    </div>
  );
};
