"use client";

import { useEffect, useRef } from "react";
import { pushEcommerce, pushEvent, toGa4Item, type Ga4Item } from "@/lib/analytics";
import type { ProductCard } from "@/lib/catalog/types";

/** Декларативні трекери GA4-подій: рендеряться в серверних сторінках, нічого не малюють. */

export function ViewItemListTracker({ items, listName }: { items: ProductCard[]; listName: string }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current || !items.length) return;
    sent.current = true;
    pushEcommerce("view_item_list", {
      item_list_name: listName,
      items: items.map((p, i) => toGa4Item(p, { index: i, listName })),
    });
  }, [items, listName]);
  return null;
}

export function ViewItemTracker({ item, value }: { item: Ga4Item; value: number }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    pushEcommerce("view_item", { value, items: [item] });
  }, [item, value]);
  return null;
}

export function BeginCheckoutTracker({ items, value }: { items: Ga4Item[]; value: number }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    pushEcommerce("begin_checkout", { value, items });
  }, [items, value]);
  return null;
}

export function SearchTracker({ query, results }: { query: string; results: number }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current || !query) return;
    sent.current = true;
    pushEvent("search", { search_term: query, search_results: results });
  }, [query, results]);
  return null;
}

/**
 * purchase — з дедуплікацією по transaction_id (localStorage),
 * щоб перезавантаження «Дякуємо» не подвоювало конверсію.
 * user_data (хешовані email/телефон) — для Enhanced Conversions,
 * event_id = номер замовлення — для дедуплікації з Meta CAPI.
 */
export function PurchaseTracker({
  orderNumber,
  value,
  shipping,
  coupon,
  items,
  hashedEmail,
  hashedPhone,
}: {
  orderNumber: string;
  value: number;
  shipping: number;
  coupon?: string;
  items: Ga4Item[];
  hashedEmail: string;
  hashedPhone: string;
}) {
  useEffect(() => {
    const key = `anke_purchase_${orderNumber}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {
      // приватний режим — надішлемо без дедупу
    }
    pushEcommerce("purchase", {
      transaction_id: orderNumber,
      value,
      tax: 0,
      shipping,
      coupon,
      items,
    });
    pushEvent("purchase_meta", {
      event_id: orderNumber,
      user_data: { sha256_email_address: hashedEmail, sha256_phone_number: hashedPhone },
    });
  }, [orderNumber, value, shipping, coupon, items, hashedEmail, hashedPhone]);
  return null;
}
