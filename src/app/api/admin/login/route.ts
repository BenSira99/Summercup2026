import { NextRequest, NextResponse } from 'next/server';
import { DepotConfigurationMySql } from '@/infrastructure/persistence/DepotConfiguration';
import { ServiceHachageSecurise } from '@/infrastructure/services/ServiceHachageSecurise';
import { ConfigurationEvenementEntite } from '@/domain/entities/ConfigurationEvenementEntite';
import { ServiceRateLimit } from '@/infrastructure/services/ServiceRateLimit';
import { ServiceSessionAdmin } from '@/infrastructure/services/ServiceSessionAdmin';
import { ServiceJournalisation } from '@/infrastructure/services/ServiceJournalisation';

export const dynamic = 'force-dynamic';

const LONGUEUR_MIN_MOT_DE_PASSE = 6;

export async function POST(requete: NextRequest) {
  try {
    // Extrait l'adresse IP du client pour le rate limiting
    const ipClient = requete.headers.get('x-forwarded-for') || requete.headers.get('x-real-ip') || '127.0.0.1';

    // Rate Limiting : 5 tentatives max par minute par IP (Protection anti-brute force OWASP A07)
    const verificationRate = ServiceRateLimit.verifierOuBloquer(`login:${ipClient}`, 5, 60);

    if (!verificationRate.autorise) {
      ServiceJournalisation.tentativeConnexion('inconnu', false, ipClient);
      return NextResponse.json(
        {
          succes: false,
          erreur: `Trop de tentatives de connexion. Veuillez réespacer vos requêtes et réessayer dans ${verificationRate.attenteSecondes} secondes.`,
        },
        { status: 429 }
      );
    }

    const corps = await requete.json();
    const { motDePasse } = corps;

    if (!motDePasse || !motDePasse.trim()) {
      return NextResponse.json({ succes: false, erreur: 'Le mot de passe est requis.' }, { status: 400 });
    }

    if (typeof motDePasse !== 'string' || motDePasse.length > 128) {
      return NextResponse.json(
        { succes: false, erreur: 'Mot de passe invalide.' },
        { status: 400 }
      );
    }

    const depotConfig = new DepotConfigurationMySql();
    const config = await depotConfig.obteinirConfiguration();

    const motDePasseNet = motDePasse.trim();

    // Cas 1 : Si aucun mot de passe n'est configuré en base de données
    if (!config.motDePasseAdmin || config.motDePasseAdmin.trim() === '') {
      if (motDePasseNet.length < LONGUEUR_MIN_MOT_DE_PASSE) {
        return NextResponse.json(
          {
            succes: false,
            erreur: `Le mot de passe administrateur doit contenir au moins ${LONGUEUR_MIN_MOT_DE_PASSE} caractères.`,
          },
          { status: 400 }
        );
      }

      const hashNouveau = ServiceHachageSecurise.hacherMotDePasse(motDePasseNet);
      const nouvelleConfig = new ConfigurationEvenementEntite({
        ...config,
        motDePasseAdmin: hashNouveau,
      });

      await depotConfig.sauvegarderConfiguration(nouvelleConfig);

      await ServiceSessionAdmin.creerSession();
      ServiceJournalisation.tentativeConnexion('initialisation', true, ipClient);
      return NextResponse.json({
        succes: true,
        message: 'Mot de passe administrateur initialisé et haché avec succès en base de données !',
      });
    }

    // Cas 2 : Vérification du mot de passe haché existant
    const estValide = ServiceHachageSecurise.verifierMotDePasse(motDePasseNet, config.motDePasseAdmin);

    if (estValide) {
      // Si le mot de passe en base était encore en clair (migration), le hacher maintenant
      if (!config.motDePasseAdmin.includes(':')) {
        const hashActuel = ServiceHachageSecurise.hacherMotDePasse(motDePasseNet);
        const nouvelleConfig = new ConfigurationEvenementEntite({
          ...config,
          motDePasseAdmin: hashActuel,
        });
        await depotConfig.sauvegarderConfiguration(nouvelleConfig);
      }

      await ServiceSessionAdmin.creerSession();
      ServiceJournalisation.tentativeConnexion('administrateur', true, ipClient);
      return NextResponse.json({ succes: true, message: 'Authentification réussie.' });
    } else {
      ServiceJournalisation.tentativeConnexion('administrateur', false, ipClient);
      return NextResponse.json(
        {
          succes: false,
          erreur: `Mot de passe administrateur incorrect. Tentatives restantes : ${verificationRate.tentativesRestantes}`,
        },
        { status: 401 }
      );
    }
  } catch (e: any) {
    ServiceJournalisation.erreurInterne('login', e);
    return NextResponse.json({ succes: false, erreur: 'Une erreur interne s\'est produite.' }, { status: 500 });
  }
}
