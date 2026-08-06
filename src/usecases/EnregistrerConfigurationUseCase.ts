import { ConfigurationEvenementEntite, ParametresConfigurationEvenement } from '../domain/entities/ConfigurationEvenementEntite';
import { DepotConfigurationInterface } from '../domain/repositories/DepotConfigurationInterface';

export class EnregistrerConfigurationUseCase {
  constructor(private depotConfiguration: DepotConfigurationInterface) {}

  public async executer(parametres: Partial<ParametresConfigurationEvenement>): Promise<ConfigurationEvenementEntite> {
    const configActuelle = await this.depotConfiguration.obteinirConfiguration();

    const nouvelleConfig = new ConfigurationEvenementEntite({
      ...configActuelle,
      ...parametres,
    });

    return await this.depotConfiguration.enregistrerConfiguration(nouvelleConfig);
  }
}
