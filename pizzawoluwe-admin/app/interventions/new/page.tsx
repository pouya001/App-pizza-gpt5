'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Shell from '@/src/components/Shell';
import { supabase } from '@/src/lib/supabaseClient';
import { getVatRate, getVatLabel } from '@/src/lib/vat';

const TYPES = [
  { value: 'maintenance',  label: 'Entretien',    icon: '🔧', desc: 'Entretien annuel' },
  { value: 'repair',       label: 'Dépannage',    icon: '⚡', desc: 'Intervention urgente' },
  { value: 'installation', label: 'Installation', icon: '🏗️', desc: 'Pose équipement' },
];

export default function NewInterventionPage() {
  const router = useRouter();
  const params = useSearchParams();
  const preClientId = params.get('client_id');
  const preBuildingId = params.get('building_id');

  const [clients, setClients] = useState<any[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [buildingId, setBuildingId] = useState('');
  const [type, setType] = useState('maintenance');
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');
  const [quoteId, setQuoteId] = useState('');
  const [quotes, setQuotes] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  // Quick-create client
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [qcForm, setQcForm] = useState({ first_name: '', last_name: '', phone: '' });
  const [qcSaving, setQcSaving] = useState(false);

  useEffect(() => { loadClients(); }, []);

  async function loadClients() {
    const { data } = await supabase.from('clients').select('id,first_name,last_name,phone').order('last_name');
    setClients(data ?? []);
    if (preClientId) {
      const c = (data ?? []).find((x: any) => x.id === Number(preClientId));
      if (c) selectClient(c);
    }
  }

  async function selectClient(c: any) {
    setSelectedClient(c);
    setClientSearch(`${c.first_name ?? ''} ${c.last_name}`.trim());
    setShowDropdown(false);
    // Load buildings
    const { data: blds } = await supabase.from('buildings').select('*').eq('client_id', c.id).order('label');
    setBuildings(blds ?? []);
    if (preBuildingId) setBuildingId(preBuildingId);
    else if (blds && blds.length === 1) setBuildingId(String(blds[0].id));
    // Load accepted quotes
    const { data: qs } = await supabase.from('quotes')
      .select('id,number,total').eq('client_id', c.id).eq('status', 'accepted');
    setQuotes(qs ?? []);
  }

  const filteredClients = clients.filter((c) => {
    const q = clientSearch.toLowerCase();
    return `${c.first_name ?? ''} ${c.last_name}`.toLowerCase().includes(q) || c.phone?.includes(q);
  });

  async function quickCreateClient(e: React.FormEvent) {
    e.preventDefault();
    if (!qcForm.last_name.trim()) return;
    setQcSaving(true);
    const { data } = await supabase.from('clients').insert({
      first_name: qcForm.first_name || null,
      last_name: qcForm.last_name,
      phone: qcForm.phone || null,
    }).select().single();
    setQcSaving(false);
    if (data) {
      await loadClients();
      selectClient(data);
      setShowQuickCreate(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClient) return;
    setSaving(true);

    // Get next number
    const { data: numData } = await supabase.rpc('next_intervention_number');
    const number = numData ?? 'I-0001';

    // Get VAT rate from building
    let vatRate = 21;
    if (buildingId) {
      const bld = buildings.find((b) => b.id === Number(buildingId));
      if (bld?.construction_year) vatRate = getVatRate(bld.construction_year);
    }

    const { data: inv, error } = await supabase.from('interventions').insert({
      number,
      client_id: selectedClient.id,
      building_id: buildingId ? Number(buildingId) : null,
      quote_id: quoteId ? Number(quoteId) : null,
      type,
      status: scheduledAt ? 'planned' : 'planned',
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      technician_notes: notes || null,
      vat_rate: vatRate,
    }).select().single();

    setSaving(false);
    if (inv) router.push(`/interventions/${inv.id}`);
  }

  const selectedBuilding = buildings.find((b) => b.id === Number(buildingId));

  return (
    <Shell>
      <div className="space-y-5 max-w-lg">
        <div className="flex items-center gap-3">
          <Link href="/interventions" className="text-orange-400 text-sm">← Retour</Link>
          <h1 className="text-2xl font-bold text-white">Nouvelle intervention</h1>
        </div>

        <form onSubmit={submit} className="space-y-5">
          {/* Client */}
          <div className="card space-y-3">
            <h2 className="font-semibold text-white">1. Client</h2>
            <div className="relative">
              <input
                className="input"
                placeholder="🔍 Rechercher un client…"
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  setShowDropdown(true);
                  if (!e.target.value) setSelectedClient(null);
                }}
                onFocus={() => setShowDropdown(true)}
              />
              {showDropdown && clientSearch && filteredClients.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-xl overflow-hidden shadow-xl">
                  {filteredClients.slice(0, 5).map((c) => (
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
                {selectedClient.phone && <span className="text-slate-400 ml-2">· {selectedClient.phone}</span>}
              </div>
            )}

            {!selectedClient && (
              <button type="button" onClick={() => setShowQuickCreate(!showQuickCreate)}
                className="btn btn-ghost w-full text-sm">
                + Créer un nouveau client
              </button>
            )}

            {showQuickCreate && (
              <form onSubmit={quickCreateClient} className="space-y-2 border border-slate-600 rounded-xl p-3">
                <p className="text-xs text-slate-400 font-medium">Nouveau client rapide</p>
                <div className="grid grid-cols-2 gap-2">
                  <input className="input text-sm" placeholder="Prénom" value={qcForm.first_name}
                    onChange={(e) => setQcForm({ ...qcForm, first_name: e.target.value })} />
                  <input className="input text-sm" placeholder="Nom *" required value={qcForm.last_name}
                    onChange={(e) => setQcForm({ ...qcForm, last_name: e.target.value })} />
                </div>
                <input className="input text-sm" type="tel" placeholder="Téléphone" value={qcForm.phone}
                  onChange={(e) => setQcForm({ ...qcForm, phone: e.target.value })} />
                <button type="submit" disabled={qcSaving} className="btn btn-secondary w-full text-sm">
                  {qcSaving ? 'Création…' : 'Créer et sélectionner'}
                </button>
              </form>
            )}
          </div>

          {/* Bâtiment */}
          {selectedClient && (
            <div className="card space-y-3">
              <h2 className="font-semibold text-white">2. Bâtiment</h2>
              {buildings.length === 0 ? (
                <p className="text-slate-400 text-sm">
                  Aucun bâtiment — vous pourrez en ajouter depuis la fiche client.
                </p>
              ) : (
                <select className="select" value={buildingId} onChange={(e) => setBuildingId(e.target.value)}>
                  <option value="">— Sélectionner un bâtiment —</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label} — {b.address}, {b.city}
                      {b.construction_year ? ` (${b.construction_year}) → TVA ${getVatRate(b.construction_year)}%` : ''}
                    </option>
                  ))}
                </select>
              )}
              {selectedBuilding?.construction_year && (
                <div className="text-xs text-orange-300 bg-orange-500/10 rounded-lg px-3 py-2">
                  💡 {getVatLabel(selectedBuilding.construction_year)}
                </div>
              )}
              {selectedBuilding?.boiler_brand && (
                <div className="text-xs text-slate-400 bg-slate-700/40 rounded-lg px-3 py-2">
                  🔥 Chaudière : {selectedBuilding.boiler_brand} {selectedBuilding.boiler_model}
                  {selectedBuilding.boiler_serial ? ` · S/N ${selectedBuilding.boiler_serial}` : ''}
                </div>
              )}
            </div>
          )}

          {/* Type */}
          <div className="card space-y-3">
            <h2 className="font-semibold text-white">3. Type d'intervention</h2>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map((t) => (
                <button key={t.value} type="button"
                  onClick={() => setType(t.value)}
                  className={`flex flex-col items-center py-4 rounded-xl border transition-all text-center ${
                    type === t.value
                      ? 'border-orange-500 bg-orange-500/20 text-white'
                      : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500'
                  }`}>
                  <span className="text-2xl mb-1">{t.icon}</span>
                  <span className="text-xs font-semibold">{t.label}</span>
                  <span className="text-xs text-slate-500 mt-0.5">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date & heure */}
          <div className="card space-y-3">
            <h2 className="font-semibold text-white">4. Date & heure</h2>
            <div>
              <label>Date et heure planifiées <span className="text-slate-500 font-normal">(optionnel)</span></label>
              <input className="input" type="datetime-local" value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)} />
              <p className="text-xs text-slate-500 mt-1">
                Laissez vide pour un devis sans date d'intervention.
              </p>
            </div>
          </div>

          {/* Devis existant */}
          {quotes.length > 0 && (
            <div className="card space-y-3">
              <h2 className="font-semibold text-white">5. Lier à un devis <span className="text-slate-500 font-normal text-sm">(optionnel)</span></h2>
              <select className="select" value={quoteId} onChange={(e) => setQuoteId(e.target.value)}>
                <option value="">— Aucun devis lié —</option>
                {quotes.map((q) => (
                  <option key={q.id} value={q.id}>{q.number} — {q.total?.toFixed(2)} €</option>
                ))}
              </select>
            </div>
          )}

          {/* Notes */}
          <div className="card space-y-3">
            <h2 className="font-semibold text-white">Notes</h2>
            <textarea className="input" rows={3} placeholder="Observations préliminaires…"
              value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <button type="submit" disabled={!selectedClient || saving} className="btn btn-primary w-full text-base py-4">
            {saving ? 'Création…' : '✓  Créer l'intervention'}
          </button>
        </form>
      </div>
    </Shell>
  );
}
