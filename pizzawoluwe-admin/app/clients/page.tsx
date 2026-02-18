'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Shell from '@/src/components/Shell';
import { supabase } from '@/src/lib/supabaseClient';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', email: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadClients(); }, []);

  async function loadClients() {
    setLoading(true);
    const { data } = await supabase
      .from('clients')
      .select('*, buildings(id)')
      .order('last_name', { ascending: true });
    setClients(data ?? []);
    setLoading(false);
  }

  async function saveClient(e: React.FormEvent) {
    e.preventDefault();
    if (!form.last_name.trim()) return;
    setSaving(true);
    await supabase.from('clients').insert({
      first_name: form.first_name || null,
      last_name: form.last_name,
      phone: form.phone || null,
      email: form.email || null,
      notes: form.notes || null,
    });
    setForm({ first_name: '', last_name: '', phone: '', email: '', notes: '' });
    setShowForm(false);
    setSaving(false);
    await loadClients();
  }

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.last_name?.toLowerCase().includes(q) ||
      c.first_name?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  });

  return (
    <Shell>
      <div className="space-y-4 max-w-2xl">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary text-sm">
            + Nouveau client
          </button>
        </div>

        {/* Formulaire nouveau client */}
        {showForm && (
          <form onSubmit={saveClient} className="card space-y-3 border-orange-500/40">
            <h2 className="font-semibold text-white">Nouveau client</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label>Prénom</label>
                <input className="input" placeholder="Marie" value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
              </div>
              <div>
                <label>Nom *</label>
                <input className="input" placeholder="Dupont" required value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
              </div>
            </div>
            <div>
              <label>Téléphone</label>
              <input className="input" type="tel" placeholder="+32 470 123 456" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label>Email</label>
              <input className="input" type="email" placeholder="client@email.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label>Notes</label>
              <textarea className="input" placeholder="Remarques…" value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn btn-primary flex-1">
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost flex-1">
                Annuler
              </button>
            </div>
          </form>
        )}

        {/* Recherche */}
        <input
          className="input"
          placeholder="🔍  Rechercher un client (nom, téléphone, email)…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Liste */}
        {loading ? (
          <div className="card animate-pulse h-32 flex items-center justify-center text-slate-500">
            Chargement…
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center text-slate-400 py-10">
            <div className="text-4xl mb-2">👥</div>
            <p>{search ? 'Aucun résultat' : 'Aucun client enregistré'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((c) => (
              <Link key={c.id} href={`/clients/${c.id}`} className="card-hover flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-sm shrink-0">
                      {(c.first_name?.[0] ?? c.last_name?.[0] ?? '?').toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        {c.first_name} {c.last_name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {c.phone ?? c.email ?? 'Aucun contact'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <div className="text-xs text-slate-400">
                    {c.buildings?.length ?? 0} bâtiment{(c.buildings?.length ?? 0) !== 1 ? 's' : ''}
                  </div>
                  <div className="text-orange-400 text-lg">›</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
