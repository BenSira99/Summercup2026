import 'server-only';

/**
 * Service de Rate Limiting en mémoire (Sliding Window) pour la protection anti-brute force
 */
interface EntreeRateLimit {
  compteur: number;
  resetAt: number;
}

export class ServiceRateLimit {
  private static tentatives = new Map<string, EntreeRateLimit>();

  /**
   * Vérifie si une clé (IP / identifiant + action) a dépassé la limite autorisée
   */
  public static verifierOuBloquer(
    cleIdentifiant: string,
    limiteMax: number = 5,
    fenetreEnSecondes: number = 60
  ): { autorise: boolean; tentativesRestantes: number; attenteSecondes: number } {
    ServiceRateLimit.nettoyerEntreesExpirees();

    const maintenant = Date.now();
    const entree = this.tentatives.get(cleIdentifiant);

    if (!entree || maintenant > entree.resetAt) {
      this.tentatives.set(cleIdentifiant, {
        compteur: 1,
        resetAt: maintenant + fenetreEnSecondes * 1000,
      });
      return { autorise: true, tentativesRestantes: limiteMax - 1, attenteSecondes: 0 };
    }

    if (entree.compteur >= limiteMax) {
      const attenteMs = Math.max(0, entree.resetAt - maintenant);
      return {
        autorise: false,
        tentativesRestantes: 0,
        attenteSecondes: Math.ceil(attenteMs / 1000),
      };
    }

    entree.compteur += 1;
    this.tentatives.set(cleIdentifiant, entree);

    return {
      autorise: true,
      tentativesRestantes: limiteMax - entree.compteur,
      attenteSecondes: 0,
    };
  }

  /**
   * Nettoie les entrées expirées pour éviter la fuite mémoire sur le long terme (CWE-400)
   */
  private static nettoyerEntreesExpirees(): void {
    const maintenant = Date.now();
    for (const [cle, entree] of ServiceRateLimit.tentatives) {
      if (maintenant > entree.resetAt) {
        ServiceRateLimit.tentatives.delete(cle);
      }
    }
  }
}
