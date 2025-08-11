
'use client';
import Shell from '@/src/components/Shell';
import { supabase } from '@/src/lib/supabaseClient';
import { useEffect, useMemo, useState } from 'react';
type Client = { id:number; name:string; phone:string; email:string|null; first_order_at:string|null; last_order_at:string|null; orders_count:number; total_spent:number };
export default function ClientsPage() {
  const [rows, setRows] = useState<Client[]>([]); const [q, setQ] = useState('');
  async function load(){ const { data } = await supabase.from('clients_stats_view').select('*').order('last_order_at', { ascending:false }); setRows((data ?? []) as any); }
  useEffect(()=>{ load(); }, []);
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter(r => !term || r.name.toLowerCase().includes(term) || (r.phone ?? '').includes(term) || (r.email ?? '').toLowerCase().includes(term));
  }, [rows, q]);
  return (
    <Shell>
      <h1 className="text-xl font-semibold mb-3">Clients</h1>
      <div className="mb-2"><input className="input" placeholder="Rechercher nom / téléphone / email" value={q} onChange={e=>setQ(e.target.value)}/></div>
      <div className="card overflow-x-auto">
        <table className="table">
          <thead><tr><th>Nom</th><th>Téléphone</th><th>Email</th><th>#cmd</th><th>Total dépensé</th><th>Dernière commande</th></tr></thead>
          <tbody>{filtered.map(c => (<tr key={c.id}><td>{c.name}</td><td>{c.phone}</td><td>{c.email ?? '-'}</td><td>{c.orders_count}</td><td>{c.total_spent?.toFixed(2)} €</td><td>{c.last_order_at ? new Date(c.last_order_at).toLocaleString('fr-BE') : '-'}</td></tr>))}</tbody>
        </table>
      </div>
    </Shell>
  );
}
