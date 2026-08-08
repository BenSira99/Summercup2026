import { DepotParticipantInterface } from '@/domain/repositories/DepotParticipantInterface';
import { ParticipantEntite } from '@/domain/entities/ParticipantEntite';
import { GestionnaireBaseDeDonneesPostgres } from './BaseDeDonnees';

interface LigneParticipant {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  numero_ticket: string;
  date_inscription: string;
  est_gagnant: boolean;
  a_compte_cih?: boolean;
}

export class DepotParticipantPostgres implements DepotParticipantInterface {
  public async enregistrerParticipant(participant: ParticipantEntite): Promise<ParticipantEntite> {
    const db = await GestionnaireBaseDeDonneesPostgres.obtenirInstance();

    const dateIso = participant.dateInscription instanceof Date
      ? participant.dateInscription.toISOString()
      : new Date(participant.dateInscription).toISOString();

    await db.query(
      `INSERT INTO participants (id, nom, prenom, telephone, email, numero_ticket, date_inscription, est_gagnant, a_compte_cih)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        participant.id,
        participant.nom,
        participant.prenom,
        participant.telephone || '',
        participant.email || '',
        participant.numeroTicket,
        dateIso,
        participant.estGagnant,
        participant.aCompteCih,
      ]
    );

    return participant;
  }

  public async enregistrer(participant: ParticipantEntite): Promise<void> {
    await this.enregistrerParticipant(participant);
  }

  private static convertir(ligne: LigneParticipant): ParticipantEntite {
    return new ParticipantEntite({
      id: ligne.id,
      nom: ligne.nom,
      prenom: ligne.prenom,
      telephone: ligne.telephone,
      email: ligne.email,
      numeroTicket: ligne.numero_ticket,
      dateInscription: new Date(ligne.date_inscription),
      estGagnant: Boolean(ligne.est_gagnant),
      aCompteCih: Boolean(ligne.a_compte_cih),
    });
  }

  public async obtenirTousLesParticipants(): Promise<ParticipantEntite[]> {
    const db = await GestionnaireBaseDeDonneesPostgres.obtenirInstance();

    const resultat = await db.query<LigneParticipant>(
      `SELECT id, nom, prenom, COALESCE(telephone, '') as telephone, COALESCE(email, '') as email,
              numero_ticket, date_inscription, est_gagnant, COALESCE(a_compte_cih, FALSE) as a_compte_cih
       FROM participants ORDER BY date_inscription DESC`
    );

    return resultat.rows.map((ligne) => DepotParticipantPostgres.convertir(ligne));
  }

  /**
   * Obtient uniquement les participants inscrits le même jour que la date de référence (par défaut aujourd'hui)
   */
  public async obtenirParticipantsDuJour(dateRef: Date = new Date()): Promise<ParticipantEntite[]> {
    const tous = await this.obtenirTousLesParticipants();

    return tous.filter((p) => {
      const d = p.dateInscription instanceof Date ? p.dateInscription : new Date(p.dateInscription);
      return (
        d.getFullYear() === dateRef.getFullYear() &&
        d.getMonth() === dateRef.getMonth() &&
        d.getDate() === dateRef.getDate()
      );
    });
  }

  public async obtenirTous(): Promise<ParticipantEntite[]> {
    return this.obtenirTousLesParticipants();
  }

  public async trouverParId(id: string): Promise<ParticipantEntite | null> {
    const db = await GestionnaireBaseDeDonneesPostgres.obtenirInstance();

    const resultat = await db.query<LigneParticipant>(
      `SELECT id, nom, prenom, COALESCE(telephone, '') as telephone, COALESCE(email, '') as email,
              numero_ticket, date_inscription, est_gagnant, COALESCE(a_compte_cih, FALSE) as a_compte_cih
       FROM participants WHERE id = $1`,
      [id]
    );

    if (resultat.rows.length === 0) return null;
    return DepotParticipantPostgres.convertir(resultat.rows[0]);
  }

  public async trouverParNumeroTicket(numeroTicket: string): Promise<ParticipantEntite | null> {
    const db = await GestionnaireBaseDeDonneesPostgres.obtenirInstance();

    const resultat = await db.query<LigneParticipant>(
      `SELECT id, nom, prenom, COALESCE(telephone, '') as telephone, COALESCE(email, '') as email,
              numero_ticket, date_inscription, est_gagnant, COALESCE(a_compte_cih, FALSE) as a_compte_cih
       FROM participants WHERE numero_ticket = $1`,
      [numeroTicket]
    );

    if (resultat.rows.length === 0) return null;
    return DepotParticipantPostgres.convertir(resultat.rows[0]);
  }

  public async mefSupprimerParticipant(id: string): Promise<boolean> {
    const db = await GestionnaireBaseDeDonneesPostgres.obtenirInstance();
    await db.query(`DELETE FROM participants WHERE id = $1`, [id]);
    return true;
  }

  public async mefSupprimerPlusieurs(ids: string[]): Promise<boolean> {
    if (!ids || ids.length === 0) return true;
    const db = await GestionnaireBaseDeDonneesPostgres.obtenirInstance();
    for (const id of ids) {
      await db.query(`DELETE FROM participants WHERE id = $1`, [id]);
    }
    return true;
  }

  public async selectionnerGagnantAleatoire(): Promise<ParticipantEntite | null> {
    const gagnants = await this.selectionnerPlusieursGagnantsAleatoires(1);
    return gagnants.length > 0 ? gagnants[0] : null;
  }

  public async selectionnerPlusieursGagnantsAleatoires(nombre: number): Promise<ParticipantEntite[]> {
    // 1. Le tirage au sort s'effectue EXCLUSIVEMENT sur les inscrits du MÊME JOUR (Aujourd'hui)
    const inscritsDuJour = await this.obtenirParticipantsDuJour();
    if (inscritsDuJour.length === 0) return [];

    // 2. Privilégier les inscrits du jour qui n'ont PAS ENCORE GAGNÉ (est_gagnant = false)
    const nonGagnantsDuJour = inscritsDuJour.filter((p) => !p.estGagnant);
    const listeEligibles = nonGagnantsDuJour.length > 0 ? nonGagnantsDuJour : inscritsDuJour;

    // 3. Mélange de Fisher-Yates sur les candidats éligibles du jour
    const melanges = [...listeEligibles];
    for (let i = melanges.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [melanges[i], melanges[j]] = [melanges[j], melanges[i]];
    }

    const gagnantsChoisis = melanges.slice(0, Math.min(nombre, melanges.length));
    const gagnantsResultat: ParticipantEntite[] = [];

    for (const g of gagnantsChoisis) {
      const gMarque = await this.marquerParticipantGagnant(g.id);
      gagnantsResultat.push(gMarque);
    }

    return gagnantsResultat;
  }

  public async marquerParticipantGagnant(idParticipant: string): Promise<ParticipantEntite> {
    const db = await GestionnaireBaseDeDonneesPostgres.obtenirInstance();

    await db.query(`UPDATE participants SET est_gagnant = TRUE WHERE id = $1`, [idParticipant]);

    const gagnant = await this.trouverParId(idParticipant);
    if (!gagnant) {
      throw new Error(`Participant avec l'ID ${idParticipant} introuvable.`);
    }

    return gagnant;
  }

  public async reinitialiserGagnants(): Promise<void> {
    const db = await GestionnaireBaseDeDonneesPostgres.obtenirInstance();
    await db.query(`UPDATE participants SET est_gagnant = FALSE`);
  }

  public async viderTousLesParticipants(): Promise<void> {
    const db = await GestionnaireBaseDeDonneesPostgres.obtenirInstance();
    await db.query(`DELETE FROM participants`);
  }

  public async compterParticipants(): Promise<number> {
    const db = await GestionnaireBaseDeDonneesPostgres.obtenirInstance();
    const resultat = await db.query<{ count: string | number }>(
      `SELECT COUNT(*) as count FROM participants`
    );
    return parseInt(String(resultat.rows[0]?.count || '0'), 10);
  }
}

// Alias de compatibilité pour conserver la rétrocompatibilité des imports
export const DepotParticipantMySql = DepotParticipantPostgres;
