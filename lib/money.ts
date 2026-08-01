import type { Money } from "./catalog/types";

/** Форматування ціни: 249900 (коп.) → "2 499 ₴" */
export function formatPrice(kopecks: Money): string {
  const hryvnias = Math.round(kopecks / 100);
  return `${hryvnias.toLocaleString("uk-UA").replace(/ /g, " ")} ₴`;
}

/** Гривні (ціле) → копійки */
export function uah(hryvnias: number): Money {
  return Math.round(hryvnias * 100);
}

/** Відсоток знижки: (2999, 1999) → 33 */
export function discountPercent(compareAt: Money, price: Money): number {
  if (compareAt <= 0 || price >= compareAt) return 0;
  return Math.round((1 - price / compareAt) * 100);
}

/** Для фідів і Schema.org: 249900 → "2499.00" */
export function priceDecimal(kopecks: Money): string {
  return (kopecks / 100).toFixed(2);
}
