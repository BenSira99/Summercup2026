import 'server-only';
import { Pool, neonConfig } from '@neondatabase/serverless';

/**
 * Singleton de connexion Neon PostgreSQL Serverless (Vercel & Cloudflare)
 *
 * Utilise le driver HTTP/WebSocket natif de @neondatabase/serverless.
 * Sur Cloudflare/Vercel : poolQueryViaFetch = true utilise fetch() HTTP.
 *
 * DATABASE_URL : postgresql://user:pass@ep-xxx.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require
 */

neonConfig.poolQueryViaFetch = true;

export class GestionnaireBaseDeDonneesPostgres {
  private static pool: Pool | null = null;
  private static promesseInitialisation: Promise<Pool> | null = null;

  public static obtenirInstance(): Promise<Pool> {
    if (GestionnaireBaseDeDonneesPostgres.pool) {
      return Promise.resolve(GestionnaireBaseDeDonneesPostgres.pool);
    }

    if (GestionnaireBaseDeDonneesPostgres.promesseInitialisation) {
      return GestionnaireBaseDeDonneesPostgres.promesseInitialisation;
    }

    GestionnaireBaseDeDonneesPostgres.promesseInitialisation = (async () => {
      const urlConnexion = process.env.DATABASE_URL;
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
