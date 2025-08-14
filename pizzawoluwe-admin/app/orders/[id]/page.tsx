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
  first_name: string | null;
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

type Slot = {
  id: number;
  starts_at: string;
  max_orders: number;
  max_pizzas: number;
  blocked: boolean;
  orders_count: number;
  pizzas_count: number;
};

export default function OrderEdit() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id === 'new' ? null : Number(params?.id);
  const isEdit = id !== null;
  
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [order, setOrder] = useState<Order>({ 
    client_id: null, 
    scheduled_at: new Date().toISOString(), 
    status: 'waiting', 
    notes: null 
  });
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [customPrices, setCustomPrices] = useState<Record<number, number>>({});
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadPizzas();
    loadClients();
    if (isEdit) {
      loadOrder();
    }
  }, [id]);

  useEffect(() => {
    loadSlots();
  }, [selectedDate]);

  async function loadPizzas() {
    const { data: p } = await supabase
      .from('pizzas')
      .select('*')
      .eq('available', true)
      .order('name');
    setPizzas(p ?? []);
  }

  async function loadClients() {
    const { data: c } = await supabase
      .from('clients')
      .select('*')
      .order('name');
    setClients(c ?? []);
  }

  async function loadSlots() {
    const startDate = new Date(selectedDate + 'T00:00:00');
    const endDate = new Date(selectedDate + 'T23:59:59');
    
    const { data } = await supabase
      .rpc('get_slots_with_usage', {
        p_from: startDate.toISOString(),
        p_to: endDate.toISOString()
      });
    
    if (data) {
      setSlots(data);
    }
  }

  async function loadOrder() {
    if (!id) return;

    const { data: orderData } = await supabase
      .from('orders')
      .select(`
        *,
        clients!inner(id, name, first_name, phone, email)
      `)
      .eq('id', id)
      .single();

    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id);

    if (orderData) {
      setOrder({
        id: orderData.id,
        number: orderData.number,
        client_id: orderData.client_id,
        scheduled_at: orderData.scheduled_at,
        status: orderData.status,
        notes: orderData.notes
      });
      
      // Le client est fixe en modification
      setSelectedClient(orderData.clients);
      
      // Définir la date du créneau existant
      const orderDate = new Date(orderData.scheduled_at);
      setSelectedDate(orderDate.toISOString().split('T')[0]);
      
      // Remplir les quantités et prix
      const newQuantities: Record<number, number> = {};
      const newCustomPrices: Record<number, number> = {};
      
      items?.forEach(item => {
        newQuantities[item.pizza_id] = item.qty;
        newCustomPrices[item.pizza_id] = item.price_eur;
      });
      
      setQuantities(newQuantities);
      setCustomPrices(newCustomPrices);
    }
  }

  // Sélectionner automatiquement le créneau existant quand les slots se chargent
  useEffect(() => {
    if (isEdit && order.scheduled_at && slots.length > 0 && selectedSlot === null) {
      const orderTime = new Date(order.scheduled_at);
      const matchingSlot = slots.find(slot => {
        const slotTime = new Date(slot.starts_at);
        return slotTime.getTime() === orderTime.getTime();
      });
      if (matchingSlot) {
        setSelectedSlot(matchingSlot.id);
      }
    }
  }, [slots, order.scheduled_at, isEdit, selectedSlot]);

  // Calculer les items avec quantité > 0
  const activeItems = useMemo(() => {
    return pizzas
      .filter(pizza => quantities[pizza.id] > 0)
      .map(pizza => ({
        pizza_id: pizza.id,
        qty: quantities[pizza.id],
        price_eur: customPrices[pizza.id] ?? pizza.price_eur
      }));
  }, [pizzas, quantities, customPrices]);

  // Calculer le total
  const total = useMemo(() => {
    return activeItems.reduce((sum, item) => sum + (item.price_eur * item.qty), 0);
  }, [activeItems]);

  function setQuantity(pizzaId: number, qty: number) {
    setQuantities(prev => ({
      ...prev,
      [pizzaId]: Math.max(0, qty)
    }));
  }

  function setCustomPrice(pizzaId: number, price: number) {
    setCustomPrices(prev => ({
      ...prev,
      [pizzaId]: Math.max(0, price)
    }));
  }

  async function save() {
    // Validation pour nouvelle commande
    if (!isEdit && !order.client_id) {
      alert('Choisissez un client.');
      return;
    }
    
    if (!selectedSlot) {
      alert('Veuillez sélectionner un créneau.');
      return;
    }
    
    if (activeItems.length === 0) {
      alert('Ajoutez au moins une pizza.');
      return;
    }

    // Trouver l'heure du créneau sélectionné
    const selectedSlotData = slots.find(s => s.id === selectedSlot);
    if (!selectedSlotData) {
      alert('Créneau introuvable.');
      return;
    }

    let orderId = id;

    if (orderId) {
      // Modification
      const { error } = await supabase
        .from('orders')
        .update({
          scheduled_at: selectedSlotData.starts_at,
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
      if (activeItems.length > 0) {
        await supabase
          .from('order_items')
          .insert(activeItems.map(item => ({ order_id: orderId!, ...item })));
      }

    } else {
      // Création
      const { data, error } = await supabase.rpc('create_order_with_items', {
        p_client_id: order.client_id,
        p_scheduled_at: selectedSlotData.starts_at,
        p_notes: order.notes,
        p_items: activeItems
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
        {isEdit ? 'Modifier la commande' : 'Nouvelle commande'}
      </h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Informations de la commande */}
        <div className="card space-y-4">
          <h2 className="font-semibold">Informations</h2>
          
          <div>
            <label className="block text-sm mb-1">Client</label>
            {isEdit && selectedClient ? (
              // En modification : affichage readonly du client
              <div className="input bg-gray-50 cursor-not-allowed">
                <span className="font-bold">{selectedClient.first_name || selectedClient.name}</span>
                {selectedClient.first_name && (
                  <span className="text-gray-600"> {selectedClient.name}</span>
                )}{' '}
                <span className="text-gray-500">({selectedClient.phone})</span>
              </div>
            ) : (
              // En création : sélecteur de client
              <select 
                className="select" 
                value={order.client_id ?? ''} 
                onChange={e => setOrder({...order, client_id: Number(e.target.value)})}
              >
                <option value="">-- Sélectionner un client --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    <span className="font-bold">{c.first_name || c.name}</span>
                    {c.first_name && <span> {c.name}</span>} ({c.phone})
                  </option>
                ))}
              </select>
            )}
          </div>
          
          {/* Date et créneaux - IDENTIQUE à nouvelle commande */}
          <div>
            <label className="block text-sm mb-1">Date *</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Créneau *</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {slots.map(slot => {
                const time = new Date(slot.starts_at);
                const isAvailable = !slot.blocked && slot.orders_count < slot.max_orders;
                
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => setSelectedSlot(slot.id)}
                    className={`p-2 text-xs rounded border ${
                      selectedSlot === slot.id
                        ? 'bg-red-600 text-white border-red-600'
                        : isAvailable
                        ? 'bg-white hover:bg-gray-50 border-gray-300'
                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    }`}
                  >
                    <div className="font-medium">
                      {time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div>
                      {slot.orders_count}/{slot.max_orders} cmd
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div>
            <label className="block text-sm mb-1">Statut</label>
            <select 
              className="select" 
              value={order.status} 
              onChange={e => setOrder({...order, status: e.target.value})}
            >
              <option value="waiting">En attente</option>
              <option value="confirmed">Confirmée</option>
              <option value="preparing">En préparation</option>
              <option value="ready">Prête</option>
              <option value="delivered">Livrée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm mb-1">Notes</label>
            <textarea 
              className="input" 
              rows={3} 
              value={order.notes ?? ''} 
              onChange={e => setOrder({...order, notes: e.target.value})} 
              placeholder="Informations supplémentaires..."
            />
          </div>
        </div>
        
        {/* Sélection des pizzas - IDENTIQUE à nouvelle commande */}
        <div className="card space-y-4">
          <h2 className="font-semibold">Pizzas</h2>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pizzas.map(pizza => (
              <div key={pizza.id} className="flex items-center gap-3 p-3 border rounded">
                <div className="flex-1">
                  <div className="font-medium">{pizza.name}</div>
                  <div className="text-sm text-gray-500">Prix de base : {pizza.price_eur.toFixed(2)}€</div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="btn w-8 h-8 p-0 text-lg"
                      onClick={() => setQuantity(pizza.id, (quantities[pizza.id] || 0) - 1)}
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-medium">
                      {quantities[pizza.id] || 0}
                    </span>
                    <button
                      type="button"
                      className="btn w-8 h-8 p-0 text-lg"
                      onClick={() => setQuantity(pizza.id, (quantities[pizza.id] || 0) + 1)}
                    >
                      +
                    </button>
                  </div>
                  
                  {quantities[pizza.id] > 0 && (
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="input w-20"
                      value={customPrices[pizza.id] ?? pizza.price_eur}
                      onChange={e => setCustomPrice(pizza.id, Number(e.target.value))}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Récapitulatif */}
          {activeItems.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Récapitulatif</h3>
              {activeItems.map(item => {
                const pizza = pizzas.find(p => p.id === item.pizza_id);
                return (
                  <div key={item.pizza_id} className="flex justify-between text-sm">
                    <span>{pizza?.name} × {item.qty}</span>
                    <span>{(item.price_eur * item.qty).toFixed(2)}€</span>
                  </div>
                );
              })}
              <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>{total.toFixed(2)}€</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 flex gap-2">
        <button className="btn btn-primary" onClick={save}>
          {isEdit ? 'Mettre à jour' : 'Créer la commande'}
        </button>
        <button 
          className="btn" 
          onClick={() => router.push('/orders')}
        >
          Annuler
        </button>
      </div>
    </Shell>
  );
}
