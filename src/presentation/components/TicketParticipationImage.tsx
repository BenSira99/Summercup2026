'use client';

import React from 'react';
import { Calendar, Clock, Sparkles, CheckCircle2 } from 'lucide-react';

export interface ProprietesTicketParticipation {
  numeroTicket: string;
  nomComplet: string;
  nomEvenement: string;
  nomStand: string;
  horodatageTirage: string;
}

export const TicketParticipationImage = React.forwardRef<HTMLDivElement, ProprietesTicketParticipation>(
  ({ numeroTicket, nomComplet, nomEvenement, nomStand, horodatageTirage }, ref) => {
    return (
      <div
        ref={ref}
        id="ticket-royal-image"
        className="w-full max-w-[360px] mx-auto bg-white rounded-3xl p-4 sm:p-6 border-4 border-amber-400 relative overflow-hidden text-slate-900 font-sans box-border shadow-xl"
        style={{
          backgroundColor: '#ffffff',
        }}
      >
        {/* En-tête officiel avec fond blanc pur */}
        <div className="text-center pb-4 border-b-2 border-dashed border-amber-300 relative bg-white">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-100" />
            <span>Ticket Officiel Royal</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">{nomEvenement}</h2>
          <p className="text-xs font-semibold text-amber-700 mt-1">{nomStand}</p>
        </div>

        {/* Badge Numéro de Ticket - Bloc Sombre Contrasté */}
        <div className="my-4 sm:my-5 text-center bg-slate-950 rounded-2xl p-3.5 sm:p-4 text-white border-2 border-amber-400 relative">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-300 mb-1">
            Numéro Unique de Tirage
          </p>
          <div className="text-2xl sm:text-3xl font-black tracking-widest text-amber-400 font-mono break-all">
            {numeroTicket}
          </div>
          <div className="mt-2.5 inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-emerald-400 font-bold bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Participation Validée</span>
          </div>
        </div>

        {/* Nom du Participant uniquement */}
        <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200 text-center">
          <span className="text-slate-500 font-semibold text-[10px] sm:text-[11px] uppercase tracking-wider block mb-0.5">Participant Inscrit</span>
          <span className="font-black text-slate-900 text-base sm:text-lg block truncate">{nomComplet}</span>
        </div>

        {/* Date et Heure du Tirage (Paramétrées par l'admin) */}
        <div className="mt-3.5 sm:mt-4 p-3 sm:p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] sm:text-[11px] font-bold text-amber-900 mb-0.5 uppercase tracking-wide">
            <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Rendez-vous du Tirage au Sort</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm font-black text-slate-900">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{horodatageTirage}</span>
          </div>
        </div>

        {/* Bas de ticket / Filigrane */}
        <div className="mt-3.5 sm:mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-medium">
          <span>Conservez ce ticket en image</span>
          <span className="font-bold text-amber-600">★ Tirage Prestige</span>
        </div>
      </div>
    );
  }
);

TicketParticipationImage.displayName = 'TicketParticipationImage';
