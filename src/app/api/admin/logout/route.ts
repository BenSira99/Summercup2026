import { NextResponse } from 'next/server';
import { ServiceSessionAdmin } from '@/infrastructure/services/ServiceSessionAdmin';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await ServiceSessionAdmin.supprimerSession();
    return NextResponse.json({ succes: true, message: 'Déconnexion réussie.' });
  } catch (e: any) {
    return NextResponse.json(
      { succes: false, erreur: 'Erreur lors de la déconnexion.' },
      { status: 500 }
    );
  }
}
