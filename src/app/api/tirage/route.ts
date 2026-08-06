import { NextRequest, NextResponse } from 'next/server';
import { DepotParticipantMySql } from '@/infrastructure/persistence/DepotParticipant';
import { TirerGagnantAleatoireUseCase } from '@/usecases/TirerGagnantAleatoireUseCase';
import { ServiceRateLimit } from '@/infrastructure/services/ServiceRateLimit';
import { ServiceSessionAdmin } from '@/infrastructure/services/ServiceSessionAdmin';
import { ServiceProtectionCsrf } from '@/infrastructure/services/ServiceProtectionCsrf';
import { ServiceJournalisation } from '@/infrastructure/services/ServiceJournalisation';

export const dynamic = 'force-dynamic';

export async function POST(requete: NextRequest) {
  try {
    const ipClient = requete.headers.get('x-forwarded-for') || requete.headers.get('x-real-ip') || '127.0.0.1';

    // A01 — Le tirage au sort est une action réservée à l'administrateur
    if (!(await ServiceSessionAdmin.verifierSession())) {
      ServiceJournalisation.accesRefuse('tirage.execute', ipClient);
      return NextResponse.json({ succes: false, erreur: 'Non autorisé.' }, { status: 401 });
    }

    // CWE-352 — Protection CSRF
    if (!ServiceProtectionCsrf.verifierOrigine(requete)) {
      ServiceJournalisation.accesRefuse('tirage.execute.csrf', ipClient);
      return NextResponse.json({ succes: false, erreur: 'Requête invalide.' }, { status: 403 });
    }

    // Rate Limiting : Maximum 10 tirages au sort par minute par IP (Protection DoS CWE-400)
    const verificationRate = ServiceRateLimit.verifierOuBloquer(`draw:${ipClient}`, 10, 60);

    if (!verificationRate.autorise) {
      return NextResponse.json(
        {
          succes: false,
          erreur: `Trop de requêtes de tirage au sort. Veuillez réespacer vos clics et rejouer dans ${verificationRate.attenteSecondes} secondes.`,
        },
        { status: 429 }
      );
    }

    let nombreGagnants = 1;
    try {
      const corps = await requete.json();
      if (corps && typeof corps.nombreGagnants === 'number' && corps.nombreGagnants > 0) {
        nombreGagnants = Math.min(corps.nombreGagnants, 50); // Limite raisonnable
      }
    } catch (e) {
      // Body optionnel
    }

    const depotParticipant = new DepotParticipantMySql();
    const casUsage = new TirerGagnantAleatoireUseCase(depotParticipant);

    const listeGagnants = await casUsage.executerPlusieurs(nombreGagnants);

    if (!listeGagnants || listeGagnants.length === 0) {
      return NextResponse.json({
        succes: false,
        erreur: "Aucun participant éligible pour le tirage au sort.",
      }, { status: 400 });
    }

    ServiceJournalisation.actionAdministrateur('tirage.execute', ipClient);

    return NextResponse.json({
      succes: true,
      totalTires: listeGagnants.length,
      gagnants: listeGagnants.map((g, index) => ({
        id: g.id,
        rang: index + 1,
        nomComplet: g.obtenirNomComplet(),
        nom: g.nom,
        prenom: g.prenom,
        numeroTicket: g.numeroTicket,
        dateInscription: g.dateInscription,
      })),
      gagnant: {
        id: listeGagnants[0].id,
        nomComplet: listeGagnants[0].obtenirNomComplet(),
        numeroTicket: listeGagnants[0].numeroTicket,
        dateInscription: listeGagnants[0].dateInscription,
      }
    });
  } catch (erreur: any) {
    ServiceJournalisation.erreurInterne('tirage.execute', erreur);
    return NextResponse.json({
      succes: false,
      erreur: "Erreur lors du tirage au sort.",
    }, { status: 500 });
  }
}
