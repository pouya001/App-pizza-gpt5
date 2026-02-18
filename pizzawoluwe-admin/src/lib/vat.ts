/**
 * Calcul automatique du taux de TVA
 * Règle belge (Bruxelles) : bâtiment > 10 ans → 6%, sinon → 21%
 */
export function getVatRate(constructionYear: number | null | undefined): number {
  if (!constructionYear) return 21;
  const age = new Date().getFullYear() - constructionYear;
  return age > 10 ? 6 : 21;
}

export function getVatLabel(constructionYear: number | null | undefined): string {
  const rate = getVatRate(constructionYear);
  if (!constructionYear) return 'TVA 21% (année inconnue)';
  const age = new Date().getFullYear() - constructionYear;
  return rate === 6
    ? `TVA 6% (bâtiment de ${age} ans – rénovation)`
    : `TVA 21% (bâtiment de ${age} ans – neuf)`;
}

export function calcTotals(
  items: { quantity: number; unit_price: number }[],
  vatRate: number
): { subtotal: number; vatAmount: number; total: number } {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const vatAmount = Math.round(subtotal * vatRate) / 100;
  return { subtotal, vatAmount, total: subtotal + vatAmount };
}
