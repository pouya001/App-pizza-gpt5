'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Shell from '@/src/components/Shell';
import { supabase } from '@/src/lib/supabaseClient';
import { getVatRate, getVatLabel } from '@/src/lib/vat';

export default function NewQuotePage() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [showDrop, setShowDrop] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [buildingId, setBuildingId] = useState('');
  const [notes, setNotes] = useState('');
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadClients(); }, []);

  async function loadClients() {
    const { data } = await supabase.from('clients').select('id,first_name,last_name,phone').order('last_name');
    setClients(data ?? []);
  }

  async function selectClient(c: any) {
    setSelectedClient(c);
    setClientSearch(`${c.first_name ?? ''} ${c.last_name}`.trim());
    setShowDrop(false);
    const { data } = await supabase.from('buildings').select('*').eq('client_id', c.id).order('label');
    setBuildings(data ?? []);
    if (data && data.length === 1) setBuildingId(String(data[0].id));
  }

  const filtered = clients.filter((c) => {
    const q = clientSearch.toLowerCase();
    return `${c.first_name ?? ''} ${c.last_name}`.toLowerCase().includes(q) || c.phone?.includes(q);
  });

  const selectedBuilding = buildings.find((b) => b.id === Number(buildingId));
  const vatRate = selectedBuilding?.construction_year ? getVatRate(selectedBuilding.construction_year) : 21;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClient) return;
    setSaving(true);
    const { data: numData } = await supabase.rpc('next_quote_number');
    const { data: q } = await supabase.from('quotes').insert({
      number: numData ?? 'D-0001',
      client_id: selectedClient.id,
      building_id: buildingId ? Number(buildingId) : null,
      vat_rate: vatRate,
      notes: notes || null,
      valid_until: validUntil || null,
      status: 'draft',
    }).select().single();
    setSaving(false);
    if (q) router.push(`/quotes/${q.id}`);
  }

  return (
    <Shell>
      <div className="space-y-5 max-w-lg">
        <div className="flex items-center gap-3">
          <Link href="/quotes" className="text-orange-400 text-sm">← Retour</Link>
          <h1 className="text-2xl font-bold text-white">Nouveau devis</h1>
        </div>

        <form onSubmit={submit} className="space-y-5">
          {/* Client */}
          <div className="card space-y-3">
            <h2 className="font-semibold text-white">Client</h2>
            <div className="relative">
              <input className="input" placeholder="🔍  Rechercher un client…"
                value={clientSearch}
                onChange={(e) => { setClientSearch(e.target.value); setShowDrop(true); if (!e.target.value) setSelectedClient(null); }}
                onFocus={() => setShowDrop(true)} />
              {showDrop && clientSearch && filtered.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-xl overflow-hidden shadow-xl">
                  {filtered.slice(0, 6).map((c) => (
                    <button key={c.id} type="button"
                      className="w-full text-left px-4 py-3 hover:bg-slate-600 text-sm text-white border-b border-slate-600/50 last:border-0"
                      onClick={() => selectClient(c)}>
                      <div className="font-medium">{c.first_name} {c.last_name}</div>
                      {c.phone && <div className="text-xs text-slate-400">{c.phone}</div>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedClient && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 text-sm text-white">
                ✓ {selectedClient.first_name} {selectedClient.last_name}
              </div>
            )}
          </div>

          {/* Bâtiment */}
          {selectedClient && (
            <div className="card space-y-3">
              <h2 className="font-semibold text-white">Bâtiment</h2>
              {buildings.length === 0 ? (
                <p className="text-slate-400 text-sm">Aucun bâtiment enregistré pour ce client.</p>
              ) : (
                <select className="select" value={buildingId} onChange={(e) => setBuildingId(e.target.value)}>
                  <option value="">— Sélectionner —</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label} – {b.address}, {b.city}
                      {b.construction_year ? ` (${b.construction_year}) → TVA ${getVatRate(b.construction_year)}%` : ''}
                    </option>
                  ))}
                </select>
              )}
              {selectedBuilding?.construction_year ? (
                <div className="text-sm text-orange-300 bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-2">
                  💡 {getVatLabel(selectedBuilding.construction_year)}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  L'année de construction du bâtiment détermine automatiquement le taux de TVA (6% ou 21%).
                </p>
              )}
            </div>
          )}

          {/* Validité & Notes */}
          <div className="card space-y-3">
            <div>
              <label>Valable jusqu'au</label>
              <input className="input" type="date" value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)} />
            </div>
            <div>
              <label>Notes</label>
              <textarea className="input" rows={3} placeholder="Description des travaux prévus…"
                value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>

          <button type="submit" disabled={!selectedClient || saving} className="btn btn-primary w-full text-base py-4">
            {saving ? 'Création…' : '✓  Créer le devis'}
          </button>
        </form>
      </div>
    </Shell>
  );
}
