"use server";

import { cookies } from "next/headers";
import { WISHLIST_COOKIE } from "@/lib/cookie-names";

/**
 * Вішліст для гостей — first-party cookie (не httpOnly: клієнт читає стан
 * для сердечок без runtime-запиту, щоб не ламати ISR сторінок каталогу).
 * Для залогінених синхронізується з БД на Етапі 7.
 */

const MAX_ITEMS = 100;
const MAX_AGE = 60 * 60 * 24 * 180; // 180 днів

export async function getWishlist(): Promise<string[]> {
  const store = await cookies();
  const raw = store.get(WISHLIST_COOKIE)?.value;
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export async function toggleWishlist(slug: string): Promise<{ list: string[]; added: boolean }> {
  const store = await cookies();
  const list = await getWishlist();
  const added = !list.includes(slug);
  const next = added ? [...list, slug].slice(-MAX_ITEMS) : list.filter((s) => s !== slug);
  store.set(WISHLIST_COOKIE, JSON.stringify(next), {
    maxAge: MAX_AGE,
    path: "/",
    sameSite: "lax",
    httpOnly: false,
  });
  return { list: next, added };
}
