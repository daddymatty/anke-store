"use client";

import type { ProductCard } from "@/lib/catalog/types";

/**
 * Єдина точка роботи з dataLayer (GA4 Enhanced Ecommerce, розділ 5 ТЗ).
 * Всі події проходять тут — жодних розкиданих window.dataLayer.push по коду.
 * Ціни в подіях — у гривнях (decimal), item_id = SKU.
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export type Ga4Item = {
  item_id: string;
  item_name: string;
  item_brand: string;
  item_category?: string;
  item_category2?: string;
  item_category3?: string;
  item_variant?: string;
  price: number;
  quantity: number;
  discount?: number;
  index?: number;
  item_list_name?: string;
};

const CATEGORY_TITLES: Record<string, string> = {
  odyah: "Одяг", sukni: "Сукні", midi: "Міді", maksi: "Максі", mini: "Міні",
  vechirni: "Вечірні", kostyumy: "Костюми", "bluzy-sorochky": "Блузи та сорочки",
  spidnytsi: "Спідниці", shtany: "Штани", trykotazh: "Трикотаж",
  "verkhniy-odyah": "Верхній одяг", vzuttya: "Взуття", aksesuary: "Аксесуари",
  sumky: "Сумки", remeni: "Ремені", khustky: "Хустки", prykrasy: "Прикраси",
};

export function toGa4Item(
  p: Pick<ProductCard, "sku" | "title" | "brand" | "price" | "compareAtPrice" | "categoryPath" | "color">,
  opts: { quantity?: number; size?: string; index?: number; listName?: string } = {},
): Ga4Item {
  const [c1, c2, c3] = p.categoryPath;
  return {
    item_id: p.sku,
    item_name: p.title,
    item_brand: p.brand,
    item_category: c1 ? (CATEGORY_TITLES[c1] ?? c1) : undefined,
    item_category2: c2 ? (CATEGORY_TITLES[c2] ?? c2) : undefined,
    item_category3: c3 ? (CATEGORY_TITLES[c3] ?? c3) : undefined,
    item_variant: [p.color.name, opts.size].filter(Boolean).join(" / ") || undefined,
    price: Math.round(p.price) / 100,
    quantity: opts.quantity ?? 1,
    discount: p.compareAtPrice ? Math.round(p.compareAtPrice - p.price) / 100 : undefined,
    index: opts.index,
    item_list_name: opts.listName,
  };
}

export function pushEvent(event: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  // очищення попереднього ecommerce-об'єкта (рекомендація GA4)
  if ("ecommerce" in params) {
    window.dataLayer.push({ ecommerce: null });
  }
  window.dataLayer.push({ event, ...params });
}

export function pushEcommerce(
  event:
    | "view_item_list" | "select_item" | "view_item" | "add_to_wishlist"
    | "add_to_cart" | "remove_from_cart" | "view_cart" | "begin_checkout"
    | "add_shipping_info" | "add_payment_info" | "purchase"
    | "view_promotion" | "select_promotion",
  ecommerce: Record<string, unknown>,
): void {
  pushEvent(event, { ecommerce: { currency: "UAH", ...ecommerce } });
}

/** Мікроконверсії (цілі PPC): розмірна сітка, quick view, підписка, месенджер */
export function pushMicro(
  action: "size_chart_open" | "quick_view_open" | "newsletter_subscribe" | "messenger_click" | "notify_me",
  params: Record<string, unknown> = {},
): void {
  pushEvent("micro_conversion", { micro_action: action, ...params });
}
