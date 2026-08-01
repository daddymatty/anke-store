import "server-only";

import type { Order } from "@/lib/orders/types";
import { priceDecimal } from "@/lib/money";

/**
 * Checkbox ПРРО — фіскалізація онлайн-оплат (чек на email покупця).
 * Без CHECKBOX_LICENSE_KEY/PIN — dev-режим: лог замість чека.
 * Викликається з вебхука Mono після успішної оплати.
 * Docs: https://api.checkbox.ua/api/redoc
 */

const API = "https://api.checkbox.ua/api/v1";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function signIn(): Promise<string | null> {
  const licenseKey = process.env.CHECKBOX_LICENSE_KEY;
  const pin = process.env.CHECKBOX_PIN_CODE;
  if (!licenseKey || !pin) return null;
  if (cachedToken && cachedToken.expiresAt > Math.floor(new Date().getTime() / 1000) + 60) {
    return cachedToken.value;
  }
  const res = await fetch(`${API}/cashier/signinPinCode`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-License-Key": licenseKey,
    },
    body: JSON.stringify({ pin_code: pin }),
  });
  if (!res.ok) throw new Error(`Checkbox signin failed: ${res.status}`);
  const data = (await res.json()) as { access_token: string };
  cachedToken = { value: data.access_token, expiresAt: Math.floor(new Date().getTime() / 1000) + 23 * 3600 };
  return data.access_token;
}

/** Створює фіскальний чек за замовленням. Повертає id чека або null у dev-режимі. */
export async function fiscalizeOrder(order: Order): Promise<string | null> {
  const token = await signIn().catch((e) => {
    console.error("[checkbox] auth error:", e);
    return null;
  });
  if (!token) {
    console.info(`[checkbox:dev] Чек для ${order.number} на ${priceDecimal(order.totals.total)} грн (email: ${order.customer.email})`);
    return null;
  }
  const res = await fetch(`${API}/receipts/sell`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-License-Key": process.env.CHECKBOX_LICENSE_KEY as string,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      goods: order.items.map((i) => ({
        good: { code: i.sku, name: `${i.title}, розмір ${i.size}`, price: i.price },
        quantity: i.qty * 1000, // Checkbox: кількість ×1000
      })),
      payments: [{ type: "CASHLESS", value: order.totals.total, label: "Онлайн-оплата" }],
      delivery: order.customer.email ? { email: order.customer.email } : undefined,
      discounts:
        order.totals.discount > 0
          ? [{ type: "DISCOUNT", mode: "VALUE", value: order.totals.discount, name: order.promo?.code ?? "Знижка" }]
          : undefined,
    }),
  });
  if (!res.ok) {
    console.error(`[checkbox] receipt failed: ${res.status} ${await res.text()}`);
    return null;
  }
  const data = (await res.json()) as { id: string };
  return data.id;
}
