import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export interface ParametresAffichePdf {
  urlInscription: string;
  nomEvenement: string;
  nomStand: string;
  descriptionLot?: string;
  dateTirage: string;
  heureTirage: string;
}

export class ServiceGenerateurPdfAffiche {
  public static async genererEtTelechargerPdfA4(parametres: ParametresAffichePdf): Promise<void> {
    // 1. Initialisation du document PDF A4 vectoriel natif (210mm x 297mm)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const largeurPage = 210;
    const hauteurPage = 297;
    const centreX = largeurPage / 2;

    // 2. Création du Cadre Double d'Élégance Royale
    // Bordure Extérieure Or Royal (#f59e0b)
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(1.4);
    doc.rect(7, 7, largeurPage - 14, hauteurPage - 14);

    // Bordure Intérieure Bleu Roi Slate (#0f172a)
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.6);
    doc.rect(9, 9, largeurPage - 18, hauteurPage - 18);

    // 3. Header Bandeau Supérieur du Stand
    const hauteurBandeau = 16;
    const posYBandeau = 18;
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(18, posYBandeau, largeurPage - 36, hauteurBandeau, 4, 4, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(245, 158, 11); // Couleur Or
    doc.text(parametres.nomStand.toUpperCase(), centreX, posYBandeau + 10.5, { align: 'center' });

    // 4. Titre de l'Événement (Taille dynamique pour éviter tout débordement)
    const texteEvenement = parametres.nomEvenement.toUpperCase();
    let taillePoliceTitre = 26;
    if (texteEvenement.length > 25) taillePoliceTitre = 22;
    if (texteEvenement.length > 35) taillePoliceTitre = 18;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(taillePoliceTitre);
    doc.setTextColor(15, 23, 42);
    doc.text(texteEvenement, centreX, 54, { align: 'center' });

    // (Remarque : Le texte des lots a été supprimé à la demande explicite de l'utilisateur)

    // 5. Ligne Séparatrice Décorative
    const posYLigne = 66;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.6);
    doc.line(30, posYLigne, largeurPage - 30, posYLigne);

    // 6. Consigne d'Action Call-To-Action (Scannez le QR Code)
    const posYCallToAction = posYLigne + 14;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text("SCANNEZ LE QR CODE CI-DESSOUS", centreX, posYCallToAction, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Pour vous inscrire instantanément au tirage au sort sur votre smartphone", centreX, posYCallToAction + 8, { align: 'center' });

    // 7. Génération du GROS QR Code Haute Définition (300 DPI)
    const qrDataUrl = await QRCode.toDataURL(parametres.urlInscription, {
      margin: 1,
      width: 1000,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    // Dimension et Centrage Parfait du QR Code
    const tailleQr = 106; // 106mm x 106mm
    const posXQr = (largeurPage - tailleQr) / 2;
    const posYQr = posYCallToAction + 16;

    // Encadré de fond du QR Code avec coins arrondis
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(1.2);
    doc.roundedRect(posXQr - 4, posYQr - 4, tailleQr + 8, tailleQr + 8, 5, 5, 'FD');

    // Insertion de l'Image du QR Code
    doc.addImage(qrDataUrl, 'PNG', posXQr, posYQr, tailleQr, tailleQr);

    // 8. Bloc Rendez-vous du Tirage au Sort
    const posYBlocTirage = 236;
    const hauteurBlocTirage = 24;
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(22, posYBlocTirage, largeurPage - 44, hauteurBlocTirage, 5, 5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(245, 158, 11);
    doc.text("RENDEZ-VOUS DU TIRAGE AU SORT", centreX, posYBlocTirage + 8.5, { align: 'center' });

    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(`${parametres.dateTirage} à ${parametres.heureTirage}`, centreX, posYBlocTirage + 18, { align: 'center' });

    // 9. Pied de Page / Filigrane & Lien Direct
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Lien direct d'inscription : ${parametres.urlInscription}`, centreX, 274, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(217, 119, 6);
    doc.text("★ Tirage Prestige Stand • Document Officiel A4", centreX, 281, { align: 'center' });

    // 10. Sauvegarde et téléchargement du PDF natif vectoriel
    doc.save(`Affiche-Stand-QRCode-${parametres.nomStand.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  }
}
