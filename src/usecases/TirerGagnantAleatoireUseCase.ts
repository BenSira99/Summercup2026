import { ParticipantEntite } from '../domain/entities/ParticipantEntite';
import { DepotParticipantInterface } from '../domain/repositories/DepotParticipantInterface';

export class TirerGagnantAleatoireUseCase {
  constructor(private depotParticipant: DepotParticipantInterface) {}

  public async executer(): Promise<ParticipantEntite> {
    const gagnants = await this.executerPlusieurs(1);
    if (gagnants.length === 0) {
      throw new Error("Aucun participant inscrit aujourd'hui n'est disponible pour le tirage au sort.");
    }
    return gagnants[0];
  }

  public async executerPlusieurs(nombre: number = 1): Promise<ParticipantEntite[]> {
    if (this.depotParticipant.selectionnerPlusieursGagnantsAleatoires) {
      return await this.depotParticipant.selectionnerPlusieursGagnantsAleatoires(nombre);
    }

    const aujourdhui = new Date();
    const tous = await this.depotParticipant.obtenirTousLesParticipants();
    if (!tous || tous.length === 0) {
      return [];
    }

    // 1. Filtrer exclusivement les participants inscrits le jour même (aujourd'hui)
    const participantsJour = tous.filter((p) => {
      const d = p.dateInscription instanceof Date ? p.dateInscription : new Date(p.dateInscription);
      return (
        d.getFullYear() === aujourdhui.getFullYear() &&
        d.getMonth() === aujourdhui.getMonth() &&
        d.getDate() === aujourdhui.getDate()
      );
    });

    if (participantsJour.length === 0) {
      return [];
    }

    // 2. Filtrer en priorité ceux qui n'ont pas encore gagné
    const nonGagnantsJour = participantsJour.filter((p) => !p.estGagnant);
    const listeEligibles = nonGagnantsJour.length > 0 ? nonGagnantsJour : participantsJour;

    // 3. Mélange aléatoire de Fisher-Yates sur la sélection du jour
    const melanges = [...listeEligibles];
    for (let i = melanges.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [melanges[i], melanges[j]] = [melanges[j], melanges[i]];
    }

    const selec = melanges.slice(0, Math.min(nombre, melanges.length));
    const resultats: ParticipantEntite[] = [];

    for (const g of selec) {
      const res = await this.depotParticipant.marquerParticipantGagnant(g.id);
      resultats.push(res);
    }

    return resultats;
  }
}
