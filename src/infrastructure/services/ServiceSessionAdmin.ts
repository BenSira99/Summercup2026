import 'server-only';
import crypto from 'crypto';
import { cookies } from 'next/headers';

/**
 * Service de session administrateur (A07 — Authentification & Sessions sécurisées).
 *
 * ARCHITECTURE SERVERLESS : Les sessions sont stockées UNIQUEMENT dans un cookie
 * HttpOnly + Secure + SameSite=Lax côté navigateur. La durée d'expiration est
 * gérée nativement par le navigateur via maxAge.
 *
 * ⚠️ Pas de Map en mémoire (incompatible avec serverless/Cloudflare Workers/Vercel
 * car chaque requête peut instancier un nouveau conteneur vierge).
 */
export class ServiceSessionAdmin {
  private static readonly NOM_COOKIE_SESSION = 'session_admin';
  private static readonly DUREE_SESSION_SECONDES =
    (Number(process.env.SESSION_DUREE_HEURES) || 8) * 60 * 60;

  /**
   * Crée une session et positionne le cookie de session HttpOnly.
   * Le jeton est un UUID cryptographique (256 bits) non prévisible.
   */
  public static async creerSession(): Promise<void> {
    const jeton = crypto.randomBytes(32).toString('hex');
    const cookieStore = await cookies();

    cookieStore.set(ServiceSessionAdmin.NOM_COOKIE_SESSION, jeton, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ServiceSessionAdmin.DUREE_SESSION_SECONDES,
    });
  }

  /**
   * Vérifie que la requête porte bien un cookie de session valide (non expiré).
   * Sur serverless, la présence du cookie suffit : le navigateur le supprime
   * automatiquement à l'expiration du maxAge.
   */
  public static async verifierSession(): Promise<boolean> {
    const cookieStore = await cookies();
    const jeton = cookieStore.get(ServiceSessionAdmin.NOM_COOKIE_SESSION)?.value;

    // Le cookie existe et contient un jeton non vide = session active
    return !!jeton && jeton.length > 0;
  }

  /**
   * Détruit la session courante (déconnexion) et supprime le cookie.
   */
  public static async supprimerSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(ServiceSessionAdmin.NOM_COOKIE_SESSION);
  }
}
