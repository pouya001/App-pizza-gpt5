
'use client';
import Shell from '@/src/components/Shell';
export default function SettingsPage(){
  return (
    <Shell>
      <h1 className="text-xl font-semibold mb-3">Paramètres</h1>
      <div className="card">Configurez les horaires d'ouverture et capacités dans Supabase (table <code>slots</code>). Une UI d'édition sera ajoutée ensuite.</div>
    </Shell>
  );
}
