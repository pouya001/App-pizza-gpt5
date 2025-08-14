'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Menu burger (visible uniquement sur mobile) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border"
        aria-label="Toggle menu"
      >
        <div className="w-5 h-5 flex flex-col justify-center space-y-1">
          <span className={`block h-0.5 w-5 bg-gray-600 transition-transform ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
          <span className={`block h-0.5 w-5 bg-gray-600 transition-opacity ${isOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block h-0.5 w-5 bg-gray-600 transition-transform ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
        </div>
      </button>

      {/* Overlay pour mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed left-0 top-0 h-screen w-64 border-r bg-white p-4 z-50 transition-transform duration-300',
        // Desktop: toujours visible
        'md:translate-x-0',
        // Mobile: cachée par défaut, visible si isOpen
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo et titre */}
        <div className="flex items-center gap-2 mb-6 mt-12 md:mt-0">
          <div className="h-8 w-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            PW
          </div>
          <span className="font-semibold text-gray-800">PizzaWoluwe</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {links.map((l) => (
            <Link 
              key={l.href} 
              href={l.href} 
              onClick={() => setIsOpen(false)} // Ferme le menu sur mobile après clic
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-gray-100',
                pathname.startsWith(l.href) && 'bg-red-100 text-red-700 font-semibold'
              )}
            >
              <span className="text-lg">{l.emoji}</span>
              <span>{l.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
