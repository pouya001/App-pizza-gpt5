'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Shell from '@/src/components/Shell';
import { supabase } from '@/src/lib/supabaseClient';
import { formatEuro, formatDateTime, formatDate, INTERVENTION_TYPES, INTERVENTION_STATUSES } from '@/src/lib/formatters';
import { calculateSiegert, conformityBg } from '@/src/lib/siegert';
import { getVatRate } from '@/src/lib/vat';

const STATUS_FLOW: Record<string, { next: string; label: string; cls: string }[]> = {
  planned:     [{ next: 'in_progress', label: 'Démarrer', cls: 'btn-primary' }, { next: 'cancelled', label: 'Annuler', cls: 'btn-danger' }],
  in_progress: [{ next: 'completed',  label: 'Terminer', cls: 'btn-success'  }, { next: 'planned',   label: 'Re-planifier', cls: 'btn-secondary' }],
  completed:   [],
  cancelled:   [{ next: 'planned', label: 'Réouvrir', cls: 'btn-secondary' }],
};

export default function InterventionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [inv, setInv] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [building, setBuilding] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [combustion, setCombustion] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Combustion form
  const [cForm, setCForm] = useState({ flue_temp: '', ambient_temp: '20', o2_rate: '', co_ppm: '', co2_rate: '', lambda: '' });
  const [cResult, setCResult] = useState<any>(null);
  const [cSaving, setCsaving] = useState(false);

  // Item form
  const [showItemForm, setShowItemForm] = useState(false);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [iForm, setIForm] = useState({ description: '', quantity: '1', unit_price: '', unit: 'pce', catalog_item_id: '' });
  const [iSaving, setISaving] = useState(false);

  // Schedule edit
  const [editSchedule, setEditSchedule] = useState(false);
  const [newSchedule, setNewSchedule] = useState('');

  // Signature
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSig, setHasSig] = useState(false);
  const [sigSaving, setSigSaving] = useState(false);

  // Notes
  const [editNotes, setEditNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);

  useEffect(() => { if (id) load(); }, [id]);
  useEffect(() => { if (inv) setNotes(inv.technician_notes ?? ''); }, [inv]);

  async function load() {
    const [invRes, itemsRes, comRes, photosRes] = await Promise.all([
      supabase.from('interventions').select('*, clients(*), buildings(*)').eq('id', id).single(),
      supabase.from('intervention_items').select('*, catalog_items(reference)').eq('intervention_id', id),
      supabase.from('combustion_measures').select('*').eq('intervention_id', id).order('measured_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('intervention_photos').select('*').eq('intervention_id', id).order('created_at'),
    ]);
    if (invRes.data) {
      setInv(invRes.data);
      setClient(invRes.data.clients);
      setBuilding(invRes.data.buildings);
    }
    setItems(itemsRes.data ?? []);
    if (comRes.data) {
      setCombustion(comRes.data);
      setCForm({
        flue_temp: String(comRes.data.flue_temp ?? ''),
        ambient_temp: String(comRes.data.ambient_temp ?? '20'),
        o2_rate: String(comRes.data.o2_rate ?? ''),
        co_ppm: String(comRes.data.co_ppm ?? ''),
        co2_rate: String(comRes.data.co2_rate ?? ''),
        lambda: String(comRes.data.lambda ?? ''),
      });
    }
    setPhotos(photosRes.data ?? []);
    setLoading(false);
  }

  async function changeStatus(next: string) {
    const update: any = { status: next };
    if (next === 'completed') update.completed_at = new Date().toISOString();
    await supabase.from('interventions').update(update).eq('id', id);
    await load();
  }

  async function saveSchedule() {
    await supabase.from('interventions').update({ scheduled_at: newSchedule ? new Date(newSchedule).toISOString() : null }).eq('id', id);
    setEditSchedule(false);
    await load();
  }

  // ---- Combustion ----
  function calcSiegert() {
    const ft = parseFloat(cForm.flue_temp);
    const at = parseFloat(cForm.ambient_temp || '20');
    const co2 = parseFloat(cForm.co2_rate);
    const co = parseFloat(cForm.co_ppm || '0');
    if (isNaN(ft) || isNaN(co2) || co2 <= 0) return;
    const res = calculateSiegert({ flueTemp: ft, ambientTemp: at, co2Rate: co2, coPpm: co });
    setCResult(res);
  }

  async function saveCombustion() {
    if (!cResult) return;
    setCsaving(true);
    const payload = {
      intervention_id: Number(id),
      flue_temp: parseFloat(cForm.flue_temp) || null,
      ambient_temp: parseFloat(cForm.ambient_temp) || 20,
      o2_rate: parseFloat(cForm.o2_rate) || null,
      co_ppm: parseFloat(cForm.co_ppm) || null,
      co2_rate: parseFloat(cForm.co2_rate) || null,
      lambda: parseFloat(cForm.lambda) || null,
      efficiency: cResult.efficiency,
      conformity_status: cResult.status,
    };
    if (combustion) {
      await supabase.from('combustion_measures').update(payload).eq('id', combustion.id);
    } else {
      await supabase.from('combustion_measures').insert(payload);
    }
    setCsaving(false);
    await load();
  }

  // ---- Items ----
  async function loadCatalog(q: string) {
    if (!q) { setCatalog([]); return; }
    const { data } = await supabase.from('catalog_items').select('*').ilike('name', `%${q}%`).eq('active', true).limit(8);
    setCatalog(data ?? []);
  }

  function selectCatalogItem(ci: any) {
    setIForm({ description: ci.name, quantity: '1', unit_price: String(ci.sale_price), unit: ci.unit, catalog_item_id: String(ci.id) });
    setCatalogSearch(ci.name);
    setCatalog([]);
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!iForm.description || !iForm.unit_price) return;
    setISaving(true);
    await supabase.from('intervention_items').insert({
      intervention_id: Number(id),
      catalog_item_id: iForm.catalog_item_id ? Number(iForm.catalog_item_id) : null,
      description: iForm.description,
      quantity: parseFloat(iForm.quantity) || 1,
      unit_price: parseFloat(iForm.unit_price),
      unit: iForm.unit,
    });
    // Recalculate total
    const { data: itemsData } = await supabase.from('intervention_items').select('quantity,unit_price').eq('intervention_id', id);
    const subtotal = (itemsData ?? []).reduce((s: number, it: any) => s + it.quantity * it.unit_price, 0);
    const vatRate = building?.construction_year ? getVatRate(building.construction_year) : (inv?.vat_rate ?? 21);
    const vatAmount = Math.round(subtotal * vatRate) / 100;
    await supabase.from('interventions').update({ subtotal, vat_amount: vatAmount, total: subtotal + vatAmount, vat_rate: vatRate }).eq('id', id);

    setIForm({ description: '', quantity: '1', unit_price: '', unit: 'pce', catalog_item_id: '' });
    setCatalogSearch('');
    setShowItemForm(false);
    setISaving(false);
    await load();
  }

  async function deleteItem(itemId: number) {
    await supabase.from('intervention_items').delete().eq('id', itemId);
    // Recalculate
    const { data: itemsData } = await supabase.from('intervention_items').select('quantity,unit_price').eq('intervention_id', id);
    const subtotal = (itemsData ?? []).reduce((s: number, it: any) => s + it.quantity * it.unit_price, 0);
    const vatRate = inv?.vat_rate ?? 21;
    const vatAmount = Math.round(subtotal * vatRate) / 100;
    await supabase.from('interventions').update({ subtotal, vat_amount: vatAmount, total: subtotal + vatAmount }).eq('id', id);
    await load();
  }

  async function saveNotes() {
    setNotesSaving(true);
    await supabase.from('interventions').update({ technician_notes: notes }).eq('id', id);
    setNotesSaving(false);
    setEditNotes(false);
    await load();
  }

  // ---- Photos ----
  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>, type: string) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      await supabase.from('intervention_photos').insert({ intervention_id: Number(id), data_url: dataUrl, type });
      await load();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  async function deletePhoto(photoId: number) {
    await supabase.from('intervention_photos').delete().eq('id', photoId);
    await load();
  }

  // ---- Signature ----
  const getCanvasPos = (e: any, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  function startDraw(e: any) {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const pos = getCanvasPos(e, canvas);
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
    setDrawing(true);
  }

  function draw(e: any) {
    if (!drawing) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const pos = getCanvasPos(e, canvas);
    ctx.lineWidth = 2; ctx.strokeStyle = '#f97316'; ctx.lineCap = 'round';
    ctx.lineTo(pos.x, pos.y); ctx.stroke();
    setHasSig(true);
  }

  function clearSig() {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setHasSig(false);
  }

  async function saveSig() {
    const canvas = canvasRef.current; if (!canvas) return;
    setSigSaving(true);
    const dataUrl = canvas.toDataURL();
    await supabase.from('interventions').update({ client_signature: dataUrl, status: 'completed', completed_at: new Date().toISOString() }).eq('id', id);
    setSigSaving(false);
    await load();
  }

  function generateWhatsApp() {
    if (!client) return;
    const phone = (client.phone ?? '').replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `Bonjour ${client.first_name ?? client.last_name}, votre intervention ${inv?.number ?? ''} (${INTERVENTION_TYPES[inv?.type]?.label ?? ''}) est terminée. Montant : ${formatEuro(inv?.total)}. Merci pour votre confiance !`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  }

  function generateEmail() {
    if (!client?.email) return;
    const subject = encodeURIComponent(`Rapport intervention ${inv?.number ?? ''}`);
    const body = encodeURIComponent(
      `Bonjour ${client.first_name ?? client.last_name},\n\nVotre intervention ${inv?.number ?? ''} est terminée.\nType : ${INTERVENTION_TYPES[inv?.type]?.label ?? ''}\nAdresse : ${building?.address ?? ''}, ${building?.city ?? ''}\nMontant TTC : ${formatEuro(inv?.total)}\n\nCordialement`
    );
    window.location.href = `mailto:${client.email}?subject=${subject}&body=${body}`;
  }

  if (loading) return <Shell><div className="text-slate-400 text-center py-20">Chargement…</div></Shell>;
  if (!inv) return <Shell><div className="card text-center text-red-400 py-10">Intervention introuvable</div></Shell>;

  const typeInfo = INTERVENTION_TYPES[inv.type] ?? INTERVENTION_TYPES.maintenance;
  const statusInfo = INTERVENTION_STATUSES[inv.status];
  const nextActions = STATUS_FLOW[inv.status] ?? [];
  const beforePhotos = photos.filter((p) => p.type === 'before');
  const afterPhotos = photos.filter((p) => p.type === 'after');
  const otherPhotos = photos.filter((p) => p.type === 'other');

  return (
    <Shell>
      <div className="space-y-5 max-w-2xl">
        {/* Nav */}
        <Link href="/interventions" className="text-sm text-orange-400 hover:text-orange-300 inline-flex items-center gap-1">
          ← Toutes les interventions
        </Link>

        {/* En-tête */}
        <div className="card">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`text-2xl ${typeInfo.color}`}>{typeInfo.icon}</span>
                <span className="text-xl font-bold text-white">{typeInfo.label}</span>
                {statusInfo && <span className={`badge ${statusInfo.color} text-sm`}>{statusInfo.label}</span>}
              </div>
              <div className="text-xs text-slate-500 font-mono">{inv.number}</div>
            </div>
            <button onClick={() => window.print()} className="btn btn-ghost text-xs px-3 py-2">
              🖨️ Imprimer
            </button>
          </div>

          <div className="divider" />

          {/* Client */}
          <div className="space-y-1">
            <Link href={`/clients/${client?.id}`} className="font-semibold text-white text-lg hover:text-orange-400">
              {client?.first_name} {client?.last_name}
            </Link>
            {client?.phone && (
              <div><a href={`tel:${client.phone}`} className="text-orange-400">📞 {client.phone}</a></div>
            )}
            {client?.email && <div className="text-slate-400 text-sm">{client.email}</div>}
            {building && (
              <div className="text-slate-300 text-sm mt-1">
                📍 {building.address}, {building.city}
                {building.boiler_brand && (
                  <span className="text-slate-500 ml-2">· {building.boiler_brand} {building.boiler_model}</span>
                )}
              </div>
            )}
          </div>

          {/* Date planifiée */}
          <div className="mt-3">
            {!editSchedule ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">
                  📅 {inv.scheduled_at ? formatDateTime(inv.scheduled_at) : 'Non planifié'}
                </span>
                <button onClick={() => { setEditSchedule(true); setNewSchedule(inv.scheduled_at ? new Date(inv.scheduled_at).toISOString().slice(0,16) : ''); }}
                  className="text-xs text-orange-400 hover:text-orange-300">Modifier</button>
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <input className="input flex-1" type="datetime-local" value={newSchedule}
                  onChange={(e) => setNewSchedule(e.target.value)} />
                <button onClick={saveSchedule} className="btn btn-primary text-xs px-3 py-2">✓</button>
                <button onClick={() => setEditSchedule(false)} className="btn btn-ghost text-xs px-3 py-2">✕</button>
              </div>
            )}
          </div>

          {/* Actions de statut */}
          {nextActions.length > 0 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {nextActions.map((a) => (
                <button key={a.next} onClick={() => changeStatus(a.next)}
                  className={`btn ${a.cls} flex-1`}>
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ============ PIÈCES & SERVICES ============ */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Pièces & services</h2>
            <button onClick={() => setShowItemForm(!showItemForm)} className="btn btn-secondary text-xs px-3 py-2">
              + Ajouter
            </button>
          </div>

          {/* Formulaire ajout pièce */}
          {showItemForm && (
            <form onSubmit={addItem} className="border border-slate-600 rounded-xl p-3 space-y-3">
              <div>
                <label>Rechercher dans le catalogue</label>
                <input className="input text-sm" placeholder="Nom de la pièce ou service…"
                  value={catalogSearch}
                  onChange={(e) => { setCatalogSearch(e.target.value); loadCatalog(e.target.value); }} />
                {catalog.length > 0 && (
                  <div className="bg-slate-700 border border-slate-600 rounded-xl mt-1 overflow-hidden">
                    {catalog.map((ci) => (
                      <button key={ci.id} type="button"
                        className="w-full text-left px-3 py-2 hover:bg-slate-600 text-sm border-b border-slate-600/50 last:border-0"
                        onClick={() => selectCatalogItem(ci)}>
                        <span className="text-white">{ci.name}</span>
                        <span className="text-orange-400 ml-2">{ci.sale_price?.toFixed(2)} €/{ci.unit}</span>
                        {ci.stock > 0 && <span className="text-slate-400 ml-2">Stock: {ci.stock}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label>Description *</label>
                <input className="input text-sm" required placeholder="Description de la prestation"
                  value={iForm.description} onChange={(e) => setIForm({ ...iForm, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label>Qté</label>
                  <input className="input-num text-sm" type="number" step="0.5" min="0.5"
                    value={iForm.quantity} onChange={(e) => setIForm({ ...iForm, quantity: e.target.value })} />
                </div>
                <div>
                  <label>Prix unit. (€)</label>
                  <input className="input-num text-sm" type="number" step="0.01" min="0" required
                    value={iForm.unit_price} onChange={(e) => setIForm({ ...iForm, unit_price: e.target.value })} />
                </div>
                <div>
                  <label>Unité</label>
                  <select className="select text-sm" value={iForm.unit} onChange={(e) => setIForm({ ...iForm, unit: e.target.value })}>
                    <option value="pce">pce</option>
                    <option value="h">h</option>
                    <option value="forfait">forfait</option>
                    <option value="m">m</option>
                    <option value="L">L</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={iSaving} className="btn btn-primary flex-1">
                  {iSaving ? 'Ajout…' : 'Ajouter la ligne'}
                </button>
                <button type="button" onClick={() => setShowItemForm(false)} className="btn btn-ghost flex-1">Annuler</button>
              </div>
            </form>
          )}

          {/* Liste items */}
          {items.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">Aucune pièce ou service ajouté</p>
          ) : (
            <div className="space-y-1">
              {items.map((it) => (
                <div key={it.id} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white">{it.description}</div>
                    <div className="text-xs text-slate-500">{it.quantity} × {it.unit_price?.toFixed(2)} €/{it.unit}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-medium text-orange-300">
                      {((it.quantity || 1) * it.unit_price).toFixed(2)} €
                    </span>
                    <button onClick={() => deleteItem(it.id)} className="text-red-400 hover:text-red-300 text-xs px-1">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Totaux */}
          {items.length > 0 && (
            <div className="border-t border-slate-600 pt-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Sous-total HT</span>
                <span className="text-white">{formatEuro(inv.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">TVA {inv.vat_rate}%</span>
                <span className="text-white">{formatEuro(inv.vat_amount)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-slate-600 pt-2 mt-1">
                <span className="text-white">Total TTC</span>
                <span className="text-orange-400">{formatEuro(inv.total)}</span>
              </div>
            </div>
          )}
        </div>

        {/* ============ ANALYSE DE COMBUSTION ============ */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-white">
            🔬 Analyse de combustion
            <span className="text-xs text-slate-500 ml-2 font-normal">Formule de Siegert</span>
          </h2>

          {/* Résultat précédent */}
          {combustion && !cResult && (
            <div className={conformityBg(combustion.conformity_status)}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-2xl">{combustion.efficiency} %</div>
                  <div className="text-sm">Rendement – {combustion.conformity_status === 'green' ? 'Conforme' : combustion.conformity_status === 'orange' ? 'Attention' : 'Non conforme'}</div>
                  <div className="text-xs mt-1 opacity-70">
                    CO: {combustion.co_ppm ?? '—'} ppm · CO₂: {combustion.co2_rate ?? '—'}% · Tfumées: {combustion.flue_temp ?? '—'}°C
                  </div>
                </div>
                <div className="text-4xl">{combustion.conformity_status === 'green' ? '✅' : combustion.conformity_status === 'orange' ? '⚠️' : '🚨'}</div>
              </div>
            </div>
          )}

          {/* Formulaire mesures */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'flue_temp',    label: 'T° fumées Tg (°C)',    placeholder: '85' },
              { key: 'ambient_temp', label: 'T° ambiante Tl (°C)',  placeholder: '20' },
              { key: 'co2_rate',    label: 'CO₂ (%)',               placeholder: '9.5' },
              { key: 'o2_rate',     label: 'O₂ (%)',                placeholder: '5.1' },
              { key: 'co_ppm',      label: 'CO (ppm)',              placeholder: '45' },
              { key: 'lambda',      label: 'Lambda λ',              placeholder: '1.32' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-xs">{label}</label>
                <input
                  type="number" step="0.01" inputMode="decimal"
                  className="input-num text-lg"
                  placeholder={placeholder}
                  value={(cForm as any)[key]}
                  onChange={(e) => setCForm({ ...cForm, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>

          <button onClick={calcSiegert} className="btn btn-primary w-full">
            ⚡ Calculer le rendement (Siegert)
          </button>

          {/* Résultat calculé */}
          {cResult && (
            <div className={conformityBg(cResult.status)}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-3xl">{cResult.efficiency} %</div>
                  <div className="text-sm font-semibold">{cResult.statusLabel}</div>
                  <div className="text-xs mt-1 opacity-80">Pertes fumées qA = {cResult.qA} %</div>
                  {cResult.alerts.length > 0 && (
                    <ul className="mt-2 space-y-0.5">
                      {cResult.alerts.map((a: string, i: number) => (
                        <li key={i} className="text-xs">⚠️ {a}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="text-4xl shrink-0">
                  {cResult.status === 'green' ? '✅' : cResult.status === 'orange' ? '⚠️' : '🚨'}
                </div>
              </div>
            </div>
          )}

          {cResult && (
            <button onClick={saveCombustion} disabled={cSaving} className="btn btn-success w-full">
              {cSaving ? 'Enregistrement…' : '💾 Enregistrer la mesure'}
            </button>
          )}
        </div>

        {/* ============ NOTES TECHNICIEN ============ */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Notes technicien</h2>
            <button onClick={() => setEditNotes(!editNotes)} className="btn btn-ghost text-xs px-3 py-2">
              {editNotes ? 'Annuler' : 'Modifier'}
            </button>
          </div>
          {editNotes ? (
            <>
              <textarea className="input" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Observations, pièces changées, recommandations…" />
              <button onClick={saveNotes} disabled={notesSaving} className="btn btn-primary w-full">
                {notesSaving ? 'Enregistrement…' : 'Sauvegarder'}
              </button>
            </>
          ) : (
            <p className="text-slate-300 text-sm whitespace-pre-wrap min-h-[3rem]">
              {inv.technician_notes || <span className="text-slate-500">Aucune note</span>}
            </p>
          )}
        </div>

        {/* ============ PHOTOS ============ */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-white">📷 Photos chantier</h2>
          {[
            { type: 'before', label: 'Avant', photos: beforePhotos },
            { type: 'after',  label: 'Après', photos: afterPhotos },
            { type: 'other',  label: 'Autre', photos: otherPhotos },
          ].map(({ type, label, photos: ps }) => (
            <div key={type}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-300">{label}</span>
                <label className="btn btn-secondary text-xs px-3 py-2 cursor-pointer">
                  📷 Ajouter
                  <input type="file" accept="image/*" capture="environment" className="hidden"
                    onChange={(e) => handlePhoto(e, type)} />
                </label>
              </div>
              {ps.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {ps.map((p) => (
                    <div key={p.id} className="relative group">
                      <img src={p.data_url} alt={label} className="w-full h-24 object-cover rounded-xl" />
                      <button
                        onClick={() => deletePhoto(p.id)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ============ SIGNATURE CLIENT ============ */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-white">✍️ Signature client</h2>
          {inv.client_signature ? (
            <div>
              <img src={inv.client_signature} alt="Signature" className="max-h-32 bg-white rounded-xl p-2" />
              <p className="text-xs text-green-400 mt-1">✓ Signature enregistrée</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-400">Demandez au client de signer ci-dessous :</p>
              <div className="border-2 border-dashed border-slate-600 rounded-xl overflow-hidden bg-slate-900/50">
                <canvas
                  ref={canvasRef}
                  width={400} height={160}
                  className="w-full touch-none"
                  onMouseDown={startDraw} onMouseMove={draw} onMouseUp={() => setDrawing(false)}
                  onTouchStart={startDraw} onTouchMove={(e) => { e.preventDefault(); draw(e); }}
                  onTouchEnd={() => setDrawing(false)}
                />
              </div>
              <div className="flex gap-2">
                <button onClick={clearSig} className="btn btn-ghost flex-1">Effacer</button>
                <button onClick={saveSig} disabled={!hasSig || sigSaving} className="btn btn-success flex-1">
                  {sigSaving ? 'Enregistrement…' : '✓ Valider & Clôturer'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* ============ CLÔTURE & ENVOI ============ */}
        {inv.status === 'completed' && (
          <div className="card space-y-3">
            <h2 className="font-semibold text-white">📤 Envoyer le rapport</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={generateWhatsApp} disabled={!client?.phone} className="btn btn-success">
                📱 WhatsApp
              </button>
              <button onClick={generateEmail} disabled={!client?.email} className="btn btn-secondary">
                📧 Email
              </button>
            </div>
            <button onClick={() => window.print()} className="btn btn-ghost w-full">
              🖨️ Générer PDF (imprimer)
            </button>
          </div>
        )}
      </div>
    </Shell>
  );
}
