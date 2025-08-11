
import './globals.css';
import '../public/tw.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'PizzaWoluwe Admin', description: 'Interface d’administration — PizzaWoluwe' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="fr"><body>{children}</body></html>);
}
