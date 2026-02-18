'use client';
import { supabase } from '@/src/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ''));
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <header className="
      fixed 
      left-0 md:left-64 
      right-0 
      top-0 
      h-14 
      border-b 
      bg-slate-900 border-slate-700
      px-4 md:px-6
      flex
      items-center
      justify-between
      z-30
    ">
      <div className="flex items-center gap-2 ml-14 md:ml-0">
        <img src="/logo.svg" alt="Atmos Technics" className="h-7 w-auto" />
      </div>
      <div className="flex items-center gap-3">
        <div className="text-xs text-slate-400 hidden sm:block">{email}</div>
        <button
          className="text-xs px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
          onClick={logout}
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
}
