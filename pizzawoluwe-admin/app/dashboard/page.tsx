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

  async function changeStatus(id: number, status: string)
