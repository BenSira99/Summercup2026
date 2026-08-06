import React from 'react';
import { DashboardGerant } from '@/presentation/components/DashboardGerant';

export const revalidate = 0;

export default function PageAdminGerant() {
  return (
    <main className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col">
      <DashboardGerant />
    </main>
  );
}
