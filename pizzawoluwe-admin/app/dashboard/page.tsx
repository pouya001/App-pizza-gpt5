'use client';
import { useEffect, useState } from 'react';
import Shell from '@/src/components/Shell';
import { supabase } from '@/src/lib/supabaseClient';
import { formatEuro, formatDateTime, INTERVENTION_TYPES, INTERVENTION_STATUSES } from '@/src/lib/formatters';
import Link from 'next/link';

export default function DashboardPage() {
  const [todayItems, setTodayItems] = useState<any[]>([]);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const today = new Date();
    const s = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const e = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
    const ms = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

    const [todayRes, revRes, pendRes] = await Promise.all([
      supabase.from('interventions')
        .select('*, clients(first_name,last_name,phone), buildings(address,city)')
        .gte('scheduled_at', s).lt('scheduled_at', e)
        .neq('status', 'cancelled')
        .order('scheduled_at', { ascending: true }),
      supabase.from('interventions')
        .select('total').eq('status', 'completed').gte('completed_at', ms),
      supabase.from('interventions')
        .select('id', { count: 'exact' })
        .eq('status', 'completed').is('client_signature', null),
    ]);

    setTodayItems(todayRes.data ?? []);
    setMonthRevenue((revRes.data ?? []).reduce((s: number, r: any) => s + (r.total ?? 0), 0));
    setPendingCount(pendRes.count ?? 0);
    setLoading(false);
  }

  return (
    <Shell>
      <div className="space-y-6 max-w-3xl">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Tableau de bord</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {new Date().toLocaleDateString('fr-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <Link href="/interventions/new" className="btn btn-primary text-sm">
            + Intervention
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: loading ? '…' : todayItems.length, label: "Aujourd'hui", color: 'text-orange-400' },
            { value: loading ? '…' : formatEuro(monthRevenue), label: 'CA du mois', color: 'text-green-400' },
            { value: loading ? '…' : pendingCount, label: 'En attente paiement', color: 'text-amber-400' },
          ].map((k) => (
            <div key={k.label} className="card text-center py-5">
              <div className={`text-3xl font-bold ${k.color}`}>{k.value}</div>
              <div className="text-xs text-slate-400 mt-1">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/interventions/new" className="btn btn-secondary flex-col py-5 h-auto gap-2">
            <span className="text-3xl">🔧</span>
            <span className="text-sm">Nouvelle intervention</span>
          </Link>
          <Link href="/quotes/new" className="btn btn-secondary flex-col py-5 h-auto gap-2">
            <span className="text-3xl">📋</span>
            <span className="text-sm">Nouveau devis</span>
          </Link>
        </div>

        {/* Interventions du jour */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">
              Interventions du jour
            </h2>
            <Link href="/interventions" className="text-sm text-orange-400 hover:text-orange-300">
              Tout voir →
            </Link>
          </div>

          {loading ? (
            <div className="card animate-pulse h-24 flex items-center justify-center text-slate-500">
              Chargement…
            </div>
          ) : todayItems.length === 0 ? (
            <div className="card text-center text-slate-400 py-10">
              <div className="text-4xl mb-3">📅</div>
              <p>Aucune intervention planifiée aujourd'hui</p>
              <Link href="/interventions/new" className="btn btn-primary mt-4 text-sm inline-flex">
                Planifier maintenant
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {todayItems.map((item: any) => {
                const t = INTERVENTION_TYPES[item.type] ?? INTERVENTION_TYPES.maintenance;
                const st = INTERVENTION_STATUSES[item.status];
                return (
                  <Link key={item.id} href={`/interventions/${item.id}`} className="card-hover block">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`${t.color} text-lg`}>{t.icon}</span>
                          <span className="font-semibold text-white text-sm">
                            {item.clients?.first_name} {item.clients?.last_name}
                          </span>
                          {st && <span className={`badge ${st.color}`}>{st.label}</span>}
                        </div>
                        <p className="text-slate-400 text-xs truncate">
                          {item.buildings?.address}, {item.buildings?.city}
                        </p>
                        {item.clients?.phone && (
                          <a href={`tel:${item.clients.phone}`}
                             onClick={(e) => e.stopPropagation()}
                             className="text-orange-400 text-xs mt-0.5 inline-block">
                            📞 {item.clients.phone}
                          </a>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-white font-mono text-base">
                          {item.scheduled_at
                            ? new Date(item.scheduled_at).toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' })
                            : '—'}
                        </div>
                        <div className="text-orange-300 text-sm font-medium mt-1">
                          {formatEuro(item.total)}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
