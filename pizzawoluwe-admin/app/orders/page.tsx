
'use client';
import Shell from '@/src/components/Shell';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/src/lib/supabaseClient';
import { statusClass, type OrderStatus } from '@/src/lib/status';
import Link from 'next/link';
type OrderRow = { id:number; number:string; customer_name:string; customer_phone:string|null; scheduled_at:string; items_text:string; total_eur:number; status:OrderStatus };
export default function OrdersPage() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [q, setQ] = useState(''); const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortCol, setSortCol] = useState<string>('scheduled_at'); const [sortAsc, setSortAsc] = useState<boolean>(false);
  async function load(){ const { data } = await supabase.from('orders_view').select('*'); setRows((data ?? []) as any); }
  useEffect(()=>{ load(); }, []);
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter(r => {
      const matchQ = term ? (r.number.toLowerCase().includes(term) || (r.customer_name ?? '').toLowerCase().includes(term)) : true;
      const matchStatus = statusFilter === 'all' ? true : r.status === statusFilter; return matchQ && matchStatus;
    }).sort((a,b) => { const va=(a as any)[sortCol], vb=(b as any)[sortCol]; if (va<vb) return sortAsc?-1:1; if (va>vb) return sortAsc?1:-1; return 0; });
  }, [rows, q, statusFilter, sortCol, sortAsc]);
  async function changeStatus(id:number, status:OrderStatus){ await supabase.from('orders').update({ status }).eq('id', id); await load(); }
  async function remove(id:number){ if(!confirm('Supprimer cette commande ?')) return; await supabase.from('orders').delete().eq('id', id); await load(); }
  function toggleSort(col:string){ if (sortCol===col) setSortAsc(!sortAsc); else { setSortCol(col); setSortAsc(true);} }
  return (
    <Shell>
      <div className="flex items-center justify-between mb-4"><h1 className="text-xl font-semibold">Commandes</h1><Link href="/orders/new" className="btn btn-primary">+ Nouvelle commande</Link></div>
      <div className="flex gap-2 mb-3"><input className="input" placeholder="Recherche (#numéro ou client)" value={q} onChange={e=>setQ(e.target.value)} />
        <select className="select max-w-[220px]" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
          <option value="all">Tous les statuts</option><option value="waiting">En attente</option><option value="confirmed">Confirmée</option><option value="preparing">En préparation</option><option value="ready">Prête</option><option value="delivered">Livrée</option><option value="cancelled">Annulée</option>
        </select></div>
      <div className="card overflow-x-auto">
        <table className="table">
          <thead><tr>
            <th onClick={()=>toggleSort('number')} className="cursor-pointer">Numéro</th>
            <th onClick={()=>toggleSort('customer_name')} className="cursor-pointer">Client</th>
            <th onClick={()=>toggleSort('scheduled_at')} className="cursor-pointer">Date/Heure</th>
            <th>Détail</th>
            <th onClick={()=>toggleSort('total_eur')} className="cursor-pointer">Total</th>
            <th>Statut</th><th>Actions</th>
          </tr></thead>
          <tbody>{filtered.map(r => (
            <tr key={r.id} className="bg-white">
              <td>#{r.number}</td><td>{r.customer_name}</td><td>{new Date(r.scheduled_at).toLocaleString('fr-BE')}</td>
              <td>{r.items_text}</td><td>{r.total_eur.toFixed(2)} €</td>
              <td><select className={'select ' + statusClass(r.status)} value={r.status} onChange={(e)=>changeStatus(r.id, e.target.value as OrderStatus)}>
                <option value="waiting">En attente</option><option value="confirmed">Confirmée</option><option value="preparing">En préparation</option><option value="ready">Prête</option><option value="delivered">Livrée</option><option value="cancelled">Annulée</option>
              </select></td>
              <td className="space-x-2"><Link href={`/orders/${r.id}`} className="btn">Modifier</Link><button className="btn" onClick={()=>remove(r.id)}>Supprimer</button></td>
            </tr>))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
