import type { Metadata } from 'next';
import { Fraunces } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { VercelToolbarKiller } from '@/components/VercelToolbarKiller';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz'],
});

export const metadata: Metadata = {
  title: 'EvalVite — Du cours à l\'évaluation en 60 secondes',
  description:
    'Transformez des photos de cours en évaluations personnalisées et imprimables pour préparer vos enfants.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${GeistSans.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <VercelToolbarKiller />
      </body>
    </html>
  );
}
