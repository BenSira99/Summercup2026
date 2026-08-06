import { ParticipantEntite } from '../domain/entities/ParticipantEntite';
import { DepotParticipantInterface } from '../domain/repositories/DepotParticipantInterface';

export class TirerGagnantAleatoireUseCase {
  constructor(private depotParticipant: DepotParticipantInterface) {}

  public async executer(): Promise<ParticipantEntite> {
    const gagnants = await this.executerPlusieurs(1);
    if (gagnants.length === 0) {
      throw new Error("Aucun participant disponible pour le tirage au sort.");
    }
    return gagnants[0];
  }

  public async executerPlusieurs(nombre: number = 1): Promise<ParticipantEntite[]> {
    if (this.depotParticipant.selectionnerPlusieursGagnantsAleatoires) {
      return await this.depotParticipant.selectionnerPlusieursGagnantsAleatoires(nombre);
    }

    const participants = await this.depotParticipant.obtenirTousLesParticipants();
    if (!participants || participants.length === 0) {
      return [];
    }

    const participantsEligibles = participants.filter(p => !p.estGagnant);
    const listeFinale = participantsEligibles.length > 0 ? participantsEligibles : participants;

    // Mélange aléatoire
    const melanges = [...listeFinale];
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
