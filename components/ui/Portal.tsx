"use client";

import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const noop = () => () => {};

/**
 * Рендерить дітей у <body>.
 *
 * Навіщо: хедер має власний z-index, тобто створює stacking context — усе, що
 * лежить усередині нього (меню, пошук, кошик), не може піднятися вище за сусідів
 * хедера, хоч би який z-index йому не поставили. Плюс backdrop-filter або
 * transform на предку зробили б containing block для position: fixed.
 * Портал у <body> прибирає обидві пастки.
 */
export function Portal({ children }: { children: ReactNode }) {
  // Без useEffect: правило react-hooks/set-state-in-effect забороняє setState в ефекті
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  if (!mounted) return null;
  return createPortal(children, document.body);
}
