'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Shell from '@/src/components/Shell';
import { supabase } from '@/src/lib/supabaseClient';
import { formatEuro, formatDate, QUOTE_STATUSES } from '@/src/lib/formatters';

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('quotes')
      .select('*, clients(first_name,last_name,phone), buildings(address,city,construction_year)')
      .order('created_at', { ascending: false });
    setQuotes(data ?? []);
    setLoading(false);
  }

  const filtered = quotes.filter((q) => {
    if (filterStatus && q.status !== filterStatus) return false;
    if (search) {
      const s = search.toLowerCase();
      const name = `${q.clients?.first_name ?? ''} ${q.clients?.last_name ?? ''}`.toLowerCase();
      if (!name.includes(s) && !q.number?.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  return (
    <Shell>
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Devis</h1>
          <Link href="/quotes/new" className="btn btn-primary text-sm">+ Nouveau devis</Link>
        </div>

        <input className="input" placeholder="🔍  Rechercher (client, numéro)…"
          value={search} onChange={(e) => setSearch(e.target.value)} />

        <select className="select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="draft">Brouillon</option>
          <option value="sent">Envoyé</option>
          <option value="accepted">Accepté</option>
          <option value="rejected">Refusé</option>
        </select>

        <div className="text-xs text-slate-500">{filtered.length} devis</div>

        {loading ? (
          <div className="card animate-pulse h-32 flex items-center justify-center text-slate-500">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="card text-center text-slate-400 py-10">
            <div className="text-4xl mb-2">📋</div>
            <p>Aucun devis trouvé</p>
            <Link href="/quotes/new" className="btn btn-primary mt-4 text-sm inline-flex">Créer un devis</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((q) => {
              const st = QUOTE_STATUSES[q.status];
              return (
                <Link key={q.id} href={`/quotes/${q.id}`} className="card-hover block">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-xs text-slate-500">{q.number ?? 'Brouillon'}</span>
                        <span className="font-semibold text-white text-sm">
                          {q.clients?.first_name} {q.clients?.last_name}
                        </span>
                        {st && <span className={`badge ${st.color}`}>{st.label}</span>}
                        {q.buildings?.construction_year && (
                          <span className={`badge ${q.vat_rate <= 6 ? 'bg-green-900 text-green-300' : 'bg-slate-700 text-slate-400'}`}>
                            TVA {q.vat_rate}%
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs truncate">
                        {q.buildings?.address ? `${q.buildings.address}, ${q.buildings.city}` : 'Adresse non renseignée'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{formatDate(q.created_at)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-orange-300 font-semibold">{formatEuro(q.total)}</div>
                      {q.valid_until && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          Valable jusqu'au {formatDate(q.valid_until)}
                        </div>
                      )}
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
