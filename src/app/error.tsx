'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Home, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function PageErreur500({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erreur serveur ou application interceptée:", error);
  }, [error]);

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Halo d'arrière-plan rouge & ambre */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-slate-900/90 rounded-3xl p-8 sm:p-10 border border-rose-500/30 shadow-2xl text-center space-y-6 backdrop-blur-xl relative z-10 animate-in fade-in zoom-in duration-300">
        {/* Badge d'Alerte Serveur */}
        <div className="w-20 h-20 bg-linear-to-b from-rose-500 via-rose-600 to-red-700 rounded-3xl p-0.5 mx-auto shadow-xl shadow-rose-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-rose-500">
            <AlertTriangle className="w-10 h-10 animate-bounce" />
          </div>
        </div>

        {/* Titre Erreur 500 */}
        <div className="space-y-2">
          <span className="text-5xl sm:text-6xl font-black tracking-wider text-transparent bg-clip-text bg-linear-to-r from-rose-400 via-rose-500 to-amber-500">
            Erreur 500
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">Une anomalie est survenue</h1>
          <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
            Désolé, une erreur inattendue est survenue lors du traitement de la requête.
          </p>
        </div>

        {/* Détails techniques discrets */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-rose-950 text-left space-y-1">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>Message du système :</span>
          </div>
          <p className="text-[11px] font-mono text-slate-300 break-words leading-tight bg-slate-900 p-2 rounded-xl border border-slate-800">
            Erreur interne du serveur ou de connexion.
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full py-3.5 px-4 rounded-xl bg-linear-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4 text-slate-950" />
            <span>Réessayer l'Action</span>
          </button>

          <Link
            href="/"
            className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs border border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>Retour à l'Accueil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
