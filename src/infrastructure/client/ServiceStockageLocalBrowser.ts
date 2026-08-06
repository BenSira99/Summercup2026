import { ParametresParticipant } from '../../domain/entities/ParticipantEntite';

const CLE_STOCKAGE_PARTICIPANTS_ATTENTE = 'stand_participations_en_attente';
const CLE_TICKET_COURANT = 'stand_ticket_courant_enregistre';

export class ServiceStockageLocalBrowser {
  public static enregistrerParticipationEnAttente(donnees: ParametresParticipant): void {
    if (typeof window === 'undefined') return;

    try {
      const anciennes = ServiceStockageLocalBrowser.obtenirParticipationsEnAttente();
      anciennes.push(donnees);
      localStorage.setItem(CLE_STOCKAGE_PARTICIPANTS_ATTENTE, JSON.stringify(anciennes));
    } catch (erreur) {
      console.error("Erreur de sauvegarde locale dans le navigateur:", erreur);
    }
  }

  public static obtenirParticipationsEnAttente(): ParametresParticipant[] {
    if (typeof window === 'undefined') return [];

    try {
      const brut = localStorage.getItem(CLE_STOCKAGE_PARTICIPANTS_ATTENTE);
      return brut ? JSON.parse(brut) : [];
    } catch (erreur) {
      return [];
    }
  }

  public static viderParticipationsEnAttente(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(CLE_STOCKAGE_PARTICIPANTS_ATTENTE);
  }

  public static enregistrerTicketCourant(ticket: any): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CLE_TICKET_COURANT, JSON.stringify(ticket));
    } catch (e) {}
  }

  public static obtenirTicketCourant(): any | null {
    if (typeof window === 'undefined') return null;
    try {
      const brut = localStorage.getItem(CLE_TICKET_COURANT);
      return brut ? JSON.parse(brut) : null;
    } catch (e) {
      return null;
    }
  }
}
