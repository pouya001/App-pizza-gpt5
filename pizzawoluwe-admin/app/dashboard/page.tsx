
'use client';
import Shell from '@/src/components/Shell';
import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabaseClient';
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement);
type Stat = { todayOrders: number; todayRevenue: number; waiting: number; nextTwoHours: number };
type Order = { id: number; number: string; customer_name: string; scheduled_at: string; status: string; total_eur: number };
export default function Dashboard() {
  const [stat, setStat] = useState<Stat>({ todayOrders: 0, todayRevenue: 0, waiting: 0, nextTwoHours: 0 });
  const [recent, setRecent] = useState<Order[]>([]);
  async function load() {
    const { data: s } = await supabase.rpc('dashboard_stats'); setStat(s ?? stat);
    const { data: orders } = await supabase.from('orders_view').select('*').order('created_at', { ascending: false }).limit(10);
    setRecent(orders ?? []);
  }
  useEffect(() => {
    load();
    const sub = supabase.channel('realtime:orders').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, _ => { load(); }).subscribe();
    const t = setInterval(load, 30000);
    return () => { supabase.removeChannel(sub); clearInterval(t); };
  }, []);
  return (
    <Shell>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card"><div className="text-sm text-gray-600">Commandes aujourd'hui</div><div className="text-2xl font-bold">{stat.todayOrders}</div></div>
        <div className="card"><div className="text-sm text-gray-600">CA du jour (€)</div><div className="text-2xl font-bold">{stat.todayRevenue.toFixed(2)}</div></div>
        <div className="card"><div className="text-sm text-gray-600">En attente</div><div className="text-2xl font-bold">{stat.waiting}</div></div>
        <div className="card"><div className="text-sm text-gray-600">Livraisons &lt; 2h</div><div className="text-2xl font-bold">{stat.nextTwoHours}</div></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="card col-span-2">
          <div className="flex items-center justify-between mb-2"><h2 className="font-semibold">Dernières commandes</h2></div>
          <table className="table">
            <thead><tr><th>Numéro</th><th>Client</th><th>Date/Heure</th><th>Statut</th><th>Total</th></tr></thead>
            <tbody>
              {recent.map(o => (
                <tr key={o.id} className="bg-white">
                  <td>#{o.number}</td>
                  <td>{o.customer_name}</td>
                  <td>{new Date(o.scheduled_at).toLocaleString('fr-BE')}</td>
                  <td><span className={`badge ${{
                    waiting:'badge-waiting', confirmed:'badge-confirmed', preparing:'badge-prep', ready:'badge-ready', delivered:'badge-delivered', cancelled:'badge-cancelled'
                  }[o.status]}`}>{{
                    waiting:'En attente', confirmed:'Confirmée', preparing:'En préparation', ready:'Prête', delivered:'Livrée', cancelled:'Annulée'
                  }[o.status]}</span></td>
                  <td>{o.total_eur.toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card"><h2 className="font-semibold mb-2">Répartition statuts</h2>
          <Doughnut data={{ labels: ['En attente','Confirmée','Préparation','Prête','Livrée','Annulée'], datasets: [{ data: [stat.waiting, 2,3,1,5,0] }] }}/>
        </div>
      </div>
    </Shell>
  );
}
