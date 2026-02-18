
import '../src/styles/globals.css';
import '../public/tw.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ThermoGestion Pro',
  description: 'Application de gestion pour artisan chauffagiste',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
