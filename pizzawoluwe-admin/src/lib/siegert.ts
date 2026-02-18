/**
 * Formule de Siegert (DIN 4702 partie 8)
 * Calcul du rendement de combustion des chaudières au gaz.
 *
 * η (%) = 100 - qA
 * qA = (Tg - Tl) × (A1 + B1 / CO₂%)
 *
 * Constantes pour gaz naturel H (G20) :
 *   A1 = 0.38   B1 = 0.009
 *
 * Normes bruxelloises (IBGE/Bruxelles Environnement) :
 *   CO < 1 000 ppm  → vert
 *   CO 1 000–3 000 ppm → orange
 *   CO > 3 000 ppm  → rouge
 *   η ≥ 84 %        → vert
 *   η 80–84 %       → orange
 *   η < 80 %        → rouge
 */

const A1 = 0.38;   // Constante Siegert gaz naturel H
const B1 = 0.009;  // Constante Siegert gaz naturel H

export interface CombustionInput {
  flueTemp: number;       // Température fumées Tg (°C)
  ambientTemp?: number;   // Température air comburant Tl (°C) – défaut 20°C
  co2Rate: number;        // CO₂ (%)
  coPpm: number;          // CO (ppm)
  o2Rate?: number;        // O₂ (%) – informatif
  lambda?: number;        // λ – informatif
}

export interface CombustionResult {
  qA: number;             // Pertes par les fumées (%)
  efficiency: number;     // Rendement η (%)
  status: 'green' | 'orange' | 'red';
  statusLabel: string;
  alerts: string[];
}

export function calculateSiegert(input: CombustionInput): CombustionResult {
  const { flueTemp, ambientTemp = 20, co2Rate, coPpm } = input;
  const alerts: string[] = [];

  // Validation des entrées
  if (co2Rate <= 0) {
    return {
      qA: 0, efficiency: 0,
      status: 'red', statusLabel: 'Données insuffisantes',
      alerts: ['CO₂ doit être supérieur à 0 pour le calcul Siegert'],
    };
  }

  // Calcul Siegert
  const qA = (flueTemp - ambientTemp) * (A1 + B1 / co2Rate);
  const efficiency = Math.max(0, Math.round((100 - qA) * 10) / 10);
  const qARounded = Math.round(qA * 10) / 10;

  let status: 'green' | 'orange' | 'red' = 'green';

  // Vérification CO (ppm)
  if (coPpm > 3000) {
    alerts.push(`CO dangereux : ${coPpm} ppm — seuil max 3 000 ppm`);
    status = 'red';
  } else if (coPpm > 1000) {
    alerts.push(`CO élevé : ${coPpm} ppm — recommandé < 1 000 ppm`);
    if (status !== 'red') status = 'orange';
  }

  // Vérification rendement (normes bruxelloises)
  if (efficiency < 80) {
    alerts.push(`Rendement insuffisant : ${efficiency} % — minimum légal 80 %`);
    status = 'red';
  } else if (efficiency < 84) {
    alerts.push(`Rendement limite : ${efficiency} % — recommandé ≥ 84 %`);
    if (status !== 'red') status = 'orange';
  }

  const statusLabel =
    status === 'green' ? 'Conforme' :
    status === 'orange' ? 'Attention requise' : 'Non conforme';

  return { qA: qARounded, efficiency, status, statusLabel, alerts };
}

export function conformityColor(status: string): string {
  if (status === 'green') return '#22c55e';
  if (status === 'orange') return '#f59e0b';
  return '#ef4444';
}

export function conformityBg(status: string): string {
  if (status === 'green') return 'bg-green-900/40 border-green-500 text-green-300';
  if (status === 'orange') return 'bg-amber-900/40 border-amber-500 text-amber-300';
  return 'bg-red-900/40 border-red-500 text-red-300';
}
