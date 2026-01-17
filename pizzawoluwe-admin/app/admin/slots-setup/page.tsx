'use client';

import { useState, useEffect } from 'react';
import Shell from '@/src/components/Shell';

type Stats = {
  totalSlots: number;
  firstSlot: string;
  lastSlot: string;
  todaySlotsCount: number;
  nextWeekSlotsCount: number;
};

type TodaySlot = {
  id: number;
  time: string;
};

export default function SlotsSetupPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [todaySlots, setTodaySlots] = useState<TodaySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');

  async function loadStats() {
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/slots-manager');
      const data = await res.json();

      if (data.success) {
        setStats(data.stats);
        setTodaySlots(data.todaySlots || []);
      } else {
        setMessage('❌ Erreur lors du chargement des stats');
      }
    } catch (error) {
      setMessage('❌ Erreur réseau');
    } finally {
      setLoading(false);
    }
  }

  async function generateSlots(days: number) {
    setGenerating(true);
    setMessage('');

    try {
      const res = await fetch('/api/slots-manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days })
      });

      const data = await res.json();

      if (data.success) {
        setMessage(`✅ ${data.created} créneaux créés sur ${data.total} tentatives`);
        await loadStats(); // Recharger les stats
      } else {
        setMessage(`❌ Erreur : ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Erreur réseau');
    } finally {
      setGenerating(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <Shell>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🛠️ Gestion des Créneaux</h1>

        {/* Message */}
        {message && (
          <div className={`p-4 mb-4 rounded-lg ${
            message.startsWith('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {/* Statistiques */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">📊 Statistiques</h2>

          {loading ? (
            <p className="text-gray-500">Chargement...</p>
          ) : stats ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded">
                <div className="text-3xl font-bold text-blue-600">{stats.totalSlots}</div>
                <div className="text-sm text-gray-600">Créneaux totaux</div>
              </div>

              <div className="p-4 bg-green-50 rounded">
                <div className="text-3xl font-bold text-green-600">{stats.todaySlotsCount}</div>
                <div className="text-sm text-gray-600">Créneaux aujourd'hui</div>
              </div>

              <div className="p-4 bg-purple-50 rounded">
                <div className="text-3xl font-bold text-purple-600">{stats.nextWeekSlotsCount}</div>
                <div className="text-sm text-gray-600">Créneaux semaine prochaine</div>
              </div>

              <div className="p-4 bg-gray-50 rounded">
                <div className="text-sm text-gray-600 mb-1">Période couverte</div>
                <div className="text-xs">
                  {stats.firstSlot ? new Date(stats.firstSlot).toLocaleDateString('fr-FR') : 'N/A'}
                  {' → '}
                  {stats.lastSlot ? new Date(stats.lastSlot).toLocaleDateString('fr-FR') : 'N/A'}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-red-600">Erreur de chargement</p>
          )}
        </div>

        {/* Créneaux d'aujourd'hui */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">📅 Créneaux d'aujourd'hui</h2>

          {todaySlots.length > 0 ? (
            <div className="grid grid-cols-6 gap-2">
              {todaySlots.map(slot => (
                <div key={slot.id} className="p-2 bg-green-100 text-green-800 rounded text-center text-sm">
                  {slot.time}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Aucun créneau pour aujourd'hui</p>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">⚡ Actions</h2>

          <div className="space-y-3">
            <button
              onClick={() => loadStats()}
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              🔄 Actualiser les stats
            </button>

            <button
              onClick={() => generateSlots(7)}
              disabled={generating}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {generating ? 'Génération...' : '+ Générer 7 jours de créneaux'}
            </button>

            <button
              onClick={() => generateSlots(30)}
              disabled={generating}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {generating ? 'Génération...' : '+ Générer 30 jours de créneaux'}
            </button>

            <button
              onClick={() => generateSlots(90)}
              disabled={generating}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {generating ? 'Génération...' : '+ Générer 90 jours de créneaux'}
            </button>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm">
            <strong>ℹ️ Info :</strong> Les créneaux existants ne seront pas dupliqués. Vous pouvez cliquer plusieurs fois sans risque.
          </div>
        </div>
      </div>
    </Shell>
  );
}
