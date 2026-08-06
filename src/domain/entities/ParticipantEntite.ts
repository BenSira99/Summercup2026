import crypto from 'crypto';

/**
 * Entité métier représentant un Participant au tirage au sort avec validations strictes
 */
export interface ParametresParticipant {
  id?: string;
  nom: string;
  prenom: string;
  telephone?: string;
  email?: string;
  numeroTicket?: string;
  dateInscription?: Date;
  estGagnant?: boolean;
}

export class ParticipantEntite {
  public readonly id: string;
  public readonly nom: string;
  public readonly prenom: string;
  public readonly telephone: string;
  public readonly email: string;
  public readonly numeroTicket: string;
  public readonly dateInscription: Date;
  public estGagnant: boolean;

  constructor(parametres: ParametresParticipant) {
    this.validerChampsObliques(parametres);

    this.id = parametres.id || this.genererIdentifiantUnique();
    this.nom = parametres.nom.trim();
    this.prenom = parametres.prenom.trim();
    this.telephone = (parametres.telephone || '').trim();
    this.email = (parametres.email || '').trim();
    this.numeroTicket = parametres.numeroTicket || this.genererNumeroTicket();
    this.dateInscription = parametres.dateInscription || new Date();
    this.estGagnant = parametres.estGagnant || false;
  }

  private validerChampsObliques(parametres: ParametresParticipant): void {
    const nomNet = (parametres.nom || '').trim();
    const prenomNet = (parametres.prenom || '').trim();
    const telNet = (parametres.telephone || '').trim();
    const emailNet = (parametres.email || '').trim();

    // Regex d'autorisation pour Nom et Prénom
    const regexCaractereNomValide = /^[a-zA-Zà-öø-ÿÀ-ÖØ-ßÇç'-]+$/;
    const regexCaracterePrenomValide = /^[a-zA-Zà-öø-ÿÀ-ÖØ-ßÇç'\s-]+$/;

    // 1. Validation du NOM (Au moins 2 lettres, 1 seul mot sans espace, pas de chiffres ni symboles)
    if (!nomNet || nomNet.length < 2) {
      throw new Error("Le nom doit contenir au moins 2 lettres.");
    }
    if (/\s/.test(nomNet)) {
      throw new Error("Le nom doit contenir un seul mot (aucun espace n'est autorisé dans le champ nom).");
    }
    if (!regexCaractereNomValide.test(nomNet)) {
      throw new Error("Le nom ne doit pas contenir de chiffres ou de caractères spéciaux (seuls les lettres, tirets et apostrophes sont autorisés).");
    }

    // 2. Validation du PRÉNOM (Chaque mot >= 2 lettres, pas de chiffres ni symboles spéciaux)
    if (!prenomNet) {
      throw new Error("Le prénom est obligatoire.");
    }
    if (!regexCaracterePrenomValide.test(prenomNet)) {
      throw new Error("Le prénom ne doit pas contenir de chiffres ou de caractères spéciaux (seuls les lettres, espaces, tirets et apostrophes sont autorisés).");
    }

    const motsPrenom = prenomNet.split(/\s+/).filter(Boolean);
    for (const mot of motsPrenom) {
      if (mot.length < 2) {
        throw new Error(`Chaque mot du prénom doit contenir au moins 2 lettres (le mot "${mot}" est trop court).`);
      }
    }

    // 3. Validation OBLIGATOIRE du TÉLÉPHONE (9 chiffres commençant par 6 ou 7 / 10 chiffres commençant par 06 ou 07)
    if (!telNet) {
      throw new Error("Le numéro de téléphone est obligatoire.");
    }

    const chiffresTel = telNet.replace(/\D/g, '');

    if (chiffresTel.length === 9) {
      if (!/^[67]/.test(chiffresTel)) {
        throw new Error("Numéro invalide : un numéro à 9 chiffres doit obligatoirement commencer par 6 ou 7.");
      }
    } else if (chiffresTel.length === 10) {
      if (!/^(06|07)/.test(chiffresTel)) {
        throw new Error("Numéro invalide : un numéro à 10 chiffres doit obligatoirement commencer par 06 ou 07.");
      }
    } else {
      throw new Error("Le numéro de téléphone doit comporter exactement 9 chiffres (commençant par 6 ou 7) ou 10 chiffres (commençant par 06 ou 07).");
    }

    // 4. Validation OBLIGATOIRE de l'EMAIL (format d'adresse email valide)
    if (!emailNet) {
      throw new Error("L'adresse email est obligatoire.");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailNet)) {
      throw new Error("L'adresse email saisie n'est pas une adresse email valide.");
    }
  }

  private genererIdentifiantUnique(): string {
    return crypto.randomUUID();
  }

  /**
   * Génère un numéro de ticket au format TK- suivi de 8 chiffres (ex: TK-12345678)
   */
  private genererNumeroTicket(): string {
    const huitChiffres = Math.floor(10000000 + Math.random() * 90000000);
    return `TK-${huitChiffres}`;
  }

  public obtenirNomComplet(): string {
    return `${this.prenom} ${this.nom}`;
  }

  public marquerCommeGagnant(): void {
    this.estGagnant = true;
  }
}
