"use client";

import { CART_COOKIE } from "@/lib/cookie-names";

/**
 * Клієнтський стан кошика поверх cookie (лічильник у хедері, оновлення drawer).
 * Мутації — тільки через server actions; тут лише читання + сигнал про зміну.
 */

const listeners = new Set<() => void>();

export function subscribeCart(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function notifyCartChanged(): void {
  for (const l of listeners) l();
}

export function getCartSnapshot(): string {
  if (typeof document === "undefined") return "[]";
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${CART_COOKIE}=`));
  if (!match) return "[]";
  try {
    return decodeURIComponent(match.slice(CART_COOKIE.length + 1));
  } catch {
    return "[]";
  }
}

export function getCartServerSnapshot(): string {
  return "[]";
}

/** Відкрити drawer кошика з будь-якого місця (слухає Header) */
export function openCartDrawer(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("anke:open-cart"));
  }
}

export function cartCount(snapshot: string): number {
  try {
    const arr = JSON.parse(snapshot);
    return Array.isArray(arr) ? arr.reduce((a: number, l) => a + (Number(l?.qty) || 0), 0) : 0;
  } catch {
    return 0;
  }
}
