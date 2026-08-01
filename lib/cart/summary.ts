import "server-only";

import type { CartLine } from "@/app/actions/cart";
import { catalog } from "@/lib/catalog";
import type { Money, ProductCard } from "@/lib/catalog/types";
import { validatePromo, type AppliedPromo } from "@/lib/promo";
import { SITE } from "@/lib/site";

/** Серверний розрахунок кошика: єдине джерело правди для цін і тоталів. */

export type CartItem = {
  slug: string;
  size: string;
  qty: number;
  title: string;
  image: { url: string; alt: string };
  price: Money;
  compareAtPrice?: Money;
  lineTotal: Money;
  inStock: boolean;
  sku: string;
  card: ProductCard;
};

export type CartSummary = {
  items: CartItem[];
  subtotal: Money;
  discount: Money;
  promo: AppliedPromo | null;
  shipping: Money | null; // null = розраховується перевізником (накладений/адресна)
  freeShippingFrom: Money;
  freeShippingProgress: number; // 0..1
  total: Money;
  count: number;
};

export async function resolveCart(lines: CartLine[], promoCode?: string | null): Promise<CartSummary> {
  const items: CartItem[] = [];
  for (const line of lines) {
    const p = await catalog.getProduct(line.slug);
    if (!p) continue;
    const sizeStock = p.sizes.find((s) => s.size === line.size);
    items.push({
      slug: p.slug,
      size: line.size,
      qty: line.qty,
      title: p.title,
      image: { url: p.images[0]?.url ?? "", alt: p.images[0]?.alt ?? p.title },
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      lineTotal: p.price * line.qty,
      inStock: sizeStock?.inStock ?? false,
      sku: `${p.sku}-${line.size.replace(/\s/g, "")}`,
      card: p,
    });
  }
  const subtotal = items.reduce((a, i) => a + i.lineTotal, 0);
  const promo = promoCode ? validatePromo(promoCode, subtotal) : null;
  const discount = promo?.discount ?? 0;
  const freeShippingFrom = SITE.freeShippingFrom * 100;
  const afterDiscount = subtotal - discount;
  const shipping = promo?.freeShipping || afterDiscount >= freeShippingFrom ? 0 : null;
  return {
    items,
    subtotal,
    discount,
    promo,
    shipping,
    freeShippingFrom,
    freeShippingProgress: Math.min(1, afterDiscount / freeShippingFrom),
    total: afterDiscount,
    count: items.reduce((a, i) => a + i.qty, 0),
  };
}
