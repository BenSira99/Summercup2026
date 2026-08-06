import { NextRequest, NextResponse } from 'next/server';
import { DepotParticipantMySql } from '@/infrastructure/persistence/DepotParticipant';
import { DepotConfigurationMySql } from '@/infrastructure/persistence/DepotConfiguration';
import { SoumettreParticipationUseCase } from '@/usecases/SoumettreParticipationUseCase';
import { ServiceRateLimit } from '@/infrastructure/services/ServiceRateLimit';
import { ServiceSessionAdmin } from '@/infrastructure/services/ServiceSessionAdmin';
import { ServiceProtectionCsrf } from '@/infrastructure/services/ServiceProtectionCsrf';
import { ServiceJournalisation } from '@/infrastructure/services/ServiceJournalisation';

export const dynamic = 'force-dynamic';

export async function POST(requete: NextRequest) {
  try {
    const ipClient = requete.headers.get('x-forwarded-for') || requete.headers.get('x-real-ip') || '127.0.0.1';

    // Rate Limiting : Maximum 15 inscriptions par minute par IP (Protection DoS CWE-400)
    const verificationRate = ServiceRateLimit.verifierOuBloquer(`participate:${ipClient}`, 15, 60);

    if (!verificationRate.autorise) {
      return NextResponse.json(
        {
          succes: false,
          erreur: `Trop de tentatives d'inscription. Veuillez patienter ${verificationRate.attenteSecondes} secondes avant de réinscrire un ticket.`,
        },
        { status: 429 }
      );
    }

    const corps = await requete.json();
    const { nom, prenom, telephone, email } = corps;

    const depotParticipant = new DepotParticipantMySql();
    const depotConfiguration = new DepotConfigurationMySql();

    const casUsage = new SoumettreParticipationUseCase(depotParticipant, depotConfiguration);

    const { participant, ticket } = await casUsage.executer({
      nom,
      prenom,
      telephone,
      email,
    });

    return NextResponse.json({
      succes: true,
      ticket: {
        id: participant.id,
        nomParticipant: ticket.nomCompletParticipant,
        prenomParticipant: participant.prenom,
        numeroTicket: ticket.numeroTicket,
        telephone: participant.telephone,
        email: participant.email,
        dateInscription: participant.dateInscription.toISOString(),
        estGagnant: participant.estGagnant,
      },
    });
  } catch (erreur: any) {
    // A10 — Ne jamais exposer le message d'erreur interne au client
    ServiceJournalisation.erreurInterne('participation.submit', erreur);
    return NextResponse.json(
      { succes: false, erreur: "Erreur lors de l'inscription. Veuillez vérifier vos informations." },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    const ipClient = '127.0.0.1';

    // A01 — Les données des participants (PII) sont réservées à l'administrateur
    if (!(await ServiceSessionAdmin.verifierSession())) {
      ServiceJournalisation.accesRefuse('participants.list', ipClient);
      return NextResponse.json({ succes: false, erreur: 'Non autorisé.' }, { status: 401 });
    }

    const depotParticipant = new DepotParticipantMySql();
    const participants = await depotParticipant.obtenirTousLesParticipants();

    return NextResponse.json({
      succes: true,
      total: participants.length,
      participants: participants.map((p) => ({
        id: p.id,
        nom: p.nom,
        prenom: p.prenom,
        telephone: p.telephone,
        email: p.email,
        numeroTicket: p.numeroTicket,
        dateInscription: p.dateInscription,
        estGagnant: p.estGagnant,
      })),
    });
  } catch (erreur: any) {
    ServiceJournalisation.erreurInterne('participants.list', erreur);
    return NextResponse.json(
      { succes: false, erreur: 'Erreur lors de la récupération des participations.' },
      { status: 500 }
    );
  }
}

export async function DELETE(requete: NextRequest) {
  try {
    const ipClient = requete.headers.get('x-forwarded-for') || requete.headers.get('x-real-ip') || '127.0.0.1';

    // A01 — Suppression réservée à l'administrateur
    if (!(await ServiceSessionAdmin.verifierSession())) {
      ServiceJournalisation.accesRefuse('participants.delete', ipClient);
      return NextResponse.json({ succes: false, erreur: 'Non autorisé.' }, { status: 401 });
    }

    // CWE-352 — Protection CSRF
    if (!ServiceProtectionCsrf.verifierOrigine(requete)) {
      ServiceJournalisation.accesRefuse('participants.delete.csrf', ipClient);
      return NextResponse.json({ succes: false, erreur: 'Requête invalide.' }, { status: 403 });
    }

    const corps = await requete.json();
    const { id, ids } = corps;

    const depotParticipant = new DepotParticipantMySql();

    if (id) {
      await depotParticipant.mefSupprimerParticipant(id);
      ServiceJournalisation.actionAdministrateur('participants.delete.single', ipClient);
      return NextResponse.json({ succes: true, message: 'Participant supprimé avec succès.' });
    }

    if (ids && Array.isArray(ids) && ids.length > 0) {
      await depotParticipant.mefSupprimerPlusieurs(ids);
      ServiceJournalisation.actionAdministrateur('participants.delete.multiple', ipClient);
      return NextResponse.json({ succes: true, message: `${ids.length} participant(s) supprimé(s) avec succès.` });
    }

    return NextResponse.json({ succes: false, erreur: 'Aucun ID fourni pour la suppression.' }, { status: 400 });
  } catch (erreur: any) {
    ServiceJournalisation.erreurInterne('participants.delete', erreur);
    return NextResponse.json(
      { succes: false, erreur: 'Erreur lors de la suppression.' },
      { status: 500 }
    );
  }
}
