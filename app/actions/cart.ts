"use server";

import { cookies } from "next/headers";
import { CART_COOKIE } from "@/lib/cookie-names";

/**
 * Кошик: позиції у first-party cookie (slug+size+qty), всі ціни й тотали
 * рахуються ТІЛЬКИ на сервері з каталогу (lib/cart/summary.ts).
 * Cookie не httpOnly — клієнт читає лічильник без запиту (ISR-сторінки не страждають).
 */

export type CartLine = { slug: string; size: string; qty: number };

const MAX_LINES = 30;
const MAX_QTY = 10;
const MAX_AGE = 60 * 60 * 24 * 30; // 30 днів

async function readLines(): Promise<CartLine[]> {
  const store = await cookies();
  const raw = store.get(CART_COOKIE)?.value;
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter(
        (x): x is CartLine =>
          x && typeof x.slug === "string" && typeof x.size === "string" && typeof x.qty === "number",
      )
      .slice(0, MAX_LINES);
  } catch {
    return [];
  }
}

async function writeLines(lines: CartLine[]): Promise<void> {
  const store = await cookies();
  store.set(CART_COOKIE, JSON.stringify(lines), {
    maxAge: MAX_AGE,
    path: "/",
    sameSite: "lax",
    httpOnly: false,
  });
}

export async function getCartLines(): Promise<CartLine[]> {
  return readLines();
}

export async function addToCart(slug: string, size: string, qty = 1): Promise<CartLine[]> {
  const lines = await readLines();
  const existing = lines.find((l) => l.slug === slug && l.size === size);
  if (existing) {
    existing.qty = Math.min(existing.qty + qty, MAX_QTY);
  } else {
    lines.push({ slug, size, qty: Math.min(qty, MAX_QTY) });
  }
  await writeLines(lines);
  return lines;
}

export async function setCartQty(slug: string, size: string, qty: number): Promise<CartLine[]> {
  let lines = await readLines();
  if (qty <= 0) {
    lines = lines.filter((l) => !(l.slug === slug && l.size === size));
  } else {
    const line = lines.find((l) => l.slug === slug && l.size === size);
    if (line) line.qty = Math.min(qty, MAX_QTY);
  }
  await writeLines(lines);
  return lines;
}

export async function clearCart(): Promise<void> {
  await writeLines([]);
}
