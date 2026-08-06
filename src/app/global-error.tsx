'use client';

import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen w-full bg-slate-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
        <div className="w-full max-w-lg bg-slate-900 rounded-3xl p-8 text-center space-y-6 border border-rose-500/30 shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/40">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">Erreur Critique Application</h1>
            <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto">
              Une erreur inattendue a interrompu le système.
            </p>
          </div>

          <button
            onClick={() => reset()}
            className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Recharger l'Application</span>
          </button>
        </div>
      </body>
    </html>
  );
}
