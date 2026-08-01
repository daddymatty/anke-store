"use client";

import { WISHLIST_COOKIE } from "@/lib/cookie-names";

/**
 * Клієнтський стан вішліста поверх first-party cookie.
 * useSyncExternalStore-сумісні snapshot/subscribe: сердечка на картках
 * читають cookie без SSR-запиту (не ламаючи ISR) і оновлюються після toggle.
 */

const listeners = new Set<() => void>();

export function subscribeWishlist(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Викликати після server action toggleWishlist — перерендерить усі сердечка */
export function notifyWishlistChanged(): void {
  for (const l of listeners) l();
}

/** Snapshot — сирий рядок cookie (примітив → стабільне порівняння) */
export function getWishlistSnapshot(): string {
  if (typeof document === "undefined") return "[]";
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${WISHLIST_COOKIE}=`));
  if (!match) return "[]";
  try {
    return decodeURIComponent(match.slice(WISHLIST_COOKIE.length + 1));
  } catch {
    return "[]";
  }
}

export function getWishlistServerSnapshot(): string {
  return "[]";
}

export function wishlistIncludes(snapshot: string, slug: string): boolean {
  try {
    const arr = JSON.parse(snapshot);
    return Array.isArray(arr) && arr.includes(slug);
  } catch {
    return false;
  }
}
