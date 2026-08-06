/**
 * Entité représentant les paramètres et la configuration de l'événement géré par l'admin avec sanitisation (Clean Architecture - Domaine)
 */
export interface ParametresConfigurationEvenement {
  nomEvenement: string;
  nomStand: string;
  descriptionLot: string;
  dateTirage: string;
  heureTirage: string;
  motDePasseAdmin: string;
  urlSiteClient?: string;
  nombreGagnantsPrevu?: number;
  lotsParRang?: string[];
}

export class ConfigurationEvenementEntite {
  public nomEvenement: string;
  public nomStand: string;
  public descriptionLot: string;
  public dateTirage: string;
  public heureTirage: string;
  public motDePasseAdmin: string;
  public urlSiteClient: string;
  public nombreGagnantsPrevu: number;
  public lotsParRang: string[];

  constructor(parametres?: Partial<ParametresConfigurationEvenement>) {
    // Sanitisation et tronquage de sécurité des textes d'entrées
    this.nomEvenement = (parametres?.nomEvenement || "Grand Tirage au Sort").trim().substring(0, 100);
    this.nomStand = (parametres?.nomStand || "Stand d'Exposition").trim().substring(0, 100);
    this.descriptionLot = (parametres?.descriptionLot || "Des cadeaux d'exception à gagner").trim().substring(0, 200);
    this.dateTirage = (parametres?.dateTirage || "Aujourd'hui").trim().substring(0, 50);
    this.heureTirage = (parametres?.heureTirage || "17h00").trim().substring(0, 50);
    this.motDePasseAdmin = parametres?.motDePasseAdmin || "";
    this.urlSiteClient = (parametres?.urlSiteClient || "http://localhost:3000").trim();
    this.nombreGagnantsPrevu = Math.max(1, Math.min(20, parametres?.nombreGagnantsPrevu || 1));

    if (parametres?.lotsParRang && Array.isArray(parametres.lotsParRang) && parametres.lotsParRang.length > 0) {
      this.lotsParRang = parametres.lotsParRang.map((lot) => (lot || '').trim().substring(0, 200));
    } else {
      this.lotsParRang = [this.descriptionLot];
    }
  }

  public obtenirLotPourRang(rang: number): string {
    const index = rang - 1;
    if (this.lotsParRang && this.lotsParRang[index]) {
      return this.lotsParRang[index];
    }
    return this.descriptionLot;
  }

  public obtenirHorodatageCompletTirage(): string {
    return `${this.dateTirage} à ${this.heureTirage}`;
  }
}
