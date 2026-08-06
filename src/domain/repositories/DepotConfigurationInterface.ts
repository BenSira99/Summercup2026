import { ConfigurationEvenementEntite } from '../entities/ConfigurationEvenementEntite';

/**
 * Interface pour la persistance de la configuration du gérant
 */
export interface DepotConfigurationInterface {
  obteinirConfiguration(): Promise<ConfigurationEvenementEntite>;
  enregistrerConfiguration(config: ConfigurationEvenementEntite): Promise<ConfigurationEvenementEntite>;
}
