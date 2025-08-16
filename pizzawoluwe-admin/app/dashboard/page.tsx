'use client';

import Shell from '@/src/components/Shell';
import { useEffect, useState, useCallback } from 'react';
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Nouveaux filtres
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today'); // 'today', 'all', 'custom'

  // Fonction pour charger les commandes filtrées (avec useCallback pour éviter les re-renders)
  const loadFilteredOrders = useCallback(async () => {
    try {
      let query = supabase.from('orders_view').select('*');
      
      // Filtre par date
      if (dateFilter === 'today') {
        const startOfDay = new Date(new Date().toISOString().split('T')[0] + 'T00:00:00').toISOString();
        const endOfDay = new Date(new Date().toISOString().split('T')[0] + 'T23:59:59').toISOString();
        query = query.gte('scheduled_at', startOfDay).lte('scheduled_at', endOfDay);
      } else if (dateFilter === 'custom') {
        const startOfDay = new Date(selectedDate + 'T00:00:00').toISOString();
        const endOfDay = new Date(selectedDate + 'T23:59:59').toISOString();
        query = query.gte('scheduled_at', startOfDay).lte('scheduled_at', endOfDay);
      }
      
      // Filtre par statut
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data: filteredOrders, error } = await query.order('scheduled_at', { ascending: true });
      
      if (error) {
        console.error('Erreur lors du chargement des commandes:', error);
        return;
      }
      
      setOrders(filteredOrders ?? []);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
    }
  }, [dateFilter, selectedDate, statusFilter]);

  // Fonction pour charger les stats
  const loadStats = useCallback(async () => {
    try {
      const { data: s, error } = await supabase.rpc('dashboard_stats');
      
      if (error) {
        console.error('Erreur lors du chargement des stats:', error);
        return;
      }
      
      setStat(s ?? {
        todayOrders: 0, 
        todayRevenue: 0, 
        waiting: 0, 
        nextTwoHours: 0 
      });
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    }
  }, []);

  // Fonction principale de chargement
  const load = useCallback(async () => {
    await Promise.all([loadStats(), loadFilteredOrders()]);
  }, [loadStats, loadFilteredOrders]);

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
  }, [load]);

  useEffect(() => {
    loadFilteredOrders();
  }, [loadFilteredOrders]);

  async function changeStatus(id: number, status: OrderStatus) {
    try {
      const { error } = await supabase.from('orders').update({ status }).eq('id', id);
      
      if (error) {
        console.error('Erreur lors du changement de statut:', error);
        alert('Erreur lors du changement de statut');
        return;
      }
      
      await load();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      alert('Erreur lors du changement de statut');
    }
  }

  async function removeOrder(id: number) {
    if (!confirm('Supprimer cette commande ?')) return;
    
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      
      if (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression');
        return;
      }
      
      await load();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  }

  // Fonction pour sélectionner une date et fermer le picker automatiquement
  function selectDate(date: string) {
    setSelectedDate(date);
    setShowDatePicker(false);
    setDateFilter('custom');
  }

  // Générer les dates pour le picker (aujourd'hui + 30 jours)
  function generateDateOptions() {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('fr-FR', { 
          weekday: 'short', 
          day: 'numeric', 
          month: 'short' 
        })
      });
    }
    
    return dates;
  }

  // Fonctions pour cliquer sur les stats
  function clickTodayOrders() {
    setDateFilter('today');
    setStatusFilter('all');
  }

  function clickWaiting() {
    setDateFilter('all');
    setStatusFilter('waiting');
  }

  function clickNextTwoHours() {
    setDateFilter('all');
    setStatusFilter('all');
    // On pourrait ajouter un filtre spécial pour "< 2h" mais gardons simple pour l'instant
  }

  const dateOptions = generateDateOptions();

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
      {/* En-tête avec filtres */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <Link href="/orders/new" className="btn btn-primary">+ Nouvelle commande</Link>
        </div>
        
        {/* Filtres */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Affichage :</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="select max-w-[150px]"
            >
              <option value="today">Aujourd'hui</option>
              <option value="all">Toutes dates</option>
              <option value="custom">Date spécifique</option>
            </select>
          </div>
          
          {dateFilter === 'custom' && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="btn"
              >
                {new Date(selectedDate).toLocaleDateString('fr-FR')}
              </button>
              
              {showDatePicker && (
                <div className="absolute z-20 mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {dateOptions.map(date => (
                    <button
                      key={date.value}
                      type="button"
                      onClick={() => selectDate(date.value)}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-100 border-b last:border-b-0 ${
                        selectedDate === date.value ? 'bg-red-50 text-red-600 font-medium' : ''
                      }`}
                    >
                      {new Date(date.value).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Statut :</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select max-w-[150px]"
            >
              <option value="all">Tous</option>
              <option value="waiting">En attente</option>
              <option value="confirmed">Confirmée</option>
              <option value="preparing">En préparation</option>
              <option value="ready">Prête</option>
              <option value="delivered">Livrée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats cliquables */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <button 
          onClick={clickTodayOrders}
          className="card hover:bg-gray-50 transition-colors text-left"
        >
          <div className="text-sm text-gray-600">Commandes aujourd'hui</div>
          <div className="text-2xl font-bold">{stat.todayOrders}</div>
        </button>
        <div className="card">
          <div className="text-sm text-gray-600">CA du jour (€)</div>
          <div className="text-2xl font-bold">{stat.todayRevenue.toFixed(2)}</div>
        </div>
        <button 
          onClick={clickWaiting}
          className="card hover:bg-gray-50 transition-colors text-left"
        >
          <div className="text-sm text-gray-600">En attente</div>
          <div className="text-2xl font-bold">{stat.waiting}</div>
        </button>
        <button 
          onClick={clickNextTwoHours}
          className="card hover:bg-gray-50 transition-colors text-left"
        >
          <div className="text-sm text-gray-600">Livraisons &lt; 2h</div>
          <div className="text-2xl font-bold">{stat.nextTwoHours}</div>
        </button>
      </div>

      {/* Commandes filtrées */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Commandes 
            {dateFilter === 'today' && ' d\'aujourd\'hui'}
            {dateFilter === 'custom' && ` du ${new Date(selectedDate).toLocaleDateString('fr-BE')}`}
            {statusFilter !== 'all' && ` (${statusMap[statusFilter as keyof typeof statusMap]})`}
            {' '}({orders.length})
          </h2>
        </div>
        
        {orders.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500">Aucune commande pour ces critères</p>
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

      {/* Overlay pour fermer le date picker en cliquant en dehors */}
      {showDatePicker && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowDatePicker(false)}
        />
      )}
    </Shell>
  );
}
