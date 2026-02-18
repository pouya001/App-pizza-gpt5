'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Shell from '@/src/components/Shell';
import { supabase } from '@/src/lib/supabaseClient';
import { formatDate, INTERVENTION_TYPES, INTERVENTION_STATUSES, boilerTypeLabel } from '@/src/lib/formatters';
import { getVatRate } from '@/src/lib/vat';

const BOILER_TYPES = ['condensation', 'atmospherique', 'sol', 'mural', 'pompe_chaleur'];
const BOILER_TYPE_LABELS: Record<string, string> = {
  condensation: 'Condensation', atmospherique: 'Atmosphérique',
  sol: 'Au sol', mural: 'Mural', pompe_chaleur: 'Pompe à chaleur',
};

const emptyBuilding = {
  label: 'Principal', address: '', city: '', postal_code: '', construction_year: '',
  boiler_brand: '', boiler_model: '', boiler_serial: '', boiler_type: '', boiler_power: '', gas_contract: '', notes: '',
};

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editClient, setEditClient] = useState(false);
  const [clientForm, setClientForm] = useState<any>({});
  const [showBuildingForm, setShowBuildingForm] = useState(false);
  const [editBuildingId, setEditBuildingId] = useState<number | null>(null);
  const [buildingForm, setBuildingForm] = useState<any>(emptyBuilding);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (id) load(); }, [id]);

  async function load() {
    const [clientRes, buildRes, intRes] = await Promise.all([
      supabase.from('clients').select('*').eq('id', id).single(),
      supabase.from('buildings').select('*').eq('client_id', id).order('created_at'),
      supabase.from('interventions').select('*, buildings(address,city)')
        .eq('client_id', id).order('scheduled_at', { ascending: false }).limit(10),
    ]);
    if (clientRes.data) {
      setClient(clientRes.data);
      setClientForm(clientRes.data);
    }
    setBuildings(buildRes.data ?? []);
    setInterventions(intRes.data ?? []);
    setLoading(false);
  }

  async function saveClient(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from('clients').update({
      first_name: clientForm.first_name || null,
      last_name: clientForm.last_name,
      phone: clientForm.phone || null,
      email: clientForm.email || null,
      notes: clientForm.notes || null,
    }).eq('id', id);
    setSaving(false);
    setEditClient(false);
    await load();
  }

  async function saveBuilding(e: React.FormEvent) {
    e.preventDefault();
    if (!buildingForm.address || !buildingForm.city) return;
    setSaving(true);
    const payload = {
      client_id: Number(id),
      label: buildingForm.label || 'Principal',
      address: buildingForm.address,
      city: buildingForm.city,
      postal_code: buildingForm.postal_code || null,
      construction_year: buildingForm.construction_year ? Number(buildingForm.construction_year) : null,
      boiler_brand: buildingForm.boiler_brand || null,
      boiler_model: buildingForm.boiler_model || null,
      boiler_serial: buildingForm.boiler_serial || null,
      boiler_type: buildingForm.boiler_type || null,
      boiler_power: buildingForm.boiler_power ? Number(buildingForm.boiler_power) : null,
      gas_contract: buildingForm.gas_contract || null,
      notes: buildingForm.notes || null,
    };
    if (editBuildingId) {
      await supabase.from('buildings').update(payload).eq('id', editBuildingId);
    } else {
      await supabase.from('buildings').insert(payload);
    }
    setSaving(false);
    setShowBuildingForm(false);
    setEditBuildingId(null);
    setBuildingForm(emptyBuilding);
    await load();
  }

  function openEditBuilding(b: any) {
    setEditBuildingId(b.id);
    setBuildingForm({
      label: b.label ?? '', address: b.address ?? '', city: b.city ?? '',
      postal_code: b.postal_code ?? '', construction_year: b.construction_year ?? '',
      boiler_brand: b.boiler_brand ?? '', boiler_model: b.boiler_model ?? '',
      boiler_serial: b.boiler_serial ?? '', boiler_type: b.boiler_type ?? '',
      boiler_power: b.boiler_power ?? '', gas_contract: b.gas_contract ?? '', notes: b.notes ?? '',
    });
    setShowBuildingForm(true);
  }

  async function deleteBuilding(bid: number) {
    if (!confirm('Supprimer ce bâtiment ?')) return;
    await supabase.from('buildings').delete().eq('id', bid);
    await load();
  }

  async function deleteClient() {
    if (!confirm('Supprimer ce client et toutes ses données ?')) return;
    await supabase.from('clients').delete().eq('id', id);
    router.push('/clients');
  }

  if (loading) return (
    <Shell>
      <div className="text-slate-400 text-center py-20">Chargement…</div>
    </Shell>
  );

  if (!client) return (
    <Shell>
      <div className="card text-center text-red-400 py-10">Client introuvable</div>
    </Shell>
  );

  const vatYear = buildings.find((b) => b.construction_year)?.construction_year;

  return (
    <Shell>
      <div className="space-y-5 max-w-2xl">
        {/* Navigation */}
        <Link href="/clients" className="text-sm text-orange-400 hover:text-orange-300 inline-flex items-center gap-1">
          ← Retour aux clients
        </Link>

        {/* Fiche client */}
        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xl">
                {(client.first_name?.[0] ?? client.last_name?.[0] ?? '?').toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {client.first_name} {client.last_name}
                </h1>
                {client.phone && (
                  <a href={`tel:${client.phone}`} className="text-orange-400 text-sm">📞 {client.phone}</a>
                )}
                {client.email && (
                  <div className="text-slate-400 text-xs">{client.email}</div>
                )}
              </div>
            </div>
            <button onClick={() => setEditClient(!editClient)} className="btn btn-ghost text-xs px-3 py-2">
              {editClient ? 'Annuler' : 'Modifier'}
            </button>
          </div>

          {editClient ? (
            <form onSubmit={saveClient} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label>Prénom</label>
                  <input className="input" value={clientForm.first_name ?? ''}
                    onChange={(e) => setClientForm({ ...clientForm, first_name: e.target.value })} />
                </div>
                <div>
                  <label>Nom *</label>
                  <input className="input" required value={clientForm.last_name ?? ''}
                    onChange={(e) => setClientForm({ ...clientForm, last_name: e.target.value })} />
                </div>
              </div>
              <div>
                <label>Téléphone</label>
                <input className="input" type="tel" value={clientForm.phone ?? ''}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })} />
              </div>
              <div>
                <label>Email</label>
                <input className="input" type="email" value={clientForm.email ?? ''}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })} />
              </div>
              <div>
                <label>Notes</label>
                <textarea className="input" value={clientForm.notes ?? ''}
                  onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="btn btn-primary flex-1">
                  {saving ? 'Enregistrement…' : 'Sauvegarder'}
                </button>
                <button type="button" onClick={deleteClient} className="btn btn-danger px-4">
                  Supprimer client
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-2">
              {client.notes && (
                <p className="text-slate-400 text-sm bg-slate-700/40 rounded-xl p-3">{client.notes}</p>
              )}
              <Link href={`/interventions/new?client_id=${id}`} className="btn btn-primary w-full">
                🔧  Nouvelle intervention pour ce client
              </Link>
            </div>
          )}
        </div>

        {/* Bâtiments */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Bâtiments & équipements</h2>
            <button
              onClick={() => { setEditBuildingId(null); setBuildingForm(emptyBuilding); setShowBuildingForm(!showBuildingForm); }}
              className="btn btn-secondary text-xs px-3 py-2">
              + Ajouter
            </button>
          </div>

          {/* Formulaire bâtiment */}
          {showBuildingForm && (
            <form onSubmit={saveBuilding} className="card mb-3 space-y-3 border-orange-500/40">
              <h3 className="font-semibold text-white">{editBuildingId ? 'Modifier bâtiment' : 'Nouveau bâtiment'}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label>Libellé</label>
                  <input className="input" placeholder="Domicile, Appartement…" value={buildingForm.label}
                    onChange={(e) => setBuildingForm({ ...buildingForm, label: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label>Adresse *</label>
                  <input className="input" required placeholder="Rue de la Paix 12" value={buildingForm.address}
                    onChange={(e) => setBuildingForm({ ...buildingForm, address: e.target.value })} />
                </div>
                <div>
                  <label>Ville *</label>
                  <input className="input" required placeholder="Bruxelles" value={buildingForm.city}
                    onChange={(e) => setBuildingForm({ ...buildingForm, city: e.target.value })} />
                </div>
                <div>
                  <label>Code postal</label>
                  <input className="input" placeholder="1000" value={buildingForm.postal_code}
                    onChange={(e) => setBuildingForm({ ...buildingForm, postal_code: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label>
                    Année de construction
                    <span className="ml-2 text-xs text-orange-400 font-normal">
                      {buildingForm.construction_year
                        ? `→ TVA ${getVatRate(Number(buildingForm.construction_year))}%`
                        : '(détermine le taux de TVA)'}
                    </span>
                  </label>
                  <input className="input input-num" type="number" placeholder="1985" min="1900" max="2030"
                    value={buildingForm.construction_year}
                    onChange={(e) => setBuildingForm({ ...buildingForm, construction_year: e.target.value })} />
                </div>
              </div>
              <div className="divider" />
              <p className="section-title">Chaudière</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label>Marque</label>
                  <input className="input" placeholder="Vaillant" value={buildingForm.boiler_brand}
                    onChange={(e) => setBuildingForm({ ...buildingForm, boiler_brand: e.target.value })} />
                </div>
                <div>
                  <label>Modèle</label>
                  <input className="input" placeholder="ecoTEC plus" value={buildingForm.boiler_model}
                    onChange={(e) => setBuildingForm({ ...buildingForm, boiler_model: e.target.value })} />
                </div>
                <div>
                  <label>N° de série</label>
                  <input className="input" placeholder="SN-2024-00001" value={buildingForm.boiler_serial}
                    onChange={(e) => setBuildingForm({ ...buildingForm, boiler_serial: e.target.value })} />
                </div>
                <div>
                  <label>Type</label>
                  <select className="select" value={buildingForm.boiler_type}
                    onChange={(e) => setBuildingForm({ ...buildingForm, boiler_type: e.target.value })}>
                    <option value="">— Sélectionner —</option>
                    {BOILER_TYPES.map((t) => (
                      <option key={t} value={t}>{BOILER_TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Puissance (kW)</label>
                  <input className="input input-num" type="number" step="0.1" placeholder="24" value={buildingForm.boiler_power}
                    onChange={(e) => setBuildingForm({ ...buildingForm, boiler_power: e.target.value })} />
                </div>
                <div>
                  <label>N° contrat gaz</label>
                  <input className="input" placeholder="GZ-00000" value={buildingForm.gas_contract}
                    onChange={(e) => setBuildingForm({ ...buildingForm, gas_contract: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label>Notes techniques</label>
                  <textarea className="input" value={buildingForm.notes}
                    onChange={(e) => setBuildingForm({ ...buildingForm, notes: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="btn btn-primary flex-1">
                  {saving ? 'Enregistrement…' : 'Sauvegarder'}
                </button>
                <button type="button" onClick={() => { setShowBuildingForm(false); setEditBuildingId(null); }}
                  className="btn btn-ghost flex-1">
                  Annuler
                </button>
              </div>
            </form>
          )}

          {buildings.length === 0 ? (
            <div className="card text-center text-slate-400 py-8">
              <div className="text-3xl mb-2">🏠</div>
              <p className="text-sm">Aucun bâtiment enregistré</p>
            </div>
          ) : (
            <div className="space-y-3">
              {buildings.map((b) => {
                const vatRate = getVatRate(b.construction_year);
                return (
                  <div key={b.id} className="card">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-white">{b.label}</div>
                        <div className="text-slate-300 text-sm">{b.address}, {b.city}</div>
                        {b.postal_code && <div className="text-slate-500 text-xs">{b.postal_code}</div>}
                      </div>
                      <div className="flex items-center gap-2">
                        {b.construction_year && (
                          <span className={`badge ${vatRate === 6 ? 'bg-green-900 text-green-300' : 'bg-slate-700 text-slate-300'}`}>
                            TVA {vatRate}%
                          </span>
                        )}
                        <button onClick={() => openEditBuilding(b)} className="btn btn-ghost text-xs px-2 py-1 min-h-0">
                          ✏️
                        </button>
                        <button onClick={() => deleteBuilding(b.id)} className="btn btn-danger text-xs px-2 py-1 min-h-0">
                          🗑️
                        </button>
                      </div>
                    </div>
                    {/* Infos chaudière */}
                    {(b.boiler_brand || b.boiler_model) && (
                      <div className="bg-slate-700/40 rounded-xl p-3 mt-2 grid grid-cols-2 gap-2 text-xs">
                        {b.boiler_brand && <div><span className="text-slate-500">Marque</span><br /><span className="text-white">{b.boiler_brand}</span></div>}
                        {b.boiler_model && <div><span className="text-slate-500">Modèle</span><br /><span className="text-white">{b.boiler_model}</span></div>}
                        {b.boiler_serial && <div><span className="text-slate-500">N° série</span><br /><span className="text-white font-mono">{b.boiler_serial}</span></div>}
                        {b.boiler_type && <div><span className="text-slate-500">Type</span><br /><span className="text-white">{boilerTypeLabel(b.boiler_type)}</span></div>}
                        {b.boiler_power && <div><span className="text-slate-500">Puissance</span><br /><span className="text-white">{b.boiler_power} kW</span></div>}
                        {b.construction_year && <div><span className="text-slate-500">Année construction</span><br /><span className="text-white">{b.construction_year}</span></div>}
                      </div>
                    )}
                    <div className="mt-2">
                      <Link href={`/interventions/new?client_id=${id}&building_id=${b.id}`}
                        className="btn btn-secondary text-xs w-full mt-1">
                        + Intervention pour ce bâtiment
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Historique interventions */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Historique des interventions</h2>
          {interventions.length === 0 ? (
            <div className="card text-center text-slate-400 py-6 text-sm">
              Aucune intervention enregistrée
            </div>
          ) : (
            <div className="space-y-2">
              {interventions.map((i: any) => {
                const t = INTERVENTION_TYPES[i.type];
                const st = INTERVENTION_STATUSES[i.status];
                return (
                  <Link key={i.id} href={`/interventions/${i.id}`} className="card-hover flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={t?.color}>{t?.icon}</span>
                        <span className="text-sm font-medium text-white">{t?.label}</span>
                        {st && <span className={`badge ${st.color} text-xs`}>{st.label}</span>}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {i.scheduled_at ? formatDate(i.scheduled_at) : 'Non planifié'} —{' '}
                        {i.buildings?.address}
                      </div>
                    </div>
                    <div className="text-orange-300 text-sm font-medium">
                      {i.total > 0 ? `${i.total.toFixed(2)} €` : '—'}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
