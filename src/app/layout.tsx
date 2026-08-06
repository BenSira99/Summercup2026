import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

// Requis par la Content-Security-Policy à nonce (nonces générés par requête dans proxy.ts).
// Sans rendu dynamique, Next.js ne peut pas appliquer le nonce aux scripts inline.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Tirage au Sort Royal — Stand Prestige",
  description: "Formulaire d'inscription rapide par QR Code et tirage au sort royal sur stand.",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
