"use client";

/**
 * «Ви переглядали» — останні 8 товарів у localStorage (тільки клієнт, не критичний шлях).
 * Мінімальний знімок картки, щоб рендерити без запиту до API.
 * useSyncExternalStore-сумісні snapshot/subscribe з кешем (стабільні референси).
 */

export type ViewedItem = {
  slug: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  alt: string;
};

const KEY = "anke_viewed";
const MAX = 8;
const EMPTY: ViewedItem[] = [];

let cacheRaw: string | null = null;
let cacheVal: ViewedItem[] = EMPTY;

const listeners = new Set<() => void>();

export function subscribeViewed(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => e.key === KEY && cb();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function getViewedSnapshot(): ViewedItem[] {
  const raw = localStorage.getItem(KEY) ?? "[]";
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    try {
      const arr = JSON.parse(raw);
      cacheVal = Array.isArray(arr) ? arr.slice(0, MAX) : EMPTY;
    } catch {
      cacheVal = EMPTY;
    }
  }
  return cacheVal;
}

export function getViewedServerSnapshot(): ViewedItem[] {
  return EMPTY;
}

export function pushRecentlyViewed(item: ViewedItem): void {
  if (typeof window === "undefined") return;
  const list = getViewedSnapshot().filter((x) => x.slug !== item.slug);
  const next = [item, ...list].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    for (const l of listeners) l();
  } catch {
    // квота/приватний режим — мовчки ігноруємо
  }
}
