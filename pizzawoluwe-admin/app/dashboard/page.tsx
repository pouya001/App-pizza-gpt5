'use client';

import Shell from '@/src/components/Shell';
import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabaseClient';
import { statusClass, type OrderStatus } from '@/src/lib/status';
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import Link from 'next/link';

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement);

type Stat = { 
  todayOrders: number; 
  todayRevenue: number; 
  waiting: number; 
  nextTwoHours: number; 
};

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

export default function Dashboard() {
  const [stat, setStat] = useState<Stat>({ 
    todayOrders: 0, 
    todayRevenue: 0, 
    waiting: 0, 
    nextTwoHours: 0 
  });
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  async function load() {
    // Charger les stats
    const { data: s } = await supabase.rpc('dashboard_stats');
    setStat(s ?? stat);
    
    // Charger les commandes du jour sélectionné
    const startOfDay = new Date(selectedDate + 'T00:00:00').toISOString();
    const endOfDay = new Date(selectedDate + 'T23:59:59').toISOString();
    
    const { data: dayOrders } = await supabase
      .from('orders_view')
      .select('*')
      .gte('scheduled_at', startOfDay)
      .lte('scheduled_at', endOfDay)
      .order('scheduled_at', { ascending: true });
    
    setOrders(dayOrders ?? []);
  }

  useEffect(() => {
    load();
    
    const sub = supabase
      .channel('realtime:orders')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'orders' 
      }, () => {
        load();
      })
      .subscribe();
    
    const t = setInterval(load, 30000);
    
    return () => {
      supabase.removeChannel(sub);
      clearInterval(t);
    };
  }, [selectedDate]);

  async function changeStatus(id: number, status: OrderStatus) {
    await supabase.from('orders').update({ status }).eq('id', id);
    await load();
  }

  async function removeOrder(id: number) {
    if (!confirm('Supprimer cette commande ?')) return;
    await supabase.from('orders').delete().eq('id', id);
    await load();
  }

  const statusMap = {
    waiting: 'En attente',
    confirmed: 'Confirmée',
    preparing: 'En préparation',
    ready: 'Prête',
    delivered: 'Livrée',
    cancelled: 'Annulée'
  };

  return (
    <Shell>
      {/* Sélecteur de date */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Date :</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input max-w-[200px]"
            />
          </div>
        </div>
      </div>

      {/* Commandes du jour en premier */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Commandes du {new Date(selectedDate).toLocaleDateString('fr-BE')}
          </h2>
          <Link href="/orders/new" className="btn btn-primary">+ Nouvelle commande</Link>
        </div>
        
        {orders.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500">Aucune commande pour cette date</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map(order => (
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
                      onClick={() => removeOrder(order.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats générales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="text-sm text-gray-600">Commandes aujourd'hui</div>
          <div className="text-2xl font-bold">{stat.todayOrders}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600">CA du jour (€)</div>
          <div className="text-2xl font-bold">{stat.todayRevenue.toFixed(2)}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600">En attente</div>
          <div className="text-2xl font-bold">{stat.waiting}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600">Livraisons &lt; 2h</div>
          <div className="text-2xl font-bold">{stat.nextTwoHours}</div>
        </div>
      </div>

      {/* Graphique */}
      <div className="card max-w-md">
        <h2 className="font-semibold mb-2">Répartition statuts</h2>
        <Doughnut 
          data={{
            labels: ['En attente', 'Confirmée', 'Préparation', 'Prête', 'Livrée', 'Annulée'],
            datasets: [{
              data: [stat.waiting, 2, 3, 1, 5, 0]
            }]
          }}
        />
      </div>
    </Shell>
  );
}
