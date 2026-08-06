import { NextResponse } from 'next/server';
import { DepotParticipantMySql } from '@/infrastructure/persistence/DepotParticipant';
import { ExporterParticipantsUseCase } from '@/usecases/ExporterParticipantsUseCase';
import { ServiceSessionAdmin } from '@/infrastructure/services/ServiceSessionAdmin';
import { ServiceJournalisation } from '@/infrastructure/services/ServiceJournalisation';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // A01 — L'export CSV expose les données personnelles (PII) : administrateur uniquement
    if (!(await ServiceSessionAdmin.verifierSession())) {
      ServiceJournalisation.accesRefuse('export.csv', '127.0.0.1');
      return NextResponse.json({ succes: false, erreur: 'Non autorisé.' }, { status: 401 });
    }

    const depotParticipant = new DepotParticipantMySql();
    const casUsage = new ExporterParticipantsUseCase(depotParticipant);

    const contenuCsv = await casUsage.executer();

    return new NextResponse(contenuCsv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="participants-tirage.csv"',
        // Protection complémentaire contre la CSV Formula Injection (CWE-1236)
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (erreur: any) {
    // A10 — Message générique, détails journalisés côté serveur uniquement
    ServiceJournalisation.erreurInterne('export.csv', erreur);
    return NextResponse.json(
      { succes: false, erreur: "Erreur lors de l'exportation CSV." },
      { status: 500 }
    );
  }
}
