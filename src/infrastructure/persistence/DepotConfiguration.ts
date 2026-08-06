import { DepotConfigurationInterface } from '@/domain/repositories/DepotConfigurationInterface';
import { ConfigurationEvenementEntite } from '@/domain/entities/ConfigurationEvenementEntite';
import { GestionnaireBaseDeDonneesPostgres } from './BaseDeDonnees';

export class DepotConfigurationPostgres implements DepotConfigurationInterface {
  public async obteinirConfiguration(): Promise<ConfigurationEvenementEntite> {
    const db = await GestionnaireBaseDeDonneesPostgres.obtenirInstance();

    const resultat = await db.query<{ cle: string; valeur: string }>(`SELECT cle, valeur FROM configuration`);

    const carte = new Map<string, string>();
    resultat.rows.forEach((row) => {
      carte.set(row.cle, row.valeur);
    });

    let lotsParRang: string[] = [];
    try {
      const brutLots = carte.get('lotsParRang');
      if (brutLots) {
        lotsParRang = JSON.parse(brutLots);
      }
    } catch (e) { }

    const nombreGagnantsPrevu = parseInt(carte.get('nombreGagnantsPrevu') || '1', 10);

    return new ConfigurationEvenementEntite({
      nomEvenement: carte.get('nomEvenement') || 'Grand Tirage',
      nomStand: carte.get('nomStand') || 'Stand Prestige',
      descriptionLot: carte.get('descriptionLot') || 'Un iPad Pro avec ses accessoires de luxe',
      dateTirage: carte.get('dateTirage') || "Aujourd'hui",
      heureTirage: carte.get('heureTirage') || '17h00',
      motDePasseAdmin: carte.get('motDePasseAdmin') || '',
      nombreGagnantsPrevu: isNaN(nombreGagnantsPrevu) ? 1 : nombreGagnantsPrevu,
      lotsParRang: lotsParRang.length > 0 ? lotsParRang : [carte.get('descriptionLot') || 'Des lots à gagner'],
    });
  }

  public async enregistrerConfiguration(config: ConfigurationEvenementEntite): Promise<ConfigurationEvenementEntite> {
    const db = await GestionnaireBaseDeDonneesPostgres.obtenirInstance();

    const entrees = [
      ['nomEvenement', config.nomEvenement],
      ['nomStand', config.nomStand],
      ['descriptionLot', config.descriptionLot],
      ['dateTirage', config.dateTirage],
      ['heureTirage', config.heureTirage],
      ['motDePasseAdmin', config.motDePasseAdmin],
      ['nombreGagnantsPrevu', config.nombreGagnantsPrevu.toString()],
      ['lotsParRang', JSON.stringify(config.lotsParRang || [])],
    ];

    for (const [cle, valeur] of entrees) {
      await db.query(
        `INSERT INTO configuration (cle, valeur)
         VALUES ($1, $2)
         ON CONFLICT (cle) DO UPDATE SET valeur = EXCLUDED.valeur`,
        [cle, valeur]
      );
    }

    return config;
  }

  public async sauvegarderConfiguration(config: ConfigurationEvenementEntite): Promise<void> {
    await this.enregistrerConfiguration(config);
  }
}

// Alias de compatibilité pour conserver la rétrocompatibilité des imports
export const DepotConfigurationMySql = DepotConfigurationPostgres;
