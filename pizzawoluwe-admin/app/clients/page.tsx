'use client';
import Shell from '@/src/components/Shell';
import { supabase } from '@/src/lib/supabaseClient';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Client = { 
  id: number; 
  name: string; 
  first_name: string | null;
  phone: string; 
  email: string | null; 
  preferences: string | null;
  first_order_at: string | null; 
  last_order_at: string | null; 
  orders_count: number; 
  total_spent: number 
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

export default function ClientsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Client[]>([]);
  const [q, setQ] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  // État du formulaire client
  const [formData, setFormData] = useState({
    name: '',
    first_name: '',
    phone: '',
    email: '',
    preferences: ''
  });

  // État pour nouvelle commande
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderClient, setOrderClient] = useState<Client | null>(null);
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [pizzaQuantities, setPizzaQuantities] = useState<{[key: number]: number}>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  async function load() {
    const { data } = await supabase
      .from('clients_stats_view')
      .select('*')
      .order('last_order_at', { ascending: false, nullsFirst: false });
    setRows((data ?? []) as any);
  }

  async function loadPizzas() {
    const { data } = await supabase
      .from('pizzas')
      .select('*')
      .eq('available', true)
      .order('name');
    
    if (data) {
      setPizzas(data);
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

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (showOrderForm) {
      loadPizzas();
      loadSlots();
    }
  }, [showOrderForm, selectedDate]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter(r => 
      !term || 
      r.name.toLowerCase().includes(term) || 
      (r.first_name ?? '').toLowerCase().includes(term) ||
      (r.phone ?? '').includes(term) || 
      (r.email ?? '').toLowerCase().includes(term)
    );
  }, [rows, q]);

  function resetForm() {
    setFormData({ name: '', first_name: '', phone: '', email: '', preferences: '' });
    setEditingClient(null);
    setShowForm(false);
  }

  function resetOrderForm() {
    setShowOrderForm(false);
    setOrderClient(null);
    setSelectedSlot(null);
    setNotes('');
    const quantities: {[key: number]: number} = {};
    pizzas.forEach(pizza => quantities[pizza.id] = 0);
    setPizzaQuantities(quantities);
  }

  function openEditForm(client: Client) {
    setFormData({
      name: client.name,
      first_name: client.first_name ?? '',
      phone: client.phone,
      email: client.email ?? '',
      preferences: client.preferences ?? ''
    });
    setEditingClient(client);
    setShowForm(true);
  }

  function openOrderForm(client: Client) {
    setOrderClient(client);
    setShowOrderForm(true);
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
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Nom et téléphone sont requis');
      return;
    }

    try {
      if (editingClient) {
        const { error } = await supabase
          .from('clients')
          .update({
            name: formData.name.trim(),
            first_name: formData.first_name.trim() || null,
            phone: formData.phone.trim(),
            email: formData.email.trim() || null,
            preferences: formData.preferences.trim() || null
          })
          .eq('id', editingClient.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clients')
          .insert({
            name: formData.name.trim(),
            first_name: formData.first_name.trim() || null,
            phone: formData.phone.trim(),
            email: formData.email.trim() || null,
            preferences: formData.preferences.trim() || null
          });
        
        if (error) throw error;
      }

      resetForm();
      load();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  }

  async function handleOrderSubmit(e: React.FormEvent) {
    e.preventDefault();
    
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
      const orderItems = selectedPizzas.map(([pizzaId, qty]) => {
        const pizza = pizzas.find(p => p.id === parseInt(pizzaId));
        return {
          pizza_id: parseInt(pizzaId),
          qty: qty,
          price_eur: pizza?.price_eur || 0
        };
      });

      const selectedSlotData = slots.find(s => s.id === selectedSlot);
      if (!selectedSlotData) throw new Error('Créneau introuvable');

      const { error } = await supabase
        .rpc('create_order_with_items', {
          p_client_id: orderClient!.id,
          p_scheduled_at: selectedSlotData.starts_at,
          p_notes: notes.trim() || null,
          p_items: orderItems
        });

      if (error) throw error;

      resetOrderForm();
      router.push('/orders');

    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  }

  async function handleDelete(client: Client) {
    if (!confirm(`Supprimer le client ${client.name} ${client.first_name ?? ''} ?`)) return;
    
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', client.id);
      
      if (error) throw error;
      load();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  }

  return (
    <Shell>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <h1 className="text-xl font-semibold">Clients</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          + Nouveau client
        </button>
      </div>

      {/* Formulaire client modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {editingClient ? 'Modifier le client' : 'Nouveau client'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Prénom</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Téléphone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Préférences</label>
                <textarea
                  value={formData.preferences}
                  onChange={(e) => setFormData({...formData, preferences: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Allergies, préférences spéciales..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  {editingClient ? 'Modifier' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Formulaire nouvelle commande modal */}
      {showOrderForm && orderClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              Nouvelle commande pour {orderClient.first_name} {orderClient.name}
            </h2>
            
            <form onSubmit={handleOrderSubmit} className="space-y-6">
              {/* Infos client (lecture seule) */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Client:</strong> {orderClient.first_name} {orderClient.name}</div>
                  <div><strong>Téléphone:</strong> {orderClient.phone}</div>
                  {orderClient.email && <div><strong>Email:</strong> {orderClient.email}</div>}
                  {orderClient.preferences && (
                    <div className="col-span-2">
                      <strong>Préférences:</strong> {orderClient.preferences}
                    </div>
                  )}
                </div>
              </div>

              {/* Date et créneaux */}
              <div>
                <label className="block text-sm font-medium mb-2">Date *</label>
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
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
                          {slot.orders_count}/{slot.max_orders}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pizzas */}
              <div>
                <label className="block text-sm font-medium mb-2">Pizzas</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {pizzas.map(pizza => (
                    <div key={pizza.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{pizza.name}</div>
                        <div className="text-xs text-gray-500">{pizza.description}</div>
                        <div className="text-xs font-medium text-green-600">{pizza.price_eur.toFixed(2)} €</div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updatePizzaQuantity(pizza.id, -1)}
                          disabled={pizzaQuantities[pizza.id] === 0}
                          className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 flex items-center justify-center text-sm font-bold"
                        >
                          -
                        </button>
                        
                        <span className="w-6 text-center text-sm font-medium">
                          {pizzaQuantities[pizza.id] || 0}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => updatePizzaQuantity(pizza.id, 1)}
                          className="w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center text-sm font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Instructions spéciales..."
                />
              </div>

              {/* Total et boutons */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium">Total:</span>
                  <span className="text-xl font-bold text-green-600">
                    {calculateTotal().toFixed(2)} €
                  </span>
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={resetOrderForm}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Créer la commande
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recherche */}
      <div className="mb-4">
        <input 
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500" 
          placeholder="Rechercher nom / prénom / téléphone / email" 
          value={q} 
          onChange={e => setQ(e.target.value)}
        />
      </div>

      {/* Liste des clients */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">#Cmd</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Total</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900">
                      {c.first_name} {c.name}
                    </div>
                    {c.preferences && (
                      <div className="text-xs text-gray-500 mt-1">
                        {c.preferences}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{c.phone}</td>
                <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">{c.email ?? '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-900 hidden md:table-cell">{c.orders_count}</td>
                <td className="px-4 py-3 text-sm text-gray-900 hidden md:table-cell">{c.total_spent?.toFixed(2)} €</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => openOrderForm(c)}
                      className="w-8 h-8 bg-green-100 text-green-700 rounded-full hover:bg-green-200 flex items-center justify-center text-lg font-bold"
                      title="Nouvelle commande"
                    >
                      +
                    </button>
                    <button
                      onClick={() => openEditForm(c)}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {q ? 'Aucun client trouvé' : 'Aucun client enregistré'}
          </div>
        )}
      </div>
    </Shell>
  );
}
