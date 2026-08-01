import type { Money } from "@/lib/catalog/types";

/**
 * Промокоди й подарункові сертифікати.
 * Демо-набір; на Етапі 12 джерелом стає модуль промоакцій Medusa,
 * інтерфейс AppliedPromo лишається незмінним.
 */

export type AppliedPromo = {
  code: string;
  label: string;
  /** Знижка в копійках */
  discount: Money;
  freeShipping: boolean;
};

type PromoDef =
  | { kind: "percent"; value: number; label: string; minSubtotal?: Money }
  | { kind: "fixed"; value: Money; label: string; minSubtotal?: Money }
  | { kind: "free-shipping"; label: string };

const PROMOS: Record<string, PromoDef> = {
  ANKE10: { kind: "percent", value: 10, label: "Знижка 10%" },
  WELCOME15: { kind: "percent", value: 15, label: "Вітальна знижка 15%", minSubtotal: 150000 },
  FREESHIP: { kind: "free-shipping", label: "Безкоштовна доставка" },
  // Подарункові сертифікати (демо): GIFT-500 / GIFT-1000 / GIFT-2000
  "GIFT-500": { kind: "fixed", value: 50000, label: "Сертифікат 500 ₴" },
  "GIFT-1000": { kind: "fixed", value: 100000, label: "Сертифікат 1000 ₴" },
  "GIFT-2000": { kind: "fixed", value: 200000, label: "Сертифікат 2000 ₴" },
};

export function validatePromo(code: string, subtotal: Money): AppliedPromo | null {
  const def = PROMOS[code.trim().toUpperCase()];
  if (!def) return null;
  if ("minSubtotal" in def && def.minSubtotal && subtotal < def.minSubtotal) return null;
  switch (def.kind) {
    case "percent":
      return {
        code: code.toUpperCase(),
        label: def.label,
        discount: Math.round((subtotal * def.value) / 100),
        freeShipping: false,
      };
    case "fixed":
      return {
        code: code.toUpperCase(),
        label: def.label,
        discount: Math.min(def.value, subtotal),
        freeShipping: false,
      };
    case "free-shipping":
      return { code: code.toUpperCase(), label: def.label, discount: 0, freeShipping: true };
  }
}
