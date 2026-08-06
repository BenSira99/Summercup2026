import 'server-only';

/**
 * Journalisation structurée des événements de sécurité (A09 — Security Logging & Alerting).
 *
 * - Sortie JSON structurée (contexte, événement, horodatage)
 * - Rédaction automatique des données sensibles (mots de passe, jetons, cookies…)
 * - Aucune donnée PII sensible hors contexte d'audit
 */
export class ServiceJournalisation {
  private static clesSensibles = [
    'motdepasse',
    'password',
    'token',
    'jeton',
    'authorization',
    'cookie',
    'secret',
    'apikey',
    'clesecrete',
  ];

  private static masquerSecrets(objet: Record<string, unknown>): Record<string, unknown> {
    const resultat: Record<string, unknown> = {};
    for (const [cle, valeur] of Object.entries(objet || {})) {
      const cleMinuscule = cle.toLowerCase();
      const estSensible = ServiceJournalisation.clesSensibles.some((s) =>
        cleMinuscule.includes(s)
      );
      if (estSensible && typeof valeur === 'string' && valeur.length > 0) {
        resultat[cle] = '[REDACTED]';
      } else {
        resultat[cle] = valeur;
      }
    }
    return resultat;
  }

  private static emettre(
    niveau: 'info' | 'avertir' | 'erreur',
    evenement: string,
    details?: Record<string, unknown>
  ): void {
    const message = {
      niveau,
      evenement,
      horodatage: new Date().toISOString(),
      ...(details ? ServiceJournalisation.masquerSecrets(details) : {}),
    };

    if (niveau === 'info') console.info(JSON.stringify(message));
    else if (niveau === 'avertir') console.warn(JSON.stringify(message));
    else console.error(JSON.stringify(message));
  }

  /** Tentative de connexion réussie ou échouée (A07 — pas de révélation d'existence d'un email) */
  public static tentativeConnexion(email: string, succes: boolean, ip: string): void {
    this.emettre(succes ? 'info' : 'avertir', 'auth.login', {
      email,
      succes,
      ip,
    });
  }

  /** Accès refusé à une ressource protégée (A01 — Broken Access Control) */
  public static accesRefuse(ressource: string, ip: string): void {
    this.emettre('avertir', 'access.denied', { ressource, ip });
  }

  /** Action administrative sensible (audit trail) */
  public static actionAdministrateur(action: string, ip: string): void {
    this.emettre('info', 'admin.action', { action, ip });
  }

  /** Erreur inattendue — détails internes jamais exposés au client (A10) */
  public static erreurInterne(action: string, erreur: unknown): void {
    this.emettre('erreur', 'error.unexpected', {
      action,
      message: erreur instanceof Error ? erreur.message : 'Erreur inconnue',
    });
  }
}
