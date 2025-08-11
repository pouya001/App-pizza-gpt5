
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
const links = [
  { href: '/dashboard', label: 'Dashboard', emoji: '🏠' },
  { href: '/orders', label: 'Commandes', emoji: '📋' },
  { href: '/clients', label: 'Clients', emoji: '👥' },
  { href: '/pizzas', label: 'Pizzas', emoji: '🍕' },
  { href: '/slots', label: 'Créneaux', emoji: '📅' },
  { href: '/settings', label: 'Paramètres', emoji: '⚙️' },
];
export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r bg-white p-4">
      <div className="flex items-center gap-2 mb-6"><img src="/logo.svg" alt="logo" className="h-8" /></div>
      <nav className="space-y-1">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={clsx('sidebar-link', pathname.startsWith(l.href) && 'bg-gray-100 font-semibold')}>
            <span>{l.emoji}</span><span>{l.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
