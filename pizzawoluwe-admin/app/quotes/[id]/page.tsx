'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Shell from '@/src/components/Shell';
import { supabase } from '@/src/lib/supabaseClient';
import { formatEuro, formatDate, QUOTE_STATUSES } from '@/src/lib/formatters';
import { getVatRate, getVatLabel } from '@/src/lib/vat';

const STATUS_NEXT: Record<string, { label: string; next: string; cls: string }[]> = {
  draft:    [{ next: 'sent',     label: 'Marquer Envoyé',   cls: 'btn-primary'   }],
  sent:     [{ next: 'accepted', label: 'Marquer Accepté',  cls: 'btn-success'   },
             { next: 'rejected', label: 'Marquer Refusé',   cls: 'btn-danger'    }],
  accepted: [],
  rejected: [{ next: 'draft',   label: 'Remettre en brouillon', cls: 'btn-secondary' }],
};

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [quote, setQuote] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [building, setBuilding] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Item form
  const [showItemForm, setShowItemForm] = useState(false);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [catSearch, setCatSearch] = useState('');
  const [iForm, setIForm] = useState({ description: '', quantity: '1', unit_price: '', unit: 'pce', catalog_item_id: '' });
  const [iSaving, setISaving] = useState(false);

  // Notes
  const [editNotes, setEditNotes] = useState(false);
  const [notes, setNotes] = useState('');

  // Valid until
  const [editValidity, setEditValidity] = useState(false);
  const [validUntil, setValidUntil] = useState('');

  useEffect(() => { if (id) load(); }, [id]);
  useEffect(() => { if (quote) { setNotes(quote.notes ?? ''); setValidUntil(quote.valid_until ?? ''); } }, [quote]);

  async function load() {
    const [qRes, itemsRes] = await Promise.all([
      supabase.from('quotes').select('*, clients(*), buildings(*)').eq('id', id).single(),
      supabase.from('quote_items').select('*, catalog_items(reference)').eq('quote_id', id),
    ]);
    if (qRes.data) {
      setQuote(qRes.data);
      setClient(qRes.data.clients);
      setBuilding(qRes.data.buildings);
    }
    setItems(itemsRes.data ?? []);
    setLoading(false);
  }

  async function changeStatus(next: string) {
    await supabase.from('quotes').update({ status: next }).eq('id', id);
    await load();
  }

  async function loadCatalog(q: string) {
    if (!q) { setCatalog([]); return; }
    const { data } = await supabase.from('catalog_items').select('*').ilike('name', `%${q}%`).eq('active', true).limit(8);
    setCatalog(data ?? []);
  }

  function selectCatalogItem(ci: any) {
    setIForm({ description: ci.name, quantity: '1', unit_price: String(ci.sale_price), unit: ci.unit, catalog_item_id: String(ci.id) });
    setCatSearch(ci.name);
    setCatalog([]);
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!iForm.description || !iForm.unit_price) return;
    setISaving(true);
    await supabase.from('quote_items').insert({
      quote_id: Number(id),
      catalog_item_id: iForm.catalog_item_id ? Number(iForm.catalog_item_id) : null,
      description: iForm.description,
      quantity: parseFloat(iForm.quantity) || 1,
      unit_price: parseFloat(iForm.unit_price),
      unit: iForm.unit,
    });
    await recalcTotal();
    setIForm({ description: '', quantity: '1', unit_price: '', unit: 'pce', catalog_item_id: '' });
    setCatSearch('');
    setShowItemForm(false);
    setISaving(false);
    await load();
  }

  async function deleteItem(itemId: number) {
    await supabase.from('quote_items').delete().eq('id', itemId);
    await recalcTotal();
    await load();
  }

  async function recalcTotal() {
    const { data } = await supabase.from('quote_items').select('quantity,unit_price').eq('quote_id', id);
    const sub = (data ?? []).reduce((s: number, i: any) => s + i.quantity * i.unit_price, 0);
    const vatRate = building?.construction_year ? getVatRate(building.construction_year) : (quote?.vat_rate ?? 21);
    const vat = Math.round(sub * vatRate) / 100;
    await supabase.from('quotes').update({ subtotal: sub, vat_amount: vat, total: sub + vat, vat_rate: vatRate }).eq('id', id);
  }

  async function saveNotes() {
    await supabase.from('quotes').update({ notes: notes || null }).eq('id', id);
    setEditNotes(false);
    await load();
  }

  async function saveValidity() {
    await supabase.from('quotes').update({ valid_until: validUntil || null }).eq('id', id);
    setEditValidity(false);
    await load();
  }

  async function convertToIntervention() {
    if (!quote || !client) return;
    const { data: numData } = await supabase.rpc('next_intervention_number');
    const { data: inv } = await supabase.from('interventions').insert({
      number: numData,
      quote_id: Number(id),
      client_id: client.id,
      building_id: building?.id ?? null,
      type: 'maintenance',
      status: 'planned',
      vat_rate: quote.vat_rate,
    }).select().single();
    if (inv) {
      // Copy items
      for (const it of items) {
        await supabase.from('intervention_items').insert({
          intervention_id: inv.id,
          catalog_item_id: it.catalog_item_id ?? null,
          description: it.description,
          quantity: it.quantity,
          unit_price: it.unit_price,
          unit: it.unit,
        });
      }
      await supabase.from('interventions').update({
        subtotal: quote.subtotal, vat_amount: quote.vat_amount, total: quote.total,
      }).eq('id', inv.id);
      router.push(`/interventions/${inv.id}`);
    }
  }

  function sendWhatsApp() {
    if (!client?.phone) return;
    const phone = client.phone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `Bonjour ${client.first_name ?? client.last_name}, veuillez trouver ci-joint le devis ${quote?.number ?? ''} d'un montant de ${formatEuro(quote?.total)}. Ce devis est valable jusqu'au ${formatDate(quote?.valid_until)}. Cordialement.`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  }

  if (loading) return <Shell><div className="text-slate-400 text-center py-20">Chargement…</div></Shell>;
  if (!quote) return <Shell><div className="card text-center text-red-400 py-10">Devis introuvable</div></Shell>;

  const st = QUOTE_STATUSES[quote.status];
  const nextActions = STATUS_NEXT[quote.status] ?? [];
  const vatLabel = building?.construction_year ? getVatLabel(building.construction_year) : `TVA ${quote.vat_rate}%`;

  return (
    <Shell>
      <div className="space-y-5 max-w-2xl">
        <Link href="/quotes" className="text-sm text-orange-400 hover:text-orange-300 inline-flex items-center gap-1">
          ← Tous les devis
        </Link>

        {/* En-tête devis */}
        <div className="card">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xl text-white">{quote.number ?? 'Devis'}</span>
                {st && <span className={`badge ${st.color}`}>{st.label}</span>}
                <span className={`badge ${quote.vat_rate <= 6 ? 'bg-green-900 text-green-300' : 'bg-slate-700 text-slate-300'}`}>
                  TVA {quote.vat_rate}%
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">Créé le {formatDate(quote.created_at)}</div>
            </div>
            <button onClick={() => window.print()} className="btn btn-ghost text-xs px-3 py-2">🖨️ PDF</button>
          </div>

          {/* Client */}
          <Link href={`/clients/${client?.id}`} className="font-semibold text-white hover:text-orange-400 text-lg block">
            {client?.first_name} {client?.last_name}
          </Link>
          {client?.phone && <div className="text-orange-400 text-sm">{client.phone}</div>}
          {building && (
            <div className="text-slate-400 text-sm mt-1">
              📍 {building.address}, {building.city}
              {building.construction_year && <span className="ml-2">· {building.construction_year}</span>}
            </div>
          )}

          {/* TVA info */}
          <div className="mt-3 text-xs text-orange-300 bg-orange-500/10 rounded-xl px-3 py-2">
            💡 {vatLabel}
          </div>

          {/* Validité */}
          <div className="mt-3 flex items-center gap-2">
            {!editValidity ? (
              <>
                <span className="text-sm text-slate-400">
                  Valable jusqu'au : {quote.valid_until ? formatDate(quote.valid_until) : '—'}
                </span>
                <button onClick={() => setEditValidity(true)} className="text-xs text-orange-400">Modifier</button>
              </>
            ) : (
              <div className="flex gap-2 flex-1">
                <input className="input flex-1 text-sm" type="date" value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)} />
                <button onClick={saveValidity} className="btn btn-primary text-xs px-3 py-2">✓</button>
                <button onClick={() => setEditValidity(false)} className="btn btn-ghost text-xs px-3 py-2">✕</button>
              </div>
            )}
          </div>

          {/* Actions statut */}
          {nextActions.length > 0 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {nextActions.map((a) => (
                <button key={a.next} onClick={() => changeStatus(a.next)} className={`btn ${a.cls} flex-1`}>
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ====== LIGNES DE DEVIS ====== */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Détail des prestations</h2>
            <button onClick={() => setShowItemForm(!showItemForm)} className="btn btn-secondary text-xs px-3 py-2">
              + Ligne
            </button>
          </div>

          {showItemForm && (
            <form onSubmit={addItem} className="border border-slate-600 rounded-xl p-3 space-y-3">
              <div>
                <label>Rechercher catalogue</label>
                <input className="input text-sm" placeholder="Pièce ou service…"
                  value={catSearch}
                  onChange={(e) => { setCatSearch(e.target.value); loadCatalog(e.target.value); }} />
                {catalog.length > 0 && (
                  <div className="bg-slate-700 border border-slate-600 rounded-xl mt-1 overflow-hidden">
                    {catalog.map((ci) => (
                      <button key={ci.id} type="button"
                        className="w-full text-left px-3 py-2 hover:bg-slate-600 text-sm border-b border-slate-600/50 last:border-0"
                        onClick={() => selectCatalogItem(ci)}>
                        <span className="text-white">{ci.name}</span>
                        <span className="text-orange-400 ml-2">{ci.sale_price?.toFixed(2)} €/{ci.unit}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label>Description *</label>
                <input className="input text-sm" required placeholder="Description"
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
                  {iSaving ? 'Ajout…' : 'Ajouter'}
                </button>
                <button type="button" onClick={() => setShowItemForm(false)} className="btn btn-ghost flex-1">Annuler</button>
              </div>
            </form>
          )}

          {items.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">Aucune ligne ajoutée</p>
          ) : (
            <div className="space-y-1">
              {items.map((it) => (
                <div key={it.id} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white">{it.description}</div>
                    <div className="text-xs text-slate-500">
                      {it.quantity} × {it.unit_price?.toFixed(2)} €/{it.unit}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-medium text-orange-300">
                      {((it.quantity || 1) * it.unit_price).toFixed(2)} €
                    </span>
                    <button onClick={() => deleteItem(it.id)} className="text-red-400 text-xs">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <div className="border-t border-slate-600 pt-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Sous-total HT</span>
                <span className="text-white">{formatEuro(quote.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">TVA {quote.vat_rate}%</span>
                <span className="text-white">{formatEuro(quote.vat_amount)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-slate-600 pt-2">
                <span className="text-white">Total TTC</span>
                <span className="text-orange-400">{formatEuro(quote.total)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Notes</h2>
            <button onClick={() => setEditNotes(!editNotes)} className="btn btn-ghost text-xs px-3 py-2">
              {editNotes ? 'Annuler' : 'Modifier'}
            </button>
          </div>
          {editNotes ? (
            <>
              <textarea className="input" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
              <button onClick={saveNotes} className="btn btn-primary w-full">Sauvegarder</button>
            </>
          ) : (
            <p className="text-slate-300 text-sm whitespace-pre-wrap min-h-[3rem]">
              {quote.notes || <span className="text-slate-500">Aucune note</span>}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-white">Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={sendWhatsApp} disabled={!client?.phone} className="btn btn-success">
              📱 Envoyer WhatsApp
            </button>
            <button onClick={() => window.print()} className="btn btn-secondary">
              🖨️ Générer PDF
            </button>
          </div>
          {quote.status === 'accepted' && (
            <button onClick={convertToIntervention} className="btn btn-primary w-full">
              🔧 Convertir en intervention
            </button>
          )}
        </div>
      </div>
    </Shell>
  );
}
