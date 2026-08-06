import 'server-only';
import { Pool, neonConfig } from '@neondatabase/serverless';

/**
 * Singleton de connexion Neon PostgreSQL Serverless (Vercel & Cloudflare Workers)
 *
 * Utilise le driver HTTP/WebSocket natif de @neondatabase/serverless.
 * Détection multi-source de DATABASE_URL pour compatibilité intégrale Cloudflare Workers env & process.env.
 */

neonConfig.poolQueryViaFetch = true;

export class GestionnaireBaseDeDonneesPostgres {
  private static pool: Pool | null = null;
  private static promesseInitialisation: Promise<Pool> | null = null;

  private static obtenirUrlBaseDeDonnees(): string | null {
    // 1. Détection standard process.env (Node.js & Vercel)
    if (process.env.DATABASE_URL) {
      return process.env.DATABASE_URL;
    }

    // 2. Détection contexte global Cloudflare Workers / Edge Runtime
    const g = globalThis as any;
    if (g.DATABASE_URL) {
      return g.DATABASE_URL;
    }
    if (g.__env__ && g.__env__.DATABASE_URL) {
      return g.__env__.DATABASE_URL;
    }
    if (g.process && g.process.env && g.process.env.DATABASE_URL) {
      return g.process.env.DATABASE_URL;
    }

    return null;
  }

  public static obtenirInstance(): Promise<Pool> {
    if (GestionnaireBaseDeDonneesPostgres.pool) {
      return Promise.resolve(GestionnaireBaseDeDonneesPostgres.pool);
    }

    if (GestionnaireBaseDeDonneesPostgres.promesseInitialisation) {
      return GestionnaireBaseDeDonneesPostgres.promesseInitialisation;
    }

    GestionnaireBaseDeDonneesPostgres.promesseInitialisation = (async () => {
      const urlConnexion = GestionnaireBaseDeDonneesPostgres.obtenirUrlBaseDeDonnees();
      if (!urlConnexion) {
        throw new Error(
          "La variable d'environnement DATABASE_URL est requise pour se connecter à la base Neon PostgreSQL."
        );
      }

      const pool = new Pool({ connectionString: urlConnexion });
      GestionnaireBaseDeDonneesPostgres.pool = pool;

      // Vérifie la connexion puis initialise le schéma SQL (idempotent)
      await pool.query('SELECT 1');
      await GestionnaireBaseDeDonneesPostgres.initialiserTables(pool);
      return pool;
    })();

    return GestionnaireBaseDeDonneesPostgres.promesseInitialisation;
  }

  private static async initialiserTables(pool: Pool): Promise<void> {
    // Table participants PostgreSQL avec contraintes CHECK & UNIQUE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS participants (
        id UUID PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        prenom VARCHAR(255) NOT NULL,
        telephone VARCHAR(255) NOT NULL DEFAULT '',
        email VARCHAR(255) NOT NULL DEFAULT '',
        numero_ticket VARCHAR(255) NOT NULL UNIQUE,
        date_inscription VARCHAR(255) NOT NULL,
        est_gagnant BOOLEAN NOT NULL DEFAULT FALSE,
        CONSTRAINT check_nom_au_moins_2_lettres CHECK (LENGTH(TRIM(nom)) >= 2),
        CONSTRAINT check_prenom_au_moins_2_lettres CHECK (LENGTH(TRIM(prenom)) >= 2),
        CONSTRAINT check_numero_ticket_format CHECK (numero_ticket LIKE 'TK-%')
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_participants_est_gagnant ON participants(est_gagnant)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_participants_date_inscription ON participants(date_inscription DESC)
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS configuration (
        cle VARCHAR(255) PRIMARY KEY,
        valeur TEXT NOT NULL
      )
    `);
  }
}

// Alias de rétrocompatibilité pour les anciens tests et modules
export const GestionnaireBaseDeDonneesMySql = GestionnaireBaseDeDonneesPostgres;
