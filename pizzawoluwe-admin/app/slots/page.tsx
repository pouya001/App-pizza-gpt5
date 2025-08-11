
'use client';
import Shell from '@/src/components/Shell';
import { supabase } from '@/src/lib/supabaseClient';
import { startOfWeek, addMinutes, addDays, format, set } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useEffect, useMemo, useState } from 'react';
type Slot = { id:number; starts_at:string; max_orders:number; max_pizzas:number; blocked:boolean; reason:string|null; orders_count:number; pizzas_count:number };
export default function SlotsPage() {
  const [start, setStartDate] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [slots, setSlots] = useState<Slot[]>([]);
  async function load(){
    const from = start.toISOString(); const to = addDays(start, 7).toISOString();
    const { data } = await supabase.rpc('get_slots_with_usage', { p_from: from, p_to: to }); setSlots((data ?? []) as any);
  }
  useEffect(()=>{ load(); }, [start]);
  const grid = useMemo(() => {
    const days = [...Array(7)].map((_,i) => addDays(start, i));
    const base = set(start, { hours:11, minutes:0, seconds:0, milliseconds:0 });
    const times = [...Array(12)].map((_,i) => addMinutes(base, i*30));
    return { days, times };
  }, [start]);
  function cell(day: Date, time: Date) {
    const s = slots.find(x => {
      const d = new Date(x.starts_at);
      return d.getDay() === day.getDay() && d.getHours() === time.getHours() && d.getMinutes() === time.getMinutes();
    });
    if (!s) return <div className="h-16 bg-gray-50 rounded-xl border border-dashed grid place-items-center text-xs text-gray-400">Non config.</div>;
    const ratio = Math.max(s.orders_count / s.max_orders, s.pizzas_count / s.max_pizzas);
    const color = s.blocked ? 'bg-red-100 border-red-300' : ratio >= 1 ? 'bg-orange-200 border-orange-400' : ratio >= 0.8 ? 'bg-yellow-100 border-yellow-300' : 'bg-green-100 border-green-300';
    return (
      <div className={`h-16 rounded-xl border p-2 text-xs ${color}`}>
        <div className="font-semibold">{format(time, 'HH:mm')} - {format(addMinutes(time,30), 'HH:mm')}</div>
        <div>👥 {s.orders_count}/{s.max_orders} • 🍕 {s.pizzas_count}/{s.max_pizzas}</div>
        {s.blocked && <div>Bloqué: {s.reason ?? ''}</div>}
      </div>
    );
  }
  return (
    <Shell>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">Créneaux</h1>
        <div className="space-x-2">
          <button className="btn" onClick={()=>setStartDate(addDays(start, -7))}>← Semaine -1</button>
          <button className="btn" onClick={()=>setStartDate(startOfWeek(new Date(), { weekStartsOn:1 }))}>Aujourd'hui</button>
          <button className="btn" onClick={()=>setStartDate(addDays(start, 7))}>Semaine +1 →</button>
        </div>
      </div>
      <div className="grid grid-cols-8 gap-2">
        <div></div>
        {grid.days.map(d => <div key={d.toISOString()} className="text-center font-semibold">{format(d, 'EEE dd/MM', { locale: fr })}</div>)}
        {grid.times.map((t, idx) => (
          <div key={'row'+idx} className="contents">
            <div className="text-sm font-medium">{format(t, 'HH:mm')}</div>
            {grid.days.map(d => <div key={d.toISOString()+format(t,'HHmm')}>{cell(d, t)}</div>)}
          </div>
        ))}
      </div>
    </Shell>
  );
}
