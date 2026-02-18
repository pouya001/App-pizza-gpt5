/**
 * Utilitaires de formatage – ThermoGestion Pro
 */

export function formatEuro(amount: number | null | undefined): string {
  if (amount == null) return '—';
  return new Intl.NumberFormat('fr-BE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('fr-BE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('fr-BE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date));
}

export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('fr-BE', {
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date));
}

export const INTERVENTION_TYPES: Record<string, { label: string; icon: string; color: string }> = {
  maintenance:   { label: 'Entretien',     icon: '🔧', color: 'text-blue-400'   },
  repair:        { label: 'Dépannage',     icon: '⚡', color: 'text-amber-400'  },
  installation:  { label: 'Installation',  icon: '🏗️', color: 'text-purple-400' },
};

export const INTERVENTION_STATUSES: Record<string, { label: string; color: string }> = {
  planned:     { label: 'Planifié',     color: 'bg-blue-900 text-blue-300'    },
  in_progress: { label: 'En cours',    color: 'bg-amber-900 text-amber-300'   },
  completed:   { label: 'Terminé',     color: 'bg-green-900 text-green-300'   },
  cancelled:   { label: 'Annulé',      color: 'bg-gray-700 text-gray-400'     },
};

export const QUOTE_STATUSES: Record<string, { label: string; color: string }> = {
  draft:    { label: 'Brouillon',  color: 'bg-gray-700 text-gray-300'   },
  sent:     { label: 'Envoyé',    color: 'bg-blue-900 text-blue-300'   },
  accepted: { label: 'Accepté',   color: 'bg-green-900 text-green-300' },
  rejected: { label: 'Refusé',    color: 'bg-red-900 text-red-300'     },
};

export function clientFullName(c: { first_name?: string | null; last_name: string }): string {
  return [c.first_name, c.last_name].filter(Boolean).join(' ');
}

export function boilerTypeLabel(type: string | null | undefined): string {
  const map: Record<string, string> = {
    condensation: 'Condensation',
    atmospherique: 'Atmosphérique',
    sol: 'Au sol',
    mural: 'Mural',
    pompe_chaleur: 'Pompe à chaleur',
  };
  return type ? (map[type] ?? type) : '—';
}
