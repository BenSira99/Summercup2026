import { NextRequest, NextResponse } from 'next/server';
import { DepotConfigurationMySql } from '@/infrastructure/persistence/DepotConfiguration';
import { ConfigurationEvenementEntite } from '@/domain/entities/ConfigurationEvenementEntite';
import { ServiceHachageSecurise } from '@/infrastructure/services/ServiceHachageSecurise';
import { ServiceSessionAdmin } from '@/infrastructure/services/ServiceSessionAdmin';
import { ServiceProtectionCsrf } from '@/infrastructure/services/ServiceProtectionCsrf';
import { ServiceJournalisation } from '@/infrastructure/services/ServiceJournalisation';

export const dynamic = 'force-dynamic';

const LONGUEUR_MIN_MOT_DE_PASSE = 6;
const LONGUEUR_MAX_TEXTE = 500;

export async function GET() {
  try {
    const depotConfig = new DepotConfigurationMySql();
    const config = await depotConfig.obteinirConfiguration();

    // Sécurité OWASP : Ne JAMAIS exposer le mot de passe ou le hash du mot de passe dans la réponse API publique GET
    return NextResponse.json({
      succes: true,
      configuration: {
        nomEvenement: config.nomEvenement,
        nomStand: config.nomStand,
        descriptionLot: config.descriptionLot,
        dateTirage: config.dateTirage,
        heureTirage: config.heureTirage,
        nombreGagnantsPrevu: config.nombreGagnantsPrevu,
        lotsParRang: config.lotsParRang,
      },
    });
  } catch (e: any) {
    ServiceJournalisation.erreurInterne('configuration.get', e);
    return NextResponse.json({ succes: false, erreur: 'Erreur lors de la récupération des paramètres.' }, { status: 500 });
  }
}

export async function POST(requete: NextRequest) {
  try {
    const ipClient = requete.headers.get('x-forwarded-for') || requete.headers.get('x-real-ip') || '';

    // A01 — Broken Access Control : vérification de session ADMIN obligatoire (défense en profondeur)
    if (!(await ServiceSessionAdmin.verifierSession())) {
      ServiceJournalisation.accesRefuse('configuration.update', ipClient);
      return NextResponse.json({ succes: false, erreur: 'Non autorisé.' }, { status: 401 });
    }

    // CWE-352 — Protection CSRF (vérification Origin ↔ Host)
    if (!ServiceProtectionCsrf.verifierOrigine(requete)) {
      ServiceJournalisation.accesRefuse('configuration.update.csrf', ipClient);
      return NextResponse.json({ succes: false, erreur: 'Requête invalide.' }, { status: 403 });
    }

    const corps = await requete.json();
    const depotConfig = new DepotConfigurationMySql();
    const configActuelle = await depotConfig.obteinirConfiguration();

    let motDePasseFinal = configActuelle.motDePasseAdmin;

    // Hachage du mot de passe : TOUJOURS hacher le mot de passe en clair reçu (jamais le stocker tel quel)
    if (corps.motDePasseAdmin && String(corps.motDePasseAdmin).trim()) {
      const mdpBrut = String(corps.motDePasseAdmin).trim();

      if (mdpBrut.length < LONGUEUR_MIN_MOT_DE_PASSE) {
        return NextResponse.json(
          { succes: false, erreur: `Le nouveau mot de passe doit contenir au moins ${LONGUEUR_MIN_MOT_DE_PASSE} caractères.` },
          { status: 400 }
        );
      }

      motDePasseFinal = ServiceHachageSecurise.hacherMotDePasse(mdpBrut);
    }

    // Validation des champs texte (longueur maximale, anti-DoS)
    const texteTronque = (valeur: unknown, defaut: string): string => {
      if (typeof valeur !== 'string' || !valeur.trim()) return defaut;
      return valeur.trim().slice(0, LONGUEUR_MAX_TEXTE);
    };

    const nouvelleConfig = new ConfigurationEvenementEntite({
      nomEvenement: texteTronque(corps.nomEvenement, configActuelle.nomEvenement),
      nomStand: texteTronque(corps.nomStand, configActuelle.nomStand),
      descriptionLot: texteTronque(corps.descriptionLot, configActuelle.descriptionLot),
      dateTirage: texteTronque(corps.dateTirage, configActuelle.dateTirage),
      heureTirage: texteTronque(corps.heureTirage, configActuelle.heureTirage),
      motDePasseAdmin: motDePasseFinal,
      nombreGagnantsPrevu: Math.min(Math.max(parseInt(corps.nombreGagnantsPrevu, 10) || 1, 1), 50),
      lotsParRang: Array.isArray(corps.lotsParRang) && corps.lotsParRang.length > 0
        ? corps.lotsParRang.slice(0, 50).map((lot: unknown) => String(lot).slice(0, LONGUEUR_MAX_TEXTE))
        : [corps.descriptionLot || configActuelle.descriptionLot],
    });

    await depotConfig.sauvegarderConfiguration(nouvelleConfig);

    ServiceJournalisation.actionAdministrateur('configuration.update', ipClient);

    return NextResponse.json({
      succes: true,
      message: 'Configuration mise à jour avec succès.',
    });
  } catch (e: any) {
    ServiceJournalisation.erreurInterne('configuration.update', e);
    return NextResponse.json({ succes: false, erreur: 'Erreur lors de la mise à jour des paramètres.' }, { status: 500 });
  }
}
