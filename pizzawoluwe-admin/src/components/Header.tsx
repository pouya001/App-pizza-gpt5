
'use client';
import { supabase } from '@/src/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
export default function Header() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? '')); }, []);
  async function logout() { await supabase.auth.signOut(); router.push('/login'); }
  return (
    <header className="fixed left-64 right-0 top-0 h-14 border-b bg-white px-6 flex items-center justify-between">
      <div className="font-semibold">Admin</div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">{email}</div>
        <button className="btn" onClick={logout}>Déconnexion</button>
      </div>
    </header>
  );
}
