'use client';
import Shell from '@/src/components/Shell';
import { supabase } from '@/src/lib/supabaseClient';
import { startOfWeek, addMinutes, addDays, format, set } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useEffect, useMemo, useState } from 'react';

type Slot = { 
  id: number; 
  starts_at: string; 
  max_orders: number; 
  max_pizzas: number; 
  blocked: boolean; 
  reason: string | null; 
  orders_count: number; 
  pizzas_count: number; 
};

export default function SlotsPage() {
  const [start, setStartDate] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [slots, setSlots] = useState<Slot[]>([]);

  async function load() {
    const from = start.toISOString();
    const to = addDays(start, 7).toISOString();
    
    console.log('🔍 DEBUG: Requête slots');
    console.log('From:', from);
    console.log('To:', to);
    
    const { data, error } = await supabase.rpc('get_slots_with_usage', { p_from: from, p_to: to });
    
    console.log('📊 DEBUG: Données reçues:', data);
    console.log('❌ DEBUG: Erreur:', error);
    
    if (data) {
      // Filtrer et afficher seulement les créneaux d'aujourd'hui pour debug
      const today = new Date().toISOString().split('T')[0];
      const todaySlots = data.filter((slot: any) => slot.starts_at.startsWith(today));
      
      console.log('📅 DEBUG: Créneaux aujourd\'hui:', todaySlots.map((s: any) => ({
        heure: new Date(s.starts_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        starts_at: s.starts_at
      })));
    }
    
    setSlots((data ?? []) as any);
  }

  useEffect(() => {
    load();
  }, [start]);

  const grid = useMemo(() => {
    const days = [...Array(7)].map((_, i) => addDays(start, i));
    
    // Générer les heures de base (11h00 à 23h30)
    const times = [];
    for (let hour = 11; hour <= 23; hour++) {
      times.push(new Date(2000, 0, 1, hour, 0));
      if (hour < 23) {
        times.push(new Date(2000, 0, 1, hour, 30));
      }
    }
    times.push(new Date(2000, 0, 1, 23, 30));
    
    console.log('⏰ DEBUG: Heures générées:', times.map(t => t.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })));
    
    return { days, times };
  }, [start]);

  function cell(day: Date, time: Date) {
    const s = slots.find(x => {
      const d = new Date(x.starts_at);
      const match = d.getFullYear() === day.getFullYear() &&
             d.getMonth() === day.getMonth() &&
             d.getDate() === day.getDate() &&
             d.getHours() === time.getHours() && 
             d.getMinutes() === time.getMinutes();
      
      // Debug pour les créneaux du matin
      if (time.getHours() >= 11 && time.getHours() <= 12 && day.getDate() === new Date().getDate()) {
        console.log(`🔍 DEBUG: Recherche créneau ${time.getHours()}:${time.getMinutes().toString().padStart(2, '0')} pour ${day.getDate()}/${day.getMonth() + 1}`);
        console.log('Slot trouvé:', s ? `${new Date(s.starts_at).toLocaleTimeString('fr-FR')}` : 'NON TROUVÉ');
      }
      
      return match;
    });

    if (!s) {
      return (
        <div className="h-16 bg-gray-50 rounded-xl border border-dashed grid place-items-center text-xs text-gray-400">
          Non config.
        </div>
      );
    }

    const ratio = Math.max(s.orders_count / s.max_orders, s.pizzas_count / s.max_pizzas);
    const color = s.blocked 
      ? 'bg-red-100 border-red-300' 
      : ratio >= 1 
        ? 'bg-orange-200 border-orange-400' 
        : ratio >= 0.8 
          ? 'bg-yellow-100 border-yellow-300' 
          : 'bg-green-100 border-green-300';

    return (
      <div className={`h-16 rounded-xl border p-2 text-xs ${color}`}>
        <div className="font-semibold">
          {format(time, 'HH:mm')} - {format(addMinutes(time, 30), 'HH:mm')}
        </div>
        <div>👥 {s.orders_count}/{s.max_orders} • 🍕 {s.pizzas_count}/{s.max_pizzas}</div>
        {s.blocked && <div>Bloqué: {s.reason ?? ''}</div>}
      </div>
    );
  }

  return (
    <Shell>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">Créneaux (DEBUG)</h1>
        <div className="space-x-2">
          <button 
            className="btn" 
            onClick={() => setStartDate(addDays(start, -7))}
          >
            ← Semaine -1
          </button>
          <button 
            className="btn" 
            onClick={() => setStartDate(startOfWeek(new Date(), { weekStartsOn: 1 }))}
          >
            Aujourd'hui
          </button>
          <button 
            className="btn" 
            onClick={() => setStartDate(addDays(start, 7))}
          >
            Semaine +1 →
          </button>
        </div>
      </div>

      {/* Informations de debug */}
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold mb-2">🔍 DEBUG INFO</h3>
        <p><strong>Semaine début:</strong> {start.toLocaleDateString('fr-FR')}</p>
        <p><strong>Nombre de slots chargés:</strong> {slots.length}</p>
        <p><strong>Heures générées:</strong> {grid.times.length} créneaux</p>
        <p><strong>Console:</strong> Ouvre les outils de développement pour voir les logs détaillés</p>
      </div>

      <div className="overflow-y-auto max-h-[80vh]">
        <div className="grid grid-cols-8 gap-2">
          <div></div>
          {grid.days.map(d => (
            <div key={d.toISOString()} className="text-center font-semibold sticky top-0 bg-white z-10 py-2">
              {format(d, 'EEE dd/MM', { locale: fr })}
            </div>
          ))}
          
          {grid.times.map((t, idx) => (
            <div key={'row' + idx} className="contents">
              <div className="text-sm font-medium py-2 sticky left-0 bg-white z-10">
                {format(t, 'HH:mm')}
              </div>
              {grid.days.map(d => (
                <div key={d.toISOString() + format(t, 'HHmm')}>
                  {cell(d, t)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
