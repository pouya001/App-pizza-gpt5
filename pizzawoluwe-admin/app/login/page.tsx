
'use client';
import { useState } from 'react';
import { supabase } from '@/src/lib/supabaseClient';
import { useRouter } from 'next/navigation';
export default function LoginPage() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); return; }
    router.push('/dashboard');
  }
  return (
    <div className="min-h-screen grid place-items-center p-6 bg-gray-50">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white p-6 rounded-2xl shadow space-y-4">
        <div className="text-center mb-2"><img src="/logo.svg" className="mx-auto h-10" alt="logo"/><h1 className="mt-2 text-lg font-semibold">Connexion</h1></div>
        <div><label className="block text-sm mb-1">Email</label><input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
        <div><label className="block text-sm mb-1">Mot de passe</label><input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <button className="btn btn-primary w-full" type="submit">Se connecter</button>
      </form>
    </div>
  );
}
