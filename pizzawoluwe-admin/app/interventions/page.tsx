'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Shell from '@/src/components/Shell';
import { supabase } from '@/src/lib/supabaseClient';
import { formatDate, formatDateTime, formatEuro, INTERVENTION_TYPES, INTERVENTION_STATUSES } from '@/src/lib/formatters';

export default function InterventionsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('interventions')
      .select('*, clients(first_name,last_name,phone), buildings(address,city,label)')
      .order('scheduled_at', { ascending: false, nullsFirst: true });
    setItems(data ?? []);
    setLoading(false);
  }

  const filtered = items.filter((i) => {
    if (filterType && i.type !== filterType) return false;
    if (filterStatus && i.status !== filterStatus) return false;
    if (filterDate) {
      const today = new Date();
      if (filterDate === 'today') {
        if (!i.scheduled_at) return false;
        const d = new Date(i.scheduled_at);
        if (d.toDateString() !== today.toDateString()) return false;
      } else if (filterDate === 'week') {
        if (!i.scheduled_at) return false;
        const d = new Date(i.scheduled_at);
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        if (d < weekStart || d > weekEnd) return false;
      }
    }
    if (search) {
      const q = search.toLowerCase();
      const name = `${i.clients?.first_name ?? ''} ${i.clients?.last_name ?? ''}`.toLowerCase();
      if (!name.includes(q) && !i.number?.toLowerCase().includes(q) &&
          !i.clients?.phone?.includes(q) && !i.buildings?.address?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <Shell>
      <div className="space-y-4 max-w-2xl">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Interventions</h1>
          <Link href="/interventions/new" className="btn btn-primary text-sm">
            + Nouveau
          </Link>
        </div>

        {/* Recherche */}
        <input className="input" placeholder="🔍  Rechercher (client, numéro, adresse)…"
          value={search} onChange={(e) => setSearch(e.target.value)} />

        {/* Filtres */}
        <div className="grid grid-cols-3 gap-2">
          <select className="select text-sm" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">Tous types</option>
            <option value="maintenance">🔧 Entretien</option>
            <option value="repair">⚡ Dépannage</option>
            <option value="installation">🏗️ Installation</option>
          </select>
          <select className="select text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Tous statuts</option>
            <option value="planned">Planifié</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminé</option>
            <option value="cancelled">Annulé</option>
          </select>
          <select className="select text-sm" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}>
            <option value="">Toutes dates</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
          </select>
        </div>

        {/* Compteur */}
        <div className="text-xs text-slate-500">
          {filtered.length} intervention{filtered.length !== 1 ? 's' : ''}
        </div>

        {/* Liste */}
        {loading ? (
          <div className="card animate-pulse h-32 flex items-center justify-center text-slate-500">
            Chargement…
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center text-slate-400 py-10">
            <div className="text-4xl mb-2">🔧</div>
            <p>Aucune intervention trouvée</p>
            <Link href="/interventions/new" className="btn btn-primary mt-4 text-sm inline-flex">
              Créer une intervention
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => {
              const t = INTERVENTION_TYPES[item.type] ?? INTERVENTION_TYPES.maintenance;
              const st = INTERVENTION_STATUSES[item.status];
              return (
                <Link key={item.id} href={`/interventions/${item.id}`} className="card-hover block">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`${t.color} text-lg`}>{t.icon}</span>
                        <span className="text-xs text-slate-500 font-mono">{item.number ?? '—'}</span>
                        <span className="font-semibold text-white text-sm">
                          {item.clients?.first_name} {item.clients?.last_name}
                        </span>
                        {st && <span className={`badge ${st.color}`}>{st.label}</span>}
                      </div>
                      <p className="text-slate-400 text-xs truncate">
                        {item.buildings?.address
                          ? `${item.buildings.address}, ${item.buildings.city}`
                          : 'Adresse non renseignée'}
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
                      <div className="text-xs text-slate-400">
                        {item.scheduled_at ? formatDateTime(item.scheduled_at) : 'Non planifié'}
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
    </Shell>
  );
}
