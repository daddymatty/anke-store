import "server-only";

import type { CartSummary } from "@/lib/cart/summary";
import type { Order } from "./types";

/**
 * Дзеркалення замовлення в Medusa через Store API (cart → complete),
 * щоб воно з'являлось в адмінці. Best-effort: будь-яка помилка лише логується.
 * Потрібні MEDUSA_BACKEND_URL + MEDUSA_PUBLISHABLE_KEY і variantId у розмірів
 * (їх дає MedusaProvider; локальний демо-сід їх не має — тоді дзеркалення пропускається).
 */
export async function mirrorOrderToMedusa(order: Order, cart: CartSummary): Promise<string | null> {
  const base = process.env.MEDUSA_BACKEND_URL?.replace(/\/$/, "");
  const key = process.env.MEDUSA_PUBLISHABLE_KEY;
  if (!base || !key) return null;

  const variantIds = cart.items.map((i) => ({
    variantId: i.card.sizes.find((s) => s.size === i.size)?.variantId,
    qty: i.qty,
  }));
  if (variantIds.some((v) => !v.variantId)) return null;

  const call = async <T>(pathname: string, body?: unknown, method = "POST"): Promise<T> => {
    const res = await fetch(`${base}${pathname}`, {
      method,
      headers: { "content-type": "application/json", "x-publishable-api-key": key },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`${pathname} → ${res.status}: ${await res.text()}`);
    return res.json() as Promise<T>;
  };

  try {
    const { regions } = await call<{ regions: { id: string; currency_code: string }[] }>(
      "/store/regions",
      undefined,
      "GET",
    );
    const region = regions.find((r) => r.currency_code === "uah") ?? regions[0];

    const [firstName, ...rest] = order.customer.name.split(" ");
    const { cart: mcart } = await call<{ cart: { id: string } }>("/store/carts", {
      region_id: region.id,
      email: order.customer.email,
      shipping_address: {
        first_name: firstName || order.customer.name,
        last_name: rest.join(" ") || "-",
        phone: order.customer.phone,
        city: order.delivery.cityName,
        country_code: "ua",
        address_1: order.delivery.warehouseName ?? order.delivery.addressLine ?? "-",
      },
      metadata: {
        anke_number: order.number,
        delivery_method: order.delivery.method,
        payment_method: order.payment.method,
        comment: order.comment ?? "",
      },
    });

    for (const v of variantIds) {
      await call(`/store/carts/${mcart.id}/line-items`, {
        variant_id: v.variantId,
        quantity: v.qty,
      });
    }

    const { shipping_options } = await call<{ shipping_options: { id: string }[] }>(
      `/store/shipping-options?cart_id=${mcart.id}`,
      undefined,
      "GET",
    );
    if (shipping_options[0]) {
      await call(`/store/carts/${mcart.id}/shipping-methods`, { option_id: shipping_options[0].id });
    }

    const { payment_collection } = await call<{ payment_collection: { id: string } }>(
      "/store/payment-collections",
      { cart_id: mcart.id },
    );
    await call(`/store/payment-collections/${payment_collection.id}/payment-sessions`, {
      provider_id: "pp_system_default",
    });

    const completed = await call<{ type: string; order?: { id: string } }>(
      `/store/carts/${mcart.id}/complete`,
    );
    return completed.order?.id ?? null;
  } catch (e) {
    console.error("[medusa-mirror] пропущено:", e instanceof Error ? e.message.slice(0, 300) : e);
    return null;
  }
}
