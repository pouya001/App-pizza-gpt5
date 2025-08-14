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
      bg-white 
      px-4 md:px-6 
      flex 
      items-center 
      justify-between 
      z-30
    ">
      {/* Titre (centré sur mobile, à gauche sur desktop) */}
      <div className="font-semibold text-gray-800 ml-12 md:ml-0">
        Admin
      </div>

      {/* Infos utilisateur */}
      <div className="flex items-center gap-2 md:gap-4">
        <div className="text-xs md:text-sm text-gray-600 hidden sm:block">
          {email}
        </div>
        <button 
          className="text-xs md:text-sm px-2 md:px-3 py-1 md:py-1.5 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          onClick={logout}
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
}
