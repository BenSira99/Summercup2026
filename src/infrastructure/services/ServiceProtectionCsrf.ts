import 'server-only';
import { NextRequest } from 'next/server';

/**
 * Protection CSRF (CWE-352) pour les mutations API.
 *
 * Principe : pour toute requête de type POST / PUT / DELETE / PATCH, un navigateur
 * envoie systématiquement l'en-tête `Origin`. On rejette la requête si l'origine
 * ne correspond pas exactement à l'hôte servi (comparaison Origin ↔ Host).
 * → "Fail closed" : une requête sans en-tête Origin est refusée.
 */
export class ServiceProtectionCsrf {
  public static verifierOrigine(requete: NextRequest): boolean {
    const origine = requete.headers.get('origin');
    const hote = requete.headers.get('host');

    if (!origine || !hote) return false;

    try {
      const urlOrigine = new URL(origine);
      return urlOrigine.host === hote;
    } catch {
      return false;
    }
  }
}
