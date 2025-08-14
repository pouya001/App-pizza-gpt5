'use client';
import Shell from '@/src/components/Shell';
import { supabase } from '@/src/lib/supabaseClient';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

export default function NewOrderPage() {
  const router = useRouter();
  
  // État du formulaire
  const [clientData, setClientData] = useState({
    id: null as number | null,
    name: '',
    first_name: '',
    phone: '',
    email: '',
    preferences: ''
  });
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  
  // Auto-complétion
  const [nameSuggestions, setNameSuggestions] = useState<Client[]>([]);
  const [phoneSuggestions, setPhoneSuggestions] = useState<Client[]>([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [showPhoneSuggestions, setShowPhoneSuggestions] = useState(false);
  
  // Pizzas et créneaux
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [pizzaQuantities, setPizzaQuantities] = useState<{[key: number]: number}>({});
  
  // Chargement initial
  useEffect(() => {
    loadPizzas();
    loadSlots();
  }, [selectedDate]);

  async function loadPizzas() {
    const { data } = await supabase
      .from('pizzas')
      .select('*')
      .eq('available', true)
      .order('name');
    
    if (data) {
      setPizzas(data);
      // Initialiser les quantités à 0
      const quantities: {[key: number]: number} = {};
      data.forEach(pizza => quantities[pizza.id] = 0);
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

  // Auto-complétion par nom
  async function searchByName(searchTerm: string) {
    if (searchTerm.length < 2) {
      setNameSuggestions([]);
      setShowNameSuggestions(false);
      return;
    }

    const { data } = await supabase
      .from('clients')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%`)
      .limit(5);

    if (data) {
      setNameSuggestions(data);
      setShowNameSuggestions(true);
    }
  }

  // Auto-complétion par téléphone
  async function searchByPhone(searchTerm: string) {
    if (searchTerm.length < 3) {
      setPhoneSuggestions([]);
      setShowPhoneSuggestions(false);
      return;
    }

    const { data } = await supabase
      .from('clients')
      .select('*')
      .ilike('phone', `%${searchTerm}%`)
      .limit(5);

    if (data) {
      setPhoneSuggestions(data);
      setShowPhoneSuggestions(true);
    }
  }

  function selectClient(client: Client) {
    setClientData({
      id: client.id,
      name: client.name,
      first_name: client.first_name || '',
      phone: client.phone,
      email: client.email || '',
      preferences: client.preferences || ''
    });
    setNameSuggestions([]);
    setPhoneSuggestions([]);
    setShowNameSuggestions(false);
    setShowPhoneSuggestions(false);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validations
    if (!clientData.name.trim()) {
      alert('Le nom est requis');
      return;
    }
    
    if (!clientData.phone.trim()) {
      alert('Le téléphone est requis');
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
      let clientId = clientData.id;
      
      // Créer le client s'il n'existe pas
      if (!clientId) {
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            name: clientData.name.trim(),
            first_name: clientData.first_name.trim() || null,
            phone: clientData.phone.trim(),
            email: clientData.email.trim() || null,
            preferences: clientData.preferences.trim() || null
          })
          .select()
          .single();
        
        if (clientError) throw clientError;
        clientId = newClient.id;
      }

      // Préparer les items de la commande
      const orderItems = selectedPizzas.map(([pizzaId, qty]) => {
        const pizza = pizzas.find(p => p.id === parseInt(pizzaId));
        return {
          pizza_id: parseInt(pizzaId),
          qty: qty,
          price_eur: pizza?.price_eur || 0
        };
      });

      // Trouver l'heure du créneau sélectionné
      const selectedSlotData = slots.find(s => s.id === selectedSlot);
      if (!selectedSlotData) throw new Error('Créneau introuvable');

      // Créer la commande avec les items
      const { data: order, error: orderError } = await supabase
        .rpc('create_order_with_items', {
          p_client_id: clientId,
          p_scheduled_at: selectedSlotData.starts_at,
          p_notes: notes.trim() || null,
          p_items: orderItems
        });

      if (orderError) throw orderError;

      // Redirection directe sans popup
      router.push('/orders');

    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  }

  return (
    <Shell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Nouvelle commande</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Informations client */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-lg font-medium mb-4">Informations client</h2>
          
          {/* Nom avec auto-complétion */}
          <div className="relative mb-4">
            <label className="block text-sm font-medium mb-1">Nom *</label>
            <input
              type="text"
              required
              value={clientData.name}
              onChange={(e) => {
                setClientData({...clientData, name: e.target.value});
                searchByName(e.target.value);
              }}
              onBlur={() => setTimeout(() => setShowNameSuggestions(false), 200)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            
            {showNameSuggestions && nameSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                {nameSuggestions.map(client => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => selectClient(client)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 border-b last:border-b-0"
                  >
                    <div className="font-medium">{client.name} {client.first_name}</div>
                    <div className="text-xs text-gray-500">{client.phone}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Prénom */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Prénom</label>
            <input
              type="text"
              value={clientData.first_name}
              onChange={(e) => setClientData({...clientData, first_name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Téléphone avec auto-complétion */}
          <div className="relative mb-4">
            <label className="block text-sm font-medium mb-1">Téléphone *</label>
            <input
              type="tel"
              required
              value={clientData.phone}
              onChange={(e) => {
                setClientData({...clientData, phone: e.target.value});
                searchByPhone(e.target.value);
              }}
              onBlur={() => setTimeout(() => setShowPhoneSuggestions(false), 200)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            
            {showPhoneSuggestions && phoneSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                {phoneSuggestions.map(client => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => selectClient(client)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 border-b last:border-b-0"
                  >
                    <div className="font-medium">{client.phone}</div>
                    <div className="text-xs text-gray-500">{client.name} {client.first_name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={clientData.email}
              onChange={(e) => setClientData({...clientData, email: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Préférences */}
          {clientData.preferences && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Préférences</label>
              <div className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                {clientData.preferences}
              </div>
            </div>
          )}
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

        {/* Pizzas */}
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
              type="submit"
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Enregistrer la commande
            </button>
          </div>
        </div>
      </form>
    </Shell>
  );
}
