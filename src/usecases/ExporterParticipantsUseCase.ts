import { DepotParticipantInterface } from '../domain/repositories/DepotParticipantInterface';

export class ExporterParticipantsUseCase {
  constructor(private depotParticipant: DepotParticipantInterface) {}

  /**
   * Échappe rigoureusement chaque cellule pour empêcher la CSV Formula Injection (CWE-1236)
   */
  private echapperCelluleCsv(valeur: string): string {
    let v = (valeur || '').replace(/"/g, '""');
    // Protection anti-CSV Formula Injection (CWE-1236) : Désamorce les symboles d'exécution Excel/Calc
    if (/^[=+\-@\t\r]/.test(v)) {
      v = "'" + v;
    }
    return `"${v}"`;
  }

  public async executerEnFormatCsv(): Promise<string> {
    const participants = await this.depotParticipant.obtenirTousLesParticipants();

    const enTetes = ["ID", "Numéro Ticket", "Nom", "Prénom", "Téléphone", "Email", "Compte CIH", "Date Inscription", "Statut Gagnant"];
    const lignesCsv: string[] = [enTetes.join(",")];

    for (const p of participants) {
      const ligne = [
        this.echapperCelluleCsv(p.id),
        this.echapperCelluleCsv(p.numeroTicket),
        this.echapperCelluleCsv(p.nom),
        this.echapperCelluleCsv(p.prenom),
        this.echapperCelluleCsv(p.telephone || ''),
        this.echapperCelluleCsv(p.email || ''),
        this.echapperCelluleCsv(p.aCompteCih ? "Oui" : "Non"),
        this.echapperCelluleCsv(new Date(p.dateInscription).toLocaleString('fr-FR')),
        this.echapperCelluleCsv(p.estGagnant ? "GAGNANT" : "Participant")
      ];
      lignesCsv.push(ligne.join(","));
    }

    return lignesCsv.join("\n");
  }

  public async executer(): Promise<string> {
    return this.executerEnFormatCsv();
  }
}
