import '../src/styles/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NimbusFlow - Weather Reimagined',
  description: 'NimbusFlow - Une experience meteo immersive et moderne',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-nimbus-dark min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
