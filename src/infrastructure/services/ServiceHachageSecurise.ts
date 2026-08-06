import 'server-only';
import crypto from 'crypto';

/**
 * Service de hachage sécurisé pour les mots de passe avec Salt aléatoire et PBKDF2 (SHA-512)
 */
export class ServiceHachageSecurise {
  /**
   * Hache un mot de passe en clair avec un Salt unique de 16 octets
   */
  public static hacherMotDePasse(motDePasseClair: string): string {
    if (!motDePasseClair) return '';
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(motDePasseClair, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  /**
   * Vérifie si un mot de passe en clair correspond au Hash sécurisé enregistré
   */
  public static verifierMotDePasse(motDePasseClair: string, hashEnregistre: string): boolean {
    if (!motDePasseClair || !hashEnregistre) return false;

    // Si le mot de passe en base est encore sous forme non-hachée (migration initiale fallback), faire la comparaison directe
    if (!hashEnregistre.includes(':')) {
      return motDePasseClair === hashEnregistre;
    }

    const [salt, originalHash] = hashEnregistre.split(':');
    const hashTeste = crypto.pbkdf2Sync(motDePasseClair, salt, 10000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(hashTeste, 'hex'));
  }
}
