'use client';

import React, { useState } from 'react';
import { Download, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import { toPng } from 'html-to-image';

interface ProprietesBoutonTelechargerTicket {
  idElementCible: string;
  nomFichier?: string;
}

export const BoutonTelechargerTicket: React.FC<ProprietesBoutonTelechargerTicket> = ({
  idElementCible,
  nomFichier = 'mon-ticket-royal.png',
}) => {
  const [telechargementEnCours, setTelechargementEnCours] = useState(false);
  const [telechargeAvecSucces, setTelechargeAvecSucces] = useState(false);

  const telechargerTicketEnImage = async () => {
    try {
      setTelechargementEnCours(true);
      const elementHtml = document.getElementById(idElementCible);

      if (!elementHtml) {
        throw new Error("Element de ticket introuvable pour la conversion.");
      }

      // Conversion de l'élément HTML en Image PNG haute définition avec fond blanc pur et cadrage parfait
      const urlDonneesImage = await toPng(elementHtml, {
        cacheBust: true,
        pixelRatio: 3, // Haute résolution nette pour smartphone
        quality: 1,
        backgroundColor: '#ffffff',
        style: {
          margin: '0',
          transform: 'none',
        },
      });

      // Déclenchement du téléchargement navigateur / téléphone
      const lien = document.createElement('a');
      lien.download = nomFichier;
      lien.href = urlDonneesImage;
      lien.click();

      setTelechargeAvecSucces(true);
      setTimeout(() => setTelechargeAvecSucces(false), 4000);
    } catch (erreur) {
      console.error("Erreur lors de la création du fichier image du ticket:", erreur);
      alert("Impossible de générer l'image. Veuillez effectuer une capture d'écran de votre ticket.");
    } finally {
      setTelechargementEnCours(false);
    }
  };

  return (
    <button
      onClick={telechargerTicketEnImage}
      disabled={telechargementEnCours}
      className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2.5 ${
        telechargeAvecSucces
          ? 'bg-emerald-600 text-white shadow-emerald-600/30'
          : 'bg-linear-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white shadow-amber-500/25 border border-amber-300/40'
      }`}
    >
      {telechargementEnCours ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin text-amber-100" />
          <span>Génération de l'Image PNG...</span>
        </>
      ) : telechargeAvecSucces ? (
        <>
          <Check className="w-5 h-5 text-white" />
          <span>Ticket enregistré dans votre téléphone !</span>
        </>
      ) : (
        <>
          <Download className="w-5 h-5 text-amber-100" />
          <span>Enregistrer mon Ticket (Image PNG)</span>
        </>
      )}
    </button>
  );
};
