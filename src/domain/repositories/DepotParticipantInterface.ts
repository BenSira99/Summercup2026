import { ParticipantEntite } from '../entities/ParticipantEntite';

/**
 * Interface du dépôt des participants (Nom et Prénom uniquement)
 */
export interface DepotParticipantInterface {
  enregistrerParticipant(participant: ParticipantEntite): Promise<ParticipantEntite>;
  obtenirTousLesParticipants(): Promise<ParticipantEntite[]>;
  selectionnerGagnantAleatoire(): Promise<ParticipantEntite | null>;
  selectionnerPlusieursGagnantsAleatoires?(nombre: number): Promise<ParticipantEntite[]>;
  marquerParticipantGagnant(idParticipant: string): Promise<ParticipantEntite>;
  viderTousLesParticipants(): Promise<void>;
  compterParticipants(): Promise<number>;
}
