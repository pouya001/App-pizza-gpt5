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
  customer_phone: string | null; 
  scheduled_at: string; 
  items_text: string; 
  total_eur: number; 
  status: OrderStatus 
};

export default function OrdersPage() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [q, setQ] = useState(''); 
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortCol, setSortCol] = useState<string>('scheduled_at'); 
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  async function load() { 
    const { data } = await supabase
      .from('orders_view')
      .select('*')
      .order('scheduled_at', { ascending: true }); // Tri chronologique
    setRows((data ?? []) as any); 
  }

  useEffect(() => { 
    load(); 
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter(r => {
      const matchQ = term ? (r.number.toLowerCase().includes(term) || (r.customer_name ?? '').toLowerCase().includes(term)) : true;
      const matchStatus = statusFilter === 'all' ? true : r.status === statusFilter; 
      return matchQ && matchStatus;
    }).sort((a, b) => { 
      const va = (a as any)[sortCol], vb = (b as any)[sortCol]; 
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

  function getStatusColor(status: OrderStatus) {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'delivered': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  function getStatusLabel(status: OrderStatus) {
    switch (status) {
      case 'waiting': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'preparing': return 'En préparation';
      case 'ready': return 'Prête';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  }

  // Séparer prénom et nom - version améliorée
  function parseCustomerName(fullName: string) {
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ');
      return { firstName, lastName };
    }
    return { firstName: '', lastName: fullName };
  }

  return (
    <Shell>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <h1 className="text-xl font-semibold">Commandes</h1>
        <Link 
          href="/orders/new" 
          className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-center"
        >
          + Nouvelle commande
        </Link>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input 
          className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500" 
          placeholder="Recherche (#numéro ou client)" 
          value={q} 
          onChange={e => setQ(e.target.value)} 
        />
        <select 
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white" 
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

      {/* Liste des commandes en cartes */}
      <div className="grid gap-4">
        {filtered.map(order => {
          const { firstName, lastName } = parseCustomerName(order.customer_name);
          const orderDate = new Date(order.scheduled_at);
          
          return (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
              {/* En-tête de la carte */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg text-gray-900">#{order.number}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <div className="text-lg font-medium text-gray-900">
                    {firstName && <span className="font-semibold">{firstName} </span>}
                    <span className="font-normal text-gray-600">{lastName}</span>
                  </div>
                  {order.customer_phone && (
                    <div className="text-sm text-gray-500">{order.customer_phone}</div>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{order.total_eur.toFixed(2)} €</div>
                  <div className="text-sm text-gray-500">
                    {orderDate.toLocaleDateString('fr-FR')}
                  </div>
                  <div className="text-sm text-gray-500">
                    {orderDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {/* Détails des pizzas */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                  {order.items_text || 'Aucun détail'}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Changement de statut */}
                <select 
                  className={`flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-red-500 ${getStatusColor(order.status)}`}
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

                {/* Boutons d'action */}
                <div className="flex gap-2">
                  <Link 
                    href={`/orders/${order.id}`} 
                    className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    Modifier
                  </Link>
                  <button 
                    className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    onClick={() => remove(order.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Message si aucune commande */}
      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-lg mb-2">
            {q || statusFilter !== 'all' ? 'Aucune commande trouvée' : 'Aucune commande enregistrée'}
          </div>
          {!q && statusFilter === 'all' && (
            <Link 
              href="/orders/new"
              className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Créer la première commande
            </Link>
          )}
        </div>
      )}
    </Shell>
  );
}
