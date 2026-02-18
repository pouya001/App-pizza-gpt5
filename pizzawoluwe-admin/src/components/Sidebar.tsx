'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import clsx from 'clsx';

const links = [
  { href: '/dashboard',     label: 'Tableau de bord', icon: '📊' },
  { href: '/interventions', label: 'Interventions',    icon: '🔧' },
  { href: '/quotes',        label: 'Devis',            icon: '📋' },
  { href: '/clients',       label: 'Clients',          icon: '👥' },
  { href: '/catalog',       label: 'Catalogue',        icon: '🗄️' },
  { href: '/settings',      label: 'Paramètres',       icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Burger mobile */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 w-12 h-12 bg-slate-800 border border-slate-600 rounded-xl flex items-center justify-center shadow-lg"
        aria-label="Menu"
      >
        <div className="flex flex-col gap-1.5">
          <span className={`block h-0.5 w-5 bg-slate-300 transition-transform ${open ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block h-0.5 w-5 bg-slate-300 transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-5 bg-slate-300 transition-transform ${open ? '-rotate-45 -translate-y-2' : ''}`} />
        </div>
      </button>

      {/* Overlay mobile */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-700 p-4 z-50 flex flex-col transition-transform duration-300',
        'md:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 mt-14 md:mt-0">
          <div className="h-10 w-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            🔥
          </div>
          <div>
            <div className="font-bold text-white text-sm leading-tight">ThermoGestion</div>
            <div className="text-xs text-orange-400 font-medium">Pro</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 flex-1">
          {links.map((l) => {
            const active = l.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  active ? 'sidebar-link-active' : 'sidebar-link'
                )}
              >
                <span className="text-xl w-7 shrink-0">{l.icon}</span>
                <span>{l.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Version */}
        <div className="text-xs text-slate-600 text-center mt-4">
          ThermoGestion Pro v1.0
        </div>
      </aside>
    </>
  );
}
