'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Compass, Trophy, ArrowLeft, Ticket } from 'lucide-react';

export default function PageNonTrouvee404() {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Effet d'arrière-plan lumineux or & indigo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-slate-900/90 rounded-3xl p-8 sm:p-10 border border-amber-500/30 shadow-2xl text-center space-y-6 backdrop-blur-xl relative z-10 animate-in fade-in zoom-in duration-300">
        {/* Badge / Icône Étoilée */}
        <div className="w-20 h-20 bg-linear-to-b from-amber-400 via-amber-500 to-yellow-600 rounded-3xl p-0.5 mx-auto shadow-xl shadow-amber-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-amber-400">
            <Compass className="w-10 h-10 animate-spin-slow" />
          </div>
        </div>

        {/* Grand Titre 404 */}
        <div className="space-y-2">
          <span className="text-6xl sm:text-7xl font-black tracking-widest text-transparent bg-clip-text bg-linear-to-r from-amber-300 via-amber-400 to-yellow-500">
            404
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">Page Introuvable</h1>
          <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
            Oups ! La page que vous recherchez semble s'être égarée hors du Stand.
          </p>
        </div>

        {/* Ticket d'aide stylisé */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-left flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 border border-amber-500/20">
            <Ticket className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-xs">
            <p className="font-extrabold text-slate-200">Ticket de Tirage au Sort non trouvé</p>
            <p className="text-slate-400 text-[11px]">Vérifiez l'URL ou revenez à l'accueil du tirage.</p>
          </div>
        </div>

        {/* Boutons de redirection */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link
            href="/participer"
            className="w-full py-3.5 px-4 rounded-xl bg-linear-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Trophy className="w-4 h-4 text-slate-950" />
            <span>S'inscrire au Tirage</span>
          </Link>

          <Link
            href="/"
            className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs border border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>Dashboard Gérant</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
