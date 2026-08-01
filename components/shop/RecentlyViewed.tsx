"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { formatPrice } from "@/lib/money";
import {
  getViewedServerSnapshot,
  getViewedSnapshot,
  subscribeViewed,
} from "@/lib/recently-viewed";

/**
 * Блок «Ви переглядали»: рендериться лише якщо є історія (після гідрації —
 * нуль впливу на SSR/LCP). excludeSlug — не показувати поточний товар.
 */
export function RecentlyViewed({ excludeSlug }: { excludeSlug?: string }) {
  const all = useSyncExternalStore(subscribeViewed, getViewedSnapshot, getViewedServerSnapshot);
  const items = all.filter((x) => x.slug !== excludeSlug);

  if (!items.length) return null;

  return (
    <section aria-labelledby="recently-viewed" className="mt-20">
      <h2 id="recently-viewed" className="font-display text-display-sm font-light">
        Ви переглядали
      </h2>
      <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4 xl:grid-cols-8">
        {items.map((item) => (
          <li key={item.slug}>
            <Link href={`/product/${item.slug}`} className="group block">
              <span className="relative block aspect-[3/4] overflow-hidden bg-beige">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 12vw"
                  className="object-cover"
                />
              </span>
              <span className="mt-2 block text-[12px] leading-snug text-ink">{item.title}</span>
              <span className="block text-[12px] font-medium">{formatPrice(item.price)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
