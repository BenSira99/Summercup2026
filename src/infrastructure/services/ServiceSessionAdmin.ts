import 'server-only';
import crypto from 'crypto';
import { cookies } from 'next/headers';

/**
 * Service de session administrateur (A07 — Authentification & Sessions sécurisées).
 *
 * Les sessions sont stockées côté serveur (jamais dans le localStorage du navigateur,
 * cf. documentation sécurité OWASP / Next.js) et le jeton est transmis via un cookie
 * HttpOnly + Secure + SameSite=Lax, inaccessible au JavaScript (protection XSS).
 */
export class ServiceSessionAdmin {
  private static readonly NOM_COOKIE_SESSION = 'session_admin';
  private static readonly DUREE_SESSION_MS =
    (Number(process.env.SESSION_DUREE_HEURES) || 8) * 60 * 60 * 1000;

  private static sessions = new Map<string, number>();

  /**
   * Crée une session serveur et positionne le cookie de session HttpOnly.
   */
  public static async creerSession(): Promise<void> {
    this.nettoyerSessionsExpirees();

    const jeton = crypto.randomBytes(32).toString('hex');
    this.sessions.set(jeton, Date.now() + ServiceSessionAdmin.DUREE_SESSION_MS);

    const cookieStore = await cookies();
    cookieStore.set(ServiceSessionAdmin.NOM_COOKIE_SESSION, jeton, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ServiceSessionAdmin.DUREE_SESSION_MS / 1000,
    });
  }

  /**
   * Vérifie que la requête porte bien une session administrateur valide.
   * → Doit être appelée dans TOUTES les Route Handlers protégées (défense en profondeur,
   *   jamais uniquement dans le middleware/proxy — leçon CVE-2025-29927).
   */
  public static async verifierSession(): Promise<boolean> {
    const cookieStore = await cookies();
    const jeton = cookieStore.get(ServiceSessionAdmin.NOM_COOKIE_SESSION)?.value;
    if (!jeton) return false;

    const expiration = ServiceSessionAdmin.sessions.get(jeton);
    if (!expiration) return false;

    if (Date.now() > expiration) {
      ServiceSessionAdmin.sessions.delete(jeton);
      return false;
    }

    return true;
  }

  /**
   * Détruit la session courante (déconnexion) et supprime le cookie.
   */
  public static async supprimerSession(): Promise<void> {
    const cookieStore = await cookies();
    const jeton = cookieStore.get(ServiceSessionAdmin.NOM_COOKIE_SESSION)?.value;
    if (jeton) {
      ServiceSessionAdmin.sessions.delete(jeton);
    }
    cookieStore.delete(ServiceSessionAdmin.NOM_COOKIE_SESSION);
  }

  /**
   * Nettoyage mémoire des sessions expirées (CWE-400 — Resource Exhaustion).
   */
  private static nettoyerSessionsExpirees(): void {
    const maintenant = Date.now();
    for (const [jeton, expiration] of ServiceSessionAdmin.sessions) {
      if (maintenant > expiration) {
        ServiceSessionAdmin.sessions.delete(jeton);
      }
    }
  }
}
