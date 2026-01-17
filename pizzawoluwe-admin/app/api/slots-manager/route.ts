import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// GET: Diagnostic des créneaux existants
export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  // Vérifier l'authentification
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Compter les créneaux totaux
  const { count: totalSlots } = await supabase
    .from('slots')
    .select('*', { count: 'exact', head: true });

  // Obtenir les dates min/max
  const { data: dateRange } = await supabase
    .from('slots')
    .select('starts_at')
    .order('starts_at', { ascending: true })
    .limit(1);

  const { data: dateRangeMax } = await supabase
    .from('slots')
    .select('starts_at')
    .order('starts_at', { ascending: false })
    .limit(1);

  // Créneaux pour aujourd'hui
  const today = new Date().toISOString().split('T')[0];
  const { data: todaySlots } = await supabase
    .from('slots')
    .select('id, starts_at')
    .gte('starts_at', `${today}T00:00:00`)
    .lt('starts_at', `${today}T23:59:59`)
    .order('starts_at');

  // Créneaux pour la semaine prochaine
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];

  const { count: nextWeekCount } = await supabase
    .from('slots')
    .select('*', { count: 'exact', head: true })
    .gte('starts_at', `${today}T00:00:00`)
    .lt('starts_at', `${nextWeekStr}T23:59:59`);

  return NextResponse.json({
    success: true,
    stats: {
      totalSlots,
      firstSlot: dateRange?.[0]?.starts_at,
      lastSlot: dateRangeMax?.[0]?.starts_at,
      todaySlotsCount: todaySlots?.length || 0,
      nextWeekSlotsCount: nextWeekCount || 0,
    },
    todaySlots: todaySlots?.map(s => ({
      id: s.id,
      time: new Date(s.starts_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }))
  });
}

// POST: Générer des créneaux pour les N prochains jours
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  // Vérifier l'authentification
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { days = 30 } = body; // Par défaut 30 jours

  const slotsToCreate = [];
  const today = new Date();

  // Générer les créneaux
  for (let dayOffset = 0; dayOffset < days; dayOffset++) {
    const currentDay = new Date(today);
    currentDay.setDate(today.getDate() + dayOffset);

    // Pour chaque heure de 11h à 23h
    for (let hour = 11; hour <= 23; hour++) {
      for (let minute of [0, 30]) {
        // Ne pas créer 24h00
        if (hour === 23 && minute === 30) {
          const slotTime = new Date(currentDay);
          slotTime.setHours(23, 30, 0, 0);

          slotsToCreate.push({
            starts_at: slotTime.toISOString(),
            max_orders: 3,
            max_pizzas: 6,
            blocked: false,
            reason: null
          });
        } else if (!(hour === 23 && minute > 0)) {
          const slotTime = new Date(currentDay);
          slotTime.setHours(hour, minute, 0, 0);

          slotsToCreate.push({
            starts_at: slotTime.toISOString(),
            max_orders: 3,
            max_pizzas: 6,
            blocked: false,
            reason: null
          });
        }
      }
    }
  }

  // Vérifier quels créneaux existent déjà
  const startTimes = slotsToCreate.map(s => s.starts_at);
  const { data: existingSlots } = await supabase
    .from('slots')
    .select('starts_at')
    .in('starts_at', startTimes);

  const existingTimes = new Set(existingSlots?.map(s => s.starts_at) || []);

  // Filtrer pour n'insérer que les nouveaux créneaux
  const newSlots = slotsToCreate.filter(s => !existingTimes.has(s.starts_at));

  if (newSlots.length === 0) {
    return NextResponse.json({
      success: true,
      message: 'Tous les créneaux existent déjà',
      created: 0,
      total: slotsToCreate.length,
      skipped: slotsToCreate.length
    });
  }

  // Insérer seulement les nouveaux créneaux
  const { data, error } = await supabase
    .from('slots')
    .insert(newSlots)
    .select();

  if (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: `Créneaux générés avec succès`,
    created: data?.length || 0,
    total: slotsToCreate.length,
    skipped: slotsToCreate.length - newSlots.length
  });
}
