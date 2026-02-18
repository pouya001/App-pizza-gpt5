
import '../src/styles/globals.css';
import '../public/tw.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Atmos Technics',
  description: 'Application de gestion – Plomberie & Chauffage',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
