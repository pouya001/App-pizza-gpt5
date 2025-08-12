'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErr(error.message);
      return;
    }
    // Connexion OK → vers le dashboard
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-gray-50">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white p-6 rounded-xl shadow">
        <div className="text-center font-semibold text-red-600 mb-4">PizzaWoluwe</div>
        <h1 className="text-center text-lg mb-4">Connexion</h1>

        <label className="text-sm">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-2 mb-3"
        />

        <label className="text-sm">Mot de passe</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded p-2 mb-4"
        />

        {err && <p className="text-sm text-red-600 mb-3">{err}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white rounded p-2 disabled:opacity-50"
        >
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
