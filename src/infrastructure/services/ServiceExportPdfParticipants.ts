import { jsPDF } from 'jspdf';
import { ParticipantAdmin, ConfigurationAdmin } from '@/presentation/components/DashboardGerant';

export class ServiceExportPdfParticipants {
  public static async exporterRapportParticipantsPdf(
    participants: ParticipantAdmin[],
    config: ConfigurationAdmin
  ): Promise<void> {
    const doc = new jsPDF({
      orientation: 'landscape', // Format Paysage pour afficher confortablement toutes les colonnes (Nom, Prénom, Téléphone, Email, CIH, Ticket, Date)
      unit: 'mm',
      format: 'a4',
    });

    const largeurPage = 297; // A4 Paysage
    const hauteurPage = 210;
    const margeGauche = 12;
    const margeDroite = 12;
    const largeurUtile = largeurPage - margeGauche - margeDroite; // 273mm

    const hauteurLigneTableau = 8;
    const enteteHauteur = 9;
    const yDebutTableauConst = 42;
    const yMaxPage = hauteurPage - 15; // 195mm

    // Calcul du nombre de lignes par page
    const lignesParPage = Math.floor((yMaxPage - yDebutTableauConst - enteteHauteur) / hauteurLigneTableau);
    const nombrePagesTotal = Math.ceil(participants.length / lignesParPage) || 1;

    let indexParticipant = 0;

    for (let pageNum = 1; pageNum <= nombrePagesTotal; pageNum++) {
      if (pageNum > 1) {
        doc.addPage();
      }

      // 1. En-tête de Page Royale
      doc.setFillColor(15, 23, 42); // Slate-950
      doc.rect(0, 0, largeurPage, 20, 'F');

      // Titre principal
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(245, 158, 11); // Or Royal (#f59e0b)
      doc.text(config.nomEvenement.toUpperCase(), margeGauche, 10.5);

      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text(`Stand : ${config.nomStand}  |  Tirage au Sort : ${config.dateTirage} à ${config.heureTirage}`, margeGauche, 15.5);

      // Date de génération & Numéro de page
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Édité le ${new Date().toLocaleDateString('fr-FR')} - Page ${pageNum} sur ${nombrePagesTotal}`, largeurPage - margeDroite, 15.5, { align: 'right' });

      // 2. Sous-titre du rapport
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`LISTE OFFICIELLE DES PARTICIPANTS (${participants.length} INSCRIT(S))`, margeGauche, 29);

      doc.setDrawColor(245, 158, 11);
      doc.setLineWidth(0.6);
      doc.line(margeGauche, 32, largeurPage - margeDroite, 32);

      // 3. En-tête du Tableau avec Téléphone, Email & Compte CIH
      let currentY = 36;
      doc.setFillColor(30, 41, 59); // Slate-800
      doc.rect(margeGauche, currentY, largeurUtile, enteteHauteur, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);

      // Largeurs des colonnes en paysage (Total 273mm)
      const wPos = 8;
      const wTicket = 34;
      const wNom = 48;
      const wTel = 36;
      const wEmail = 55;
      const wCih = 24;
      const wDate = 42;
      const wStatut = 26;

      let posX = margeGauche + 2;
      doc.text('#', posX, currentY + 6);
      posX += wPos;

      doc.text('NUMÉRO TICKET', posX, currentY + 6);
      posX += wTicket;

      doc.text('PRÉNOM & NOM', posX, currentY + 6);
      posX += wNom;

      doc.text('TÉLÉPHONE', posX, currentY + 6);
      posX += wTel;

      doc.text('EMAIL', posX, currentY + 6);
      posX += wEmail;

      doc.text('COMPTE CIH', posX, currentY + 6);
      posX += wCih;

      doc.text('DATE D\'INSCRIPTION', posX, currentY + 6);
      posX += wDate;

      doc.text('STATUT', posX, currentY + 6);

      currentY += enteteHauteur;

      // 4. Lignes du Tableau
      let ligneSurPageCount = 0;

      while (indexParticipant < participants.length && ligneSurPageCount < lignesParPage) {
        const p = participants[indexParticipant];
        const numOrdre = indexParticipant + 1;

        // Couleur de fond alternée (Zebra Striping)
        if (numOrdre % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margeGauche, currentY, largeurUtile, hauteurLigneTableau, 'F');
        }

        // Bordure inférieure fine
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);
        doc.line(margeGauche, currentY + hauteurLigneTableau, largeurPage - margeDroite, currentY + hauteurLigneTableau);

        doc.setFontSize(8);
        posX = margeGauche + 2;

        // Index
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(String(numOrdre), posX, currentY + 5.5);
        posX += wPos;

        // Ticket
        doc.setFont('courier', 'bold');
        doc.setTextColor(180, 83, 9);
        doc.text(p.numeroTicket, posX, currentY + 5.5);
        posX += wTicket;

        // Prénom & Nom
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        const nomComplet = `${p.prenom} ${p.nom}`;
        doc.text(nomComplet.length > 22 ? nomComplet.substring(0, 20) + '...' : nomComplet, posX, currentY + 5.5);
        posX += wNom;

        // Téléphone
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        doc.text(p.telephone || '-', posX, currentY + 5.5);
        posX += wTel;

        // Email
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        const mail = p.email || '-';
        doc.text(mail.length > 26 ? mail.substring(0, 24) + '...' : mail, posX, currentY + 5.5);
        posX += wEmail;

        // Compte CIH (Oui / Non)
        doc.setFont('helvetica', 'bold');
        if (p.aCompteCih) {
          doc.setTextColor(16, 185, 129); // Vert Émeraude
          doc.text('Oui (CIH)', posX, currentY + 5.5);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(148, 163, 184);
          doc.text('Non', posX, currentY + 5.5);
        }
        posX += wCih;

        // Date Inscription
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        const dFr = new Date(p.dateInscription).toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        doc.text(dFr, posX, currentY + 5.5);
        posX += wDate;

        // Statut
        if (p.estGagnant) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(217, 119, 6);
          doc.text('🏆 GAGNANT', posX, currentY + 5.5);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(148, 163, 184);
          doc.text('Inscrit', posX, currentY + 5.5);
        }

        currentY += hauteurLigneTableau;
        indexParticipant++;
        ligneSurPageCount++;
      }

      // 5. Pied de Page
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(margeGauche, hauteurPage - 10, largeurPage - margeDroite, hauteurPage - 10);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('Document d\'administration confidentiel - Tirage au Sort Royal', margeGauche, hauteurPage - 5);
    }

    // Sauvegarde du fichier PDF multipage
    const nomFichier = `Rapport-Participants-${config.nomStand.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(nomFichier);
  }
}
