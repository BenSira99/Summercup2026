import { ParticipantEntite, ParametresParticipant } from '../domain/entities/ParticipantEntite';
import { DepotParticipantInterface } from '../domain/repositories/DepotParticipantInterface';
import { DepotConfigurationInterface } from '../domain/repositories/DepotConfigurationInterface';
import { TicketEntite } from '../domain/entities/TicketEntite';

export interface ResultatSoumettreParticipation {
  participant: ParticipantEntite;
  ticket: TicketEntite;
}

export class SoumettreParticipationUseCase {
  constructor(
    private depotParticipant: DepotParticipantInterface,
    private depotConfiguration: DepotConfigurationInterface
  ) {}

  public async executer(parametres: ParametresParticipant): Promise<ResultatSoumettreParticipation> {
    // 1. Instanciation et validation des champs du Participant (Nom, Prénom, Téléphone, Email)
    const nouveauParticipant = new ParticipantEntite(parametres);

    // 2. Sauvegarde dans le dépôt
    const participantEnregistre = await this.depotParticipant.enregistrerParticipant(nouveauParticipant);

    // 3. Récupération de la configuration courante pour construire le Ticket
    const configuration = await this.depotConfiguration.obteinirConfiguration();

    // 4. Génération de l'Entité Ticket de participation
    const ticket = new TicketEntite({
      numeroTicket: participantEnregistre.numeroTicket,
      nomCompletParticipant: participantEnregistre.obtenirNomComplet(),
      nomEvenement: configuration.nomEvenement,
      nomStand: configuration.nomStand,
      horodatageTirage: configuration.obtenirHorodatageCompletTirage(),
      dateEmission: new Date(),
    });

    return {
      participant: participantEnregistre,
      ticket: ticket,
    };
  }
}
