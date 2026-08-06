import React from 'react';
import { AnimationTirageAuSort, ParticipantTirage } from '@/presentation/components/AnimationTirageAuSort';
import { DepotParticipantMySql } from '@/infrastructure/persistence/DepotParticipant';
import { DepotConfigurationMySql } from '@/infrastructure/persistence/DepotConfiguration';

export const revalidate = 0;

export default async function PageTirageAuSort() {
  let listeParticipants: ParticipantTirage[] = [];
  let configuration = {
    nomEvenement: "Grand Tirage au Sort",
    descriptionLot: "Un iPad Pro avec ses accessoires de luxe",
  };

  try {
    const depotPart = new DepotParticipantMySql();
    const depotConfig = new DepotConfigurationMySql();

    const [participantsSql, configSql] = await Promise.all([
      depotPart.obtenirTousLesParticipants(),
      depotConfig.obteinirConfiguration()
    ]);

    listeParticipants = participantsSql.map(p => ({
      id: p.id,
      nomComplet: p.obtenirNomComplet(),
      numeroTicket: p.numeroTicket,
    }));

    configuration = {
      nomEvenement: configSql.nomEvenement,
      descriptionLot: configSql.descriptionLot,
    };
  } catch (e) { }

  return (
    <main className="min-h-screen bg-[#121212] flex items-center justify-center p-4 sm:p-8">
      <AnimationTirageAuSort
        listeParticipants={listeParticipants}
        nomEvenement={configuration.nomEvenement}
        descriptionLot={configuration.descriptionLot}
      />
    </main>
  );
}
