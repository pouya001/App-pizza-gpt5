'use client';

import Shell from '@/src/components/Shell';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/src/lib/supabaseClient';
import { statusClass, type OrderStatus } from '@/src/lib/status';
import Link from 'next/link';

type OrderRow = { 
  id: number; 
  number: string; 
  customer_name: string; 
  customer_first_name: string;
  customer_phone: string | null; 
  scheduled_at: string; 
  items_text: string; 
  total_eur: number; 
  status: OrderStatus; 
};

export default function OrdersPage() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortCol, setSortCol] = useState<string>('scheduled_at');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  async function load() {
    const { data } = await supabase.from('orders_view').select('*');
    setRows((data ?? []) as any);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter(r => {
      const fullName = `${r.customer_first_name} ${r.customer_name}`.toLowerCase();
      const matchQ = term ? (
        r.number.toLowerCase().includes(term) || 
        fullName.includes(term)
      ) : true;
      const matchStatus = statusFilter === 'all' ? true : r.status === statusFilter;
      return matchQ && matchStatus;
    }).sort((a, b) => {
      const va = (a as any)[sortCol];
      const vb = (b as any)[sortCol];
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [rows, q, statusFilter, sortCol, sortAsc]);

  async function changeStatus(id: number, status: OrderStatus) {
    await supabase.from('orders').update({ status }).eq('id', id);
    await load();
  }

  async function remove(id: number) {
    if (!confirm('Supprimer cette commande ?')) return;
    await supabase.from('orders').delete().eq('id', id);
    await load();
  }

  function toggleSort(col: string) {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(true);
    }
  }

  return (
    <Shell>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Commandes</h1>
        <Link href="/orders/new" className="btn btn-primary">+ Nouvelle commande</Link>
      </div>
      
      <div className="flex gap-2 mb-3">
        <input 
          className="input" 
          placeholder="Recherche (#numéro ou client)" 
          value={q} 
          onChange={e => setQ(e.target.value)} 
        />
        <select 
          className="select max-w-[220px]" 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">Tous les statuts</option>
          <option value="waiting">En attente</option>
          <option value="confirmed">Confirmée</option>
          <option value="preparing">En préparation</option>
          <option value="ready">Prête</option>
          <option value="delivered">Livrée</option>
          <option value="cancelled">Annulée</option>
        </select>
      </div>

      {/* Affichage en cartes identique au dashboard */}
      <div className="grid gap-4">
        {filtered.map(order => (
          <div key={order.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    #{order.number}
                  </span>
                  <span className="font-medium">
                    <span className="font-bold">{order.customer_first_name || order.customer_name}</span>
                    {order.customer_first_name && (
                      <span className="text-gray-600"> {order.customer_name}</span>
                    )}
                  </span>
                  {order.customer_phone && (
                    <span className="text-sm text-gray-500">{order.customer_phone}</span>
                  )}
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  {new Date(order.scheduled_at).toLocaleString('fr-BE')}
                </div>
                
                <div className="text-sm mb-2">{order.items_text}</div>
                
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{order.total_eur.toFixed(2)} €</span>
                  
                  <select 
                    className={`select ${statusClass(order.status)}`}
                    value={order.status} 
                    onChange={(e) => changeStatus(order.id, e.target.value as OrderStatus)}
                  >
                    <option value="waiting">En attente</option>
                    <option value="confirmed">Confirmée</option>
                    <option value="preparing">En préparation</option>
                    <option value="ready">Prête</option>
                    <option value="delivered">Livrée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                <Link href={`/orders/${order.id}`} className="btn">
                  Modifier
                </Link>
                <button 
                  className="btn" 
                  onClick={() => remove(order.id)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card text-center py-8">
          <p className="text-gray-500">Aucune commande trouvée</p>
        </div>
      )}
    </Shell>
  );
}
