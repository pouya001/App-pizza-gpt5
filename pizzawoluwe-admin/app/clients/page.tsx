'use client';
import Shell from '@/src/components/Shell';
import { supabase } from '@/src/lib/supabaseClient';
import { useEffect, useMemo, useState } from 'react';

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

export default function ClientsPage() {
  const [rows, setRows] = useState<Client[]>([]);
  const [q, setQ] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  // État du formulaire
  const [formData, setFormData] = useState({
    name: '',
    first_name: '',
    phone: '',
    email: '',
    preferences: ''
  });

  async function load() {
    const { data } = await supabase
      .from('clients_stats_view')
      .select('*')
      .order('last_order_at', { ascending: false, nullsFirst: false });
    setRows((data ?? []) as any);
  }

  useEffect(() => {
    load();
  }, []);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Nom et téléphone sont requis');
      return;
    }

    try {
      if (editingClient) {
        // Modification
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
        // Création
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

      {/* Formulaire modal */}
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
                      {c.name} {c.first_name}
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
                  <div className="flex gap-2">
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
