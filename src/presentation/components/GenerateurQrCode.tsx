'use client';

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, QrCode, Sparkles } from 'lucide-react';

interface ProprietesGenerateurQrCode {
  urlFormulaire?: string;
  nomEvenement?: string;
}

export const GenerateurQrCode: React.FC<ProprietesGenerateurQrCode> = ({
  urlFormulaire = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  nomEvenement = 'Stand Event',
}) => {
  const referenceConteneurQr = useRef<HTMLDivElement>(null);

  const telechargerQrCodeSvg = () => {
    if (!referenceConteneurQr.current) return;
    const elementSvg = referenceConteneurQr.current.querySelector('svg');
    if (!elementSvg) return;

    const donneesSvg = new XMLSerializer().serializeToString(elementSvg);
    const blobSvg = new Blob([donneesSvg], { type: 'image/svg+xml;charset=utf-8' });
    const urlBlob = URL.createObjectURL(blobSvg);

    const lien = document.createElement('a');
    lien.download = `qrcode-stand-${nomEvenement.toLowerCase().replace(/\s+/g, '-')}.svg`;
    lien.href = urlBlob;
    lien.click();
    URL.revokeObjectURL(urlBlob);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-amber-200 text-center space-y-4 max-w-sm mx-auto">
      <div className="flex items-center justify-center gap-2 text-amber-900 font-extrabold text-sm uppercase tracking-wide">
        <QrCode className="w-5 h-5 text-amber-600" />
        <span>QR Code Officiel du Stand</span>
      </div>

      <p className="text-xs text-slate-500">
        Scannez ce QR Code pour accéder instantanément au formulaire de tirage au sort sur smartphone.
      </p>

      {/* Rendu visuel du QR Code */}
      <div
        ref={referenceConteneurQr}
        className="p-5 bg-linear-to-b from-amber-50 to-white rounded-2xl border-2 border-amber-300 inline-block shadow-inner"
      >
        <QRCodeSVG
          value={urlFormulaire}
          size={200}
          bgColor="#ffffff"
          fgColor="#0f172a"
          level="H"
          includeMargin={true}
        />
      </div>

      <div className="text-[11px] font-mono text-slate-400 truncate bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-200">
        {urlFormulaire}
      </div>

      {/* Bouton de téléchargement du QR Code HD */}
      <button
        onClick={telechargerQrCodeSvg}
        className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
      >
        <Download className="w-4 h-4 text-amber-400" />
        <span>Télécharger le QR Code HD (SVG)</span>
      </button>
    </div>
  );
};
