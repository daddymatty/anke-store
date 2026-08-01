import "server-only";

import crypto from "node:crypto";
import type { Order } from "@/lib/orders/types";
import { priceDecimal } from "@/lib/money";
import { SITE } from "@/lib/site";

/**
 * Meta Conversions API (server-side Purchase).
 * Дедуплікація з браузерним Pixel — через event_id = номер замовлення.
 * Без META_CAPI_ACCESS_TOKEN — dev-лог.
 */

export const sha256 = (v: string) =>
  crypto.createHash("sha256").update(v.trim().toLowerCase()).digest("hex");

export async function sendMetaPurchase(order: Order): Promise<void> {
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(new Date(order.createdAt).getTime() / 1000),
        event_id: order.number,
        action_source: "website",
        event_source_url: `${SITE.url}/dyakuyemo/${order.number}`,
        user_data: {
          em: [sha256(order.customer.email)],
          ph: [sha256(order.customer.phone.replace(/\D/g, ""))],
        },
        custom_data: {
          currency: "UAH",
          value: priceDecimal(order.totals.total),
          content_ids: order.items.map((i) => i.sku),
          content_type: "product",
          num_items: order.items.reduce((a, i) => a + i.qty, 0),
        },
      },
    ],
  };
  if (!pixelId || !token) {
    console.info(`[meta-capi:dev] Purchase ${order.number} на ${priceDecimal(order.totals.total)} грн`);
    return;
  }
  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${token}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) console.error("[meta-capi] failed:", res.status, await res.text());
  } catch (e) {
    console.error("[meta-capi] error:", e);
  }
}
