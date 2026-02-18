'use client';
import { useEffect, useState } from 'react';
import Shell from '@/src/components/Shell';
import { supabase } from '@/src/lib/supabaseClient';
import { formatEuro } from '@/src/lib/formatters';

const TYPES = [
  { value: 'part',    label: 'Pièce',       icon: '🔩' },
  { value: 'service', label: 'Service / MO', icon: '🛠️' },
  { value: 'travel',  label: 'Déplacement',  icon: '🚐' },
];

const emptyForm = {
  type: 'part', reference: '', barcode: '', name: '', description: '',
  purchase_price: '', sale_price: '', stock: '0', unit: 'pce',
};

export default function CatalogPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('catalog_items').select('*').order('type').order('name');
    setItems(data ?? []);
    setLoading(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.sale_price) return;
    setSaving(true);
    const payload = {
      type: form.type,
      reference: form.reference || null,
      barcode: form.barcode || null,
      name: form.name,
      description: form.description || null,
      purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : null,
      sale_price: parseFloat(form.sale_price),
      stock: form.type === 'part' ? parseInt(form.stock) || 0 : 0,
      unit: form.unit,
    };
    if (editId) {
      await supabase.from('catalog_items').update(payload).eq('id', editId);
    } else {
      await supabase.from('catalog_items').insert(payload);
    }
    setSaving(false);
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
    await load();
  }

  function openEdit(item: any) {
    setEditId(item.id);
    setForm({
      type: item.type, reference: item.reference ?? '', barcode: item.barcode ?? '',
      name: item.name, description: item.description ?? '',
      purchase_price: item.purchase_price ?? '', sale_price: item.sale_price ?? '',
      stock: item.stock ?? '0', unit: item.unit ?? 'pce',
    });
    setShowForm(true);
  }

  async function toggleActive(item: any) {
    await supabase.from('catalog_items').update({ active: !item.active }).eq('id', item.id);
    await load();
  }

  async function updateStock(itemId: number, delta: number) {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const newStock = Math.max(0, (item.stock ?? 0) + delta);
    await supabase.from('catalog_items').update({ stock: newStock }).eq('id', itemId);
    await load();
  }

  async function deleteItem(itemId: number) {
    if (!confirm('Supprimer cet article du catalogue ?')) return;
    await supabase.from('catalog_items').delete().eq('id', itemId);
    await load();
  }

  const filtered = items.filter((i) => {
    if (filterType && i.type !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!i.name?.toLowerCase().includes(q) && !i.reference?.toLowerCase().includes(q) && !i.barcode?.includes(q)) return false;
    }
    return true;
  });

  const groupedByType = TYPES.map((t) => ({
    ...t,
    items: filtered.filter((i) => i.type === t.value),
  })).filter((g) => g.items.length > 0 || !filterType);

  return (
    <Shell>
      <div className="space-y-5 max-w-2xl">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Catalogue</h1>
          <button onClick={() => { setEditId(null); setForm(emptyForm); setShowForm(!showForm); }}
            className="btn btn-primary text-sm">
            + Ajouter
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <form onSubmit={save} className="card space-y-3 border-orange-500/40">
            <h2 className="font-semibold text-white">{editId ? 'Modifier' : 'Nouvel article'}</h2>

            {/* Type */}
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map((t) => (
                <button key={t.value} type="button"
                  onClick={() => setForm({ ...form, type: t.value })}
                  className={`flex flex-col items-center py-3 rounded-xl border text-xs transition-all ${
                    form.type === t.value
                      ? 'border-orange-500 bg-orange-500/20 text-white'
                      : 'border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-500'
                  }`}>
                  <span className="text-xl mb-0.5">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label>Nom *</label>
                <input className="input" required placeholder="Nom de l'article" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label>Référence</label>
                <input className="input text-sm" placeholder="REF-001" value={form.reference}
                  onChange={(e) => setForm({ ...form, reference: e.target.value })} />
              </div>
              <div>
                <label>Code-barres</label>
                <input className="input text-sm font-mono" placeholder="3701234567890" value={form.barcode}
                  onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label>Description</label>
                <input className="input text-sm" placeholder="Description courte" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              {form.type === 'part' && (
                <div>
                  <label>Prix d'achat (€)</label>
                  <input className="input-num text-sm" type="number" step="0.01" min="0" placeholder="0.00"
                    value={form.purchase_price}
                    onChange={(e) => setForm({ ...form, purchase_price: e.target.value })} />
                </div>
              )}
              <div className={form.type === 'part' ? '' : 'col-span-2'}>
                <label>Prix de vente * (€)</label>
                <input className="input-num text-sm" type="number" step="0.01" min="0" required placeholder="0.00"
                  value={form.sale_price}
                  onChange={(e) => setForm({ ...form, sale_price: e.target.value })} />
              </div>
              <div>
                <label>Unité</label>
                <select className="select text-sm" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                  <option value="pce">pce</option>
                  <option value="h">h</option>
                  <option value="forfait">forfait</option>
                  <option value="m">m</option>
                  <option value="L">L</option>
                  <option value="kg">kg</option>
                </select>
              </div>
              {form.type === 'part' && (
                <div>
                  <label>Stock initial</label>
                  <input className="input-num text-sm" type="number" min="0" placeholder="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn btn-primary flex-1">
                {saving ? 'Enregistrement…' : 'Sauvegarder'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="btn btn-ghost flex-1">
                Annuler
              </button>
            </div>
          </form>
        )}

        {/* Filtres */}
        <div className="flex gap-2 flex-wrap">
          <input className="input flex-1 min-w-0 text-sm" placeholder="🔍  Rechercher…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="select w-44 text-sm shrink-0" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">Tout le catalogue</option>
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
          </select>
        </div>

        {/* Liste groupée */}
        {loading ? (
          <div className="card animate-pulse h-32 flex items-center justify-center text-slate-500">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="card text-center text-slate-400 py-10">
            <div className="text-4xl mb-2">🗄️</div>
            <p>Aucun article trouvé</p>
          </div>
        ) : (
          <div className="space-y-5">
            {groupedByType.map((group) => (
              group.items.length === 0 ? null :
              <div key={group.value}>
                <p className="section-title">{group.icon} {group.label}s ({group.items.length})</p>
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <div key={item.id} className={`card ${!item.active ? 'opacity-50' : ''}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-white text-sm">{item.name}</span>
                            {item.reference && (
                              <span className="text-xs text-slate-500 font-mono">{item.reference}</span>
                            )}
                            {!item.active && <span className="badge bg-slate-700 text-slate-400">Inactif</span>}
                          </div>
                          {item.description && (
                            <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-orange-300 text-sm font-medium">
                              {formatEuro(item.sale_price)} / {item.unit}
                            </span>
                            {item.purchase_price && (
                              <span className="text-xs text-slate-500">
                                Achat: {formatEuro(item.purchase_price)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(item)} className="btn btn-ghost text-xs px-2 py-1 min-h-0">✏️</button>
                            <button onClick={() => toggleActive(item)} className="btn btn-ghost text-xs px-2 py-1 min-h-0">
                              {item.active ? '🙈' : '👁️'}
                            </button>
                            <button onClick={() => deleteItem(item.id)} className="btn btn-danger text-xs px-2 py-1 min-h-0">🗑️</button>
                          </div>
                          {item.type === 'part' && (
                            <div className="flex items-center gap-1 bg-slate-700 rounded-xl overflow-hidden">
                              <button onClick={() => updateStock(item.id, -1)} className="px-2 py-1 text-sm hover:bg-slate-600 text-slate-300">−</button>
                              <span className={`text-sm font-mono px-2 ${item.stock === 0 ? 'text-red-400' : item.stock < 3 ? 'text-amber-400' : 'text-green-400'}`}>
                                {item.stock}
                              </span>
                              <button onClick={() => updateStock(item.id, 1)} className="px-2 py-1 text-sm hover:bg-slate-600 text-slate-300">+</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
