/**
 * Entité représentant le Ticket de Participation destiné à être converti en Image PNG
 */
export interface ParametresTicket {
  numeroTicket: string;
  nomCompletParticipant: string;
  nomEvenement: string;
  nomStand: string;
  horodatageTirage: string;
  dateEmission?: Date;
}

export class TicketEntite {
  public readonly numeroTicket: string;
  public readonly nomCompletParticipant: string;
  public readonly nomEvenement: string;
  public readonly nomStand: string;
  public readonly horodatageTirage: string;
  public readonly dateEmission: Date;

  constructor(parametres: ParametresTicket) {
    this.numeroTicket = parametres.numeroTicket;
    this.nomCompletParticipant = parametres.nomCompletParticipant;
    this.nomEvenement = parametres.nomEvenement;
    this.nomStand = parametres.nomStand;
    this.horodatageTirage = parametres.horodatageTirage;
    this.dateEmission = parametres.dateEmission || new Date();
  }
}
