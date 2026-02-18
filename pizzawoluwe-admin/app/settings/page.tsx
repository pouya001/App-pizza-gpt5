'use client';
import Shell from '@/src/components/Shell';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <Shell>
      <div className="space-y-5 max-w-lg">
        <h1 className="text-2xl font-bold text-white">Paramètres</h1>

        {/* Informations TVA */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-white">💡 Règles TVA automatiques</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between bg-green-900/30 border border-green-700 rounded-xl p-3">
              <div>
                <div className="text-green-300 font-semibold">TVA 6% – Rénovation</div>
                <div className="text-green-400/70 text-xs">Bâtiment construit il y a plus de 10 ans</div>
              </div>
              <div className="text-2xl">🏚️</div>
            </div>
            <div className="flex items-center justify-between bg-slate-700/40 border border-slate-600 rounded-xl p-3">
              <div>
                <div className="text-slate-200 font-semibold">TVA 21% – Neuf</div>
                <div className="text-slate-400 text-xs">Bâtiment de moins de 10 ans</div>
              </div>
              <div className="text-2xl">🏗️</div>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            L'année de construction est saisie dans la fiche bâtiment (CRM Clients).
            Le taux est appliqué automatiquement lors de la création d'un devis ou d'une intervention.
          </p>
        </div>

        {/* Formule Siegert */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-white">🔬 Formule de Siegert (DIN 4702)</h2>
          <div className="bg-slate-700/40 rounded-xl p-4 font-mono text-sm space-y-2">
            <div className="text-orange-300">η (%) = 100 - qA</div>
            <div className="text-slate-300">qA = (Tg - Tl) × (A₁ + B₁ / CO₂%)</div>
            <div className="text-slate-500 text-xs">Gaz naturel H (G20) : A₁ = 0.38 · B₁ = 0.009</div>
          </div>
          <div className="space-y-1 text-sm">
            <p className="section-title">Seuils de conformité (Bruxelles Environnement)</p>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 shrink-0" />
              <span className="text-slate-300">CO &lt; 1 000 ppm et rendement ≥ 84% → <strong className="text-green-400">Conforme</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
              <span className="text-slate-300">CO 1 000–3 000 ppm ou rendement 80–84% → <strong className="text-amber-400">Attention</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
              <span className="text-slate-300">CO &gt; 3 000 ppm ou rendement &lt; 80% → <strong className="text-red-400">Non conforme</strong></span>
            </div>
          </div>
        </div>

        {/* Liens rapides */}
        <div className="card space-y-2">
          <h2 className="font-semibold text-white">Navigation rapide</h2>
          {[
            { href: '/catalog', icon: '🗄️', label: 'Gérer le catalogue pièces & services' },
            { href: '/clients', icon: '👥', label: 'Gérer les clients & bâtiments' },
            { href: '/interventions', icon: '🔧', label: 'Voir toutes les interventions' },
            { href: '/quotes', icon: '📋', label: 'Voir tous les devis' },
          ].map((l) => (
            <Link key={l.href} href={l.href}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-700/50 transition-colors text-slate-300 text-sm">
              <span className="text-xl">{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="text-xs text-slate-600 text-center">
          ThermoGestion Pro v1.0 · Artisan chauffagiste
        </div>
      </div>
    </Shell>
  );
}
