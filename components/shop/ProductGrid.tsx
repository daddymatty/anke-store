"use client";

import { AnimatePresence, motion } from "motion/react";
import { ProductCard } from "./ProductCard";
import { CardActions } from "./CardActions";
import { dur, easeUI, viewportOnce } from "@/lib/motion";
import type { ProductCard as ProductCardType } from "@/lib/catalog/types";

/**
 * Сітка товарів: 2 колонки mobile, 3–4 desktop.
 * Motion-шар (розділ 6): whileInView stagger 0.05s (один раз, знизу на 16px)
 * + layout-анімація при зміні набору (фільтри) через стабільні key.
 */
export function ProductGrid({
  items,
  priorityCount = 0,
}: {
  items: ProductCardType[];
  priorityCount?: number;
}) {
  if (!items.length) {
    return (
      <div className="py-20 text-center">
        <p className="font-display text-xl font-light">За цими фільтрами нічого не знайдено</p>
        <p className="mt-2 text-[13px] text-muted">Спробуйте прибрати частину фільтрів або подивіться новинки.</p>
      </div>
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-3 xl:grid-cols-4">
      <AnimatePresence mode="popLayout" initial={false}>
        {items.map((p, i) => (
          <motion.li
            key={p.id}
            layout
            className="group relative"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            viewport={viewportOnce}
            transition={{ duration: dur.base, ease: easeUI, delay: Math.min(i % 4, 3) * 0.05 }}
          >
            <ProductCard product={p} priority={i < priorityCount} />
            <CardActions product={p} />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
