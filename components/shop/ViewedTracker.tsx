"use client";

import { useEffect } from "react";
import { pushRecentlyViewed, type ViewedItem } from "@/lib/recently-viewed";

/** Пише поточний товар в історію «Ви переглядали» (localStorage, після mount). */
export function ViewedTracker({ item }: { item: ViewedItem }) {
  useEffect(() => {
    pushRecentlyViewed(item);
  }, [item]);
  return null;
}
