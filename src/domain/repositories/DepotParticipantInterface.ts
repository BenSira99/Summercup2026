import { ParticipantEntite } from '../entities/ParticipantEntite';

/**
 * Interface du dépôt des participants avec tirage du jour
 */
export interface DepotParticipantInterface {
  enregistrerParticipant(participant: ParticipantEntite): Promise<ParticipantEntite>;
  obtenirTousLesParticipants(): Promise<ParticipantEntite[]>;
  obtenirParticipantsDuJour?(dateRef?: Date): Promise<ParticipantEntite[]>;
  selectionnerGagnantAleatoire(): Promise<ParticipantEntite | null>;
  selectionnerPlusieursGagnantsAleatoires?(nombre: number): Promise<ParticipantEntite[]>;
  marquerParticipantGagnant(idParticipant: string): Promise<ParticipantEntite>;
  viderTousLesParticipants(): Promise<void>;
  compterParticipants(): Promise<number>;
}
