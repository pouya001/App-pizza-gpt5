'use client';
import Shell from '@/src/components/Shell';
import { supabase } from '@/src/lib/supabaseClient';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Client = { 
  id: number; 
  name: string; 
  first_name: string | null;
  phone: string; 
  email: string | null; 
  preferences: string | null;
};

type Pizza = {
  id: number;
  name: string;
  description: string;
  price_eur: number;
  available: boolean;
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
  const id = Number(params?.id);
  
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [pizzaQuantities, setPizzaQuantities] = useState<{[key: number]: number}>({});
  
  // État du client sélectionné (lecture seule)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    loadSlots();
  }, [selectedDate]);

  // Nouveau useEffect pour sélectionner le créneau après chargement
  useEffect(() => {
    if (slots.length > 0 && selectedClient && selectedSlot === null) {
      // Ici on pourrait trouver le créneau de la commande originale
      // Pour l'instant on ne fait rien, l'utilisateur devra sélectionner
    }
  }, [slots, selectedClient, selectedSlot]);

  async function loadData() {
    // Charger pizzas
    const { data: p } = await supabase
      .from('pizzas')
      .select('*')
      .eq('available', true)
      .order('name'); 
    
    if (p) {
      setPizzas(p);
      // Initialiser les quantités à 0
      const quantities: {[key: number]: number} = {};
      p.forEach(pizza => quantities[pizza.id] = 0);
      setPizzaQuantities(quantities);
    }

    // Charger clients
    const { data: c } = await supabase
      .from('clients')
      .select('*')
      .order('name'); 
    setClients(c ?? []);

    // Charger la commande existante
    const { data: orderData } = await supabase
      .from('orders')
      .select('*, clients(*)')
      .eq('id', id)
      .single();
    
    const { data: itemsData } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id);

    if (orderData) {
      // Définir le client (lecture seule)
      const clientData = Array.isArray(orderData.clients) ? orderData.clients[0] : orderData.clients;
      setSelectedClient(clientData);
      
      // Extraire la date
      const scheduledDate = new Date(orderData.scheduled_at);
      setSelectedDate(scheduledDate.toISOString().split('T')[0]);
      
      // Notes
      setNotes(orderData.notes || '');
    }
    
    if (itemsData && p) {
      const quantities: {[key: number]: number} = {};
      p.forEach(pizza => quantities[pizza.id] = 0);
      
      itemsData.forEach((item: any) => {
        quantities[item.pizza_id] = item.qty;
      });
      
      setPizzaQuantities(quantities);
    }
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

  function updatePizzaQuantity(pizzaId: number, change: number) {
    setPizzaQuantities(prev => ({
      ...prev,
      [pizzaId]: Math.max(0, (prev[pizzaId] || 0) + change)
    }));
  }

  function calculateTotal() {
    return pizzas.reduce((total, pizza) => {
      return total + (pizza.price_eur * (pizzaQuantities[pizza.id] || 0));
    }, 0);
  }

  async function save() {
    if (!selectedClient) { 
      alert('Erreur: client introuvable'); 
      return; 
    }
    
    if (!selectedSlot) {
      alert('Veuillez sélectionner un créneau');
      return;
    }
    
    const selectedPizzas = Object.entries(pizzaQuantities).filter(([_, qty]) => qty > 0);
    if (selectedPizzas.length === 0) {
      alert('Veuillez sélectionner au moins une pizza');
      return;
    }

    try {
      // Trouver l'heure du créneau sélectionné
      const selectedSlotData = slots.find(s => s.id === selectedSlot);
      if (!selectedSlotData) throw new Error('Créneau introuvable');

      // Préparer les items de la commande
      const orderItems = selectedPizzas.map(([pizzaId, qty]) => {
        const pizza = pizzas.find(p => p.id === parseInt(pizzaId));
        return {
          pizza_id: parseInt(pizzaId),
          qty: qty,
          price_eur: pizza?.price_eur || 0
        };
      });

      const total = calculateTotal();
      
      // Modifier la commande existante
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          scheduled_at: selectedSlotData.starts_at, 
          notes: notes.trim() || null, 
          total_eur: total 
        })
        .eq('id', id);
      
      if (orderError) throw orderError;
      
      // Supprimer les anciens items
      await supabase.from('order_items').delete().eq('order_id', id);
      
      // Ajouter les nouveaux items
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems.map(item => ({ order_id: id, ...item })));
      
      if (itemsError) throw itemsError;
      
      // Redirection directe
      router.push('/orders');
      
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  }

  if (!selectedClient) {
    return (
      <Shell>
        <div className="text-center py-12">
          <div className="text-lg mb-2">Chargement...</div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Modifier la commande</h1>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Informations client (LECTURE SEULE) */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-lg font-medium mb-4">Informations client (non modifiable)</h2>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Client:</strong> {selectedClient.first_name} {selectedClient.name}</div>
              <div><strong>Téléphone:</strong> {selectedClient.phone}</div>
              {selectedClient.email && <div><strong>Email:</strong> {selectedClient.email}</div>}
              {selectedClient.preferences && (
                <div className="col-span-2">
                  <strong>Préférences:</strong> {selectedClient.preferences}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Date et créneaux */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-lg font-medium mb-4">Date et créneau</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Date *</label>
            <input
              type="date"
              required
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Créneau *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
        </div>

        {/* Pizzas avec compteurs */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-lg font-medium mb-4">Pizzas</h2>
          
          <div className="space-y-3">
            {pizzas.map(pizza => (
              <div key={pizza.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{pizza.name}</div>
                  <div className="text-sm text-gray-500">{pizza.description}</div>
                  <div className="text-sm font-medium text-green-600">{pizza.price_eur.toFixed(2)} €</div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updatePizzaQuantity(pizza.id, -1)}
                    disabled={pizzaQuantities[pizza.id] === 0}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 flex items-center justify-center text-lg font-bold"
                  >
                    -
                  </button>
                  
                  <span className="w-8 text-center font-medium">
                    {pizzaQuantities[pizza.id] || 0}
                  </span>
                  
                  <button
                    type="button"
                    onClick={() => updatePizzaQuantity(pizza.id, 1)}
                    className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center text-lg font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg p-6 shadow">
          <label className="block text-sm font-medium mb-2">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="Commentaires, instructions spéciales..."
          />
        </div>

        {/* Total et boutons */}
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium">Total:</span>
            <span className="text-2xl font-bold text-green-600">
              {calculateTotal().toFixed(2)} €
            </span>
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push('/orders')}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={save}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Enregistrer les modifications
            </button>
          </div>
