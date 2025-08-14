'use client';

import Shell from '@/src/components/Shell';
import { supabase } from '@/src/lib/supabaseClient';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Pizza = { 
  id: number; 
  name: string; 
  price_eur: number; 
  available: boolean; 
};

type Client = { 
  id: number; 
  name: string; 
  phone: string; 
  email: string | null; 
};

type Order = { 
  id?: number; 
  number?: string; 
  client_id: number | null; 
  scheduled_at: string; 
  status: string; 
  notes: string | null; 
};

type Item = { 
  pizza_id: number | null; 
  qty: number; 
  price_eur: number; 
};

export default function OrderEdit() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id === 'new' ? null : Number(params?.id);
  
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [order, setOrder] = useState<Order>({ 
    client_id: null, 
    scheduled_at: new Date().toISOString(), 
    status: 'waiting', 
    notes: null 
  });
  const [items, setItems] = useState<Item[]>([{ 
    pizza_id: null, 
    qty: 1, 
    price_eur: 0 
  }]);

  useEffect(() => {
    (async () => {
      // Charger les pizzas
      const { data: p } = await supabase
        .from('pizzas')
        .select('*')
        .eq('available', true)
        .order('name');
      setPizzas(p ?? []);

      // Charger les clients
      const { data: c } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      setClients(c ?? []);

      // Si modification, charger la commande existante
      if (id) {
        const { data } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();

        const { data: it } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', id);

        if (data) setOrder(data as any);
        if (it) {
          setItems((it as any).map((x: any) => ({
            pizza_id: x.pizza_id,
            qty: x.qty,
            price_eur: x.price_eur
          })));
        }
      }
    })();
  }, [id]);

  const total = useMemo(() => 
    items.reduce((s, it) => s + (it.price_eur || 0) * (it.qty || 0), 0), 
    [items]
  );

  function setItem(idx: number, patch: Partial<Item>) {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));
  }

  function addItem() {
    setItems(prev => [...prev, { pizza_id: null, qty: 1, price_eur: 0 }]);
  }

  function removeItem(i: number) {
    setItems(prev => prev.filter((_, idx) => idx !== i));
  }

  function onPizzaChange(i: number, pizza_id: number) {
    const p = pizzas.find(p => p.id === pizza_id);
    setItem(i, { pizza_id, price_eur: p?.price_eur ?? 0 });
  }

  async function save() {
    if (!order.client_id) {
      alert('Choisissez un client.');
      return;
    }
    
    if (!items.length || items.some(it => !it.pizza_id)) {
      alert('Ajoutez au moins une pizza.');
      return;
    }

    let orderId = id;

    if (orderId) {
      // Modification
      const { error } = await supabase
        .from('orders')
        .update({
          client_id: order.client_id,
          scheduled_at: order.scheduled_at,
          status: order.status,
          notes: order.notes,
          total_eur: total
        })
        .eq('id', orderId);

      if (error) {
        alert(error.message);
        return;
      }

      // Supprimer les anciens items
      await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      // Ajouter les nouveaux items
      await supabase
        .from('order_items')
        .insert(items.map(it => ({ order_id: orderId!, ...it })));

    } else {
      // Création
      const { data, error } = await supabase.rpc('create_order_with_items', {
        p_client_id: order.client_id,
        p_scheduled_at: order.scheduled_at,
        p_notes: order.notes,
        p_items: items
      });

      if (error) {
        alert(error.message);
        return;
      }
      
      orderId = data?.id;
    }

    router.push('/orders');
  }

  return (
    <Shell>
      <h1 className="text-xl font-semibold mb-4">
        {id ? 'Modifier la commande' : 'Nouvelle commande'}
      </h1>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card space-y-3">
          <div>
            <label className="block text-sm mb-1">Client</label>
            <select 
              className="select" 
              value={order.client_id ?? ''} 
              onChange={e => setOrder({...order, client_id: Number(e.target.value)})}
            >
              <option value="">-- Sélectionner --</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm mb-1">Date/Heure</label>
            <input 
              className="input" 
              type="datetime-local" 
              value={order.scheduled_at.slice(0, 16)} 
              onChange={e => setOrder({
                ...order, 
                scheduled_at: new Date(e.target.value).toISOString()
              })}
            />
          </div>
          
          <div>
            <label className="block text-sm mb-1">Notes</label>
            <textarea 
              className="input" 
              rows={3} 
              value={order.notes ?? ''} 
              onChange={e => setOrder({...order, notes: e.target.value})} 
            />
          </div>
        </div>
        
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Pizzas</h2>
            <button className="btn" onClick={addItem}>+ Ajouter</button>
          </div>
          
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-7">
                <select 
                  className="select" 
                  value={it.pizza_id ?? ''} 
                  onChange={e => onPizzaChange(i, Number(e.target.value))}
                >
                  <option value="">-- Pizza --</option>
                  {pizzas.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.price_eur.toFixed(2)}€
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="col-span-2">
                <input 
                  className="input" 
                  type="number" 
                  min={1} 
                  max={10} 
                  value={it.qty} 
                  onChange={e => setItem(i, { qty: Number(e.target.value) })}
                />
              </div>
              
              <div className="col-span-2">
                <input 
                  className="input" 
                  type="number" 
                  min={0} 
                  step="0.01" 
                  value={it.price_eur} 
                  onChange={e => setItem(i, { price_eur: Number(e.target.value) })}
                />
              </div>
              
              <div className="col-span-1 text-right">
                <button className="btn" onClick={() => removeItem(i)}>✕</button>
              </div>
            </div>
          ))}
          
          <div className="text-right font-semibold">
            Total: {total.toFixed(2)} €
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex gap-2">
        <button className="btn btn-primary" onClick={save}>
          Enregistrer
        </button>
      </div>
    </Shell>
  );
}
