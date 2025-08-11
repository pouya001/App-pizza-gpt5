
'use client';
import Shell from '@/src/components/Shell';
import { supabase } from '@/src/lib/supabaseClient';
import { useEffect, useState } from 'react';
type Pizza = { id:number; name:string; description:string; price_eur:number; available:boolean; };
export default function PizzasPage() {
  const [rows, setRows] = useState<Pizza[]>([]);
  const [name, setName] = useState(''); const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(12.5); const [available, setAvailable] = useState(true);
  async function load(){ const { data } = await supabase.from('pizzas').select('*').order('name'); setRows((data ?? []) as any); }
  useEffect(()=>{ load(); }, []);
  async function add(){ if (!name.trim() || !description.trim() || price <= 0) { alert('Champs requis manquants.'); return; }
    const { error } = await supabase.from('pizzas').insert({ name, description, price_eur: price, available }); if (error) { alert(error.message); return; }
    setName(''); setDescription(''); setPrice(12.5); setAvailable(true); load();
  }
  async function toggle(p: Pizza){ await supabase.from('pizzas').update({ available: !p.available }).eq('id', p.id); load(); }
  return (
    <Shell>
      <h1 className="text-xl font-semibold mb-3">Pizzas</h1>
      <div className="card mb-4 grid md:grid-cols-4 gap-2">
        <input className="input" placeholder="Nom" value={name} onChange={e=>setName(e.target.value)} />
        <input className="input md:col-span-2" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
        <input className="input" type="number" step="0.01" min="0" value={price} onChange={e=>setPrice(Number(e.target.value))} />
        <label className="flex items-center gap-2"><input type="checkbox" checked={available} onChange={e=>setAvailable(e.target.checked)}/> Disponible</label>
        <button className="btn btn-primary md:col-span-4" onClick={add}>+ Ajouter</button>
      </div>
      <div className="card overflow-x-auto">
        <table className="table">
          <thead><tr><th>Nom</th><th>Description</th><th>Prix</th><th>Disponible</th></tr></thead>
          <tbody>{rows.map(p => (<tr key={p.id}><td>{p.name}</td><td>{p.description}</td><td>{p.price_eur.toFixed(2)} €</td><td><button className={"btn " + (p.available ? "btn-primary" : "")} onClick={()=>toggle(p)}>{p.available ? 'Disponible' : 'Indispo'}</button></td></tr>))}</tbody>
        </table>
      </div>
    </Shell>
  );
}
