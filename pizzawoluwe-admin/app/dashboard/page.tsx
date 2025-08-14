'use client';
import Shell from '@/src/components/Shell';
import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabaseClient';
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import Link from 'next/link';

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement);

type Stat = { 
  todayOrders: number; 
  todayRevenue: number; 
  waiting: number; 
  nextTwoHours: number 
};

type Order = { 
  id: number; 
  number: string; 
  customer_name: string; 
  scheduled_at: string; 
  status: string; 
  total_eur: number;
  items_text: string;
  customer_phone: string | null;
};

export default function Dashboard() {
  const [stat, setStat] = useState<Stat>({ todayOrders: 0, todayRevenue: 0, waiting: 0, nextTwoHours: 0 });
  const [recent, setRecent] = useState<Order[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateOrders, setDateOrders] = useState<Order[]>([]);

  async function loadGlobalStats() {
    const { data: s } = await supabase.rpc('dashboard_stats'); 
    setStat(s ?? stat);
    
    const { data: orders } = await supabase
      .from('orders_view')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    setRecent(orders ?? []);
  }

  async function loadDateOrders() {
    const startDate = new Date(selectedDate + 'T00:00:00');
    const endDate = new Date(selectedDate + 'T23:59:59');
    
    const { data: orders } = await supabase
      .from('orders_view')
      .select('*')
      .gte('scheduled_at', startDate.toISOString())
      .lte('scheduled_at', endDate.toISOString())
      .order('scheduled_at', { ascending: true });
    
    setDateOrders(orders ?? []);
  }

  useEffect(() => {
    loadGlobalStats();
    const sub = supabase
      .channel('realtime:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, _ => {
        loadGlobalStats();
        loadDateOrders();
      })
      .subscribe();
    
    const t = setInterval(() => {
      loadGlobalStats();
      loadDateOrders();
    }, 30000);
    
    return () => { 
      supabase.removeChannel(sub); 
      clearInterval(t); 
    };
  }, []);

  useEffect(() => {
    loadDateOrders();
  }, [selectedDate]);

  function getStatusColor(status: string) {
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

  function getStatusLabel(status: string) {
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

  function parseCustomerName(fullName: string) {
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ');
      return { firstName, lastName };
    }
    return { firstName: '', lastName: fullName };
  }

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  
  return (
    <Shell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Vue d'ensemble de votre activité</p>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="text-sm text-gray-600">Commandes aujourd'hui</div>
          <div className="text-2xl font-bold text-gray-900">{stat.todayOrders}</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="text-sm text-gray-600">CA du jour (€)</div>
          <div className="text-2xl font-bold text-green-600">{stat.todayRevenue.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="text-sm text-gray-600">En attente</div>
          <div className="text-2xl font-bold text-yellow-600">{stat.waiting}</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="text-sm text-gray-600">Livraisons &lt; 2h</div>
          <div className="text-2xl font-bold text-blue-600">{stat.nextTwoHours}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Commandes par date */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">
                  Commandes {isToday ? "d'aujourd'hui" : 'du ' + new Date(selectedDate).toLocaleDateString('fr-FR')}
                </h2>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Date:</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-1 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {dateOrders.length > 0 ? (
                <div className="space-y-4">
                  {dateOrders.map(order => {
                    const { firstName, lastName } = parseCustomerName(order.customer_name);
                    const orderDate = new Date(order.scheduled_at);
                    
                    return (
                      <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-gray-900">#{order.number}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                {getStatusLabel(order.status)}
                              </span>
                            </div>
                            <div className="font-medium text-gray-900">
                              {firstName && <span className="font-semibold">{firstName} </span>}
                              <span className="font-normal text-gray-600">{lastName}</span>
                            </div>
                            {order.customer_phone && (
                              <div className="text-sm text-gray-500">{order.customer_phone}</div>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">{order.total_eur.toFixed(2)} €</div>
                            <div className="text-sm text-gray-500">
                              {orderDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                          {order.items_text || 'Aucun détail'}
                        </div>

                        <div className="flex gap-2 mt-3">
                          <Link 
                            href={`/orders/${order.id}`} 
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          >
                            Modifier
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-lg mb-2">
                    Aucune commande {isToday ? "aujourd'hui" : 'pour cette date'}
                  </div>
                  <Link 
                    href="/orders/new"
                    className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Créer une commande
                  </Link>
                </div>
              )}
              
              {dateOrders.length > 0 && (
                <div className="mt-6 text-center">
                  <Link 
                    href="/orders"
                    className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Voir toutes les commandes
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistiques et dernières commandes */}
        <div className="space-y-6">
          {/* Répartition des statuts */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold mb-4">Répartition statuts</h2>
            <div className="h-48">
              <Doughnut 
                data={{ 
                  labels: ['En attente','Confirmée','Préparation','Prête','Livrée','Annulée'], 
                  datasets: [{ 
                    data: [stat.waiting, 2, 3, 1, 5, 0],
                    backgroundColor: [
                      '#FEF3C7', '#DBEAFE', '#FED7AA', 
                      '#D1FAE5', '#F3F4F6', '#FEE2E2'
                    ],
                    borderColor: [
                      '#F59E0B', '#3B82F6', '#F97316', 
                      '#10B981', '#6B7280', '#EF4444'
                    ]
                  }] 
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        fontSize: 12,
                        usePointStyle: true
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Dernières commandes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Dernières commandes</h2>
              <Link 
                href="/orders" 
                className="text-sm text-red-600 hover:text-red-700"
              >
                Voir tout
              </Link>
            </div>
            
            <div className="space-y-3">
              {recent.map(order => {
                const { firstName, lastName } = parseCustomerName(order.customer_name);
                
                return (
                  <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">#{order.number}</div>
                      <div className="text-xs text-gray-600">
                        {firstName && <span>{firstName} </span>}
                        {lastName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm">{order.total_eur.toFixed(2)} €</div>
                      <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
