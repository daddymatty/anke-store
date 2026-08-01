import "server-only";

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CartSummary } from "@/lib/cart/summary";
import type { Order, PlaceOrderInput } from "./types";

/**
 * Персист замовлень.
 * Основне сховище — файлова система (var/orders/*.json): працює скрізь,
 * читається кабінетом і сторінкою «Дякуємо». Дзеркалення в Medusa
 * (щоб замовлення були видимі в адмінці) — best-effort, помилка не валить checkout.
 */

const ORDERS_DIR = path.join(process.cwd(), "var", "orders");

function generateOrderNumber(): string {
  const now = new Date();
  const stamp = now.getTime().toString(36).toUpperCase().slice(-6);
  return `ANKE-${stamp}`;
}

export function buildOrder(input: PlaceOrderInput, cart: CartSummary): Order {
  return {
    number: generateOrderNumber(),
    createdAt: new Date().toISOString(),
    status: "new",
    items: cart.items.map((i) => ({
      slug: i.slug,
      sku: i.sku,
      title: i.title,
      size: i.size,
      qty: i.qty,
      price: i.price,
      image: i.image.url,
    })),
    totals: {
      subtotal: cart.subtotal,
      discount: cart.discount,
      shipping: cart.shipping,
      total: cart.total,
    },
    promo: cart.promo,
    customer: input.customer,
    delivery: input.delivery,
    payment: {
      method: input.paymentMethod,
      status: input.paymentMethod === "cod" ? "cod" : "pending",
    },
    comment: input.comment,
    attribution: input.attribution,
  };
}

export async function saveOrder(order: Order): Promise<void> {
  await mkdir(ORDERS_DIR, { recursive: true });
  await writeFile(path.join(ORDERS_DIR, `${order.number}.json`), JSON.stringify(order, null, 2));
}

export async function getOrder(number: string): Promise<Order | null> {
  if (!/^[A-Z0-9-]{5,40}$/.test(number)) return null;
  try {
    const raw = await readFile(path.join(ORDERS_DIR, `${number}.json`), "utf8");
    return JSON.parse(raw) as Order;
  } catch {
    return null;
  }
}

export async function listOrdersByEmail(email: string): Promise<Order[]> {
  try {
    const files = await readdir(ORDERS_DIR);
    const orders: Order[] = [];
    for (const f of files) {
      if (!f.endsWith(".json")) continue;
      try {
        const o = JSON.parse(await readFile(path.join(ORDERS_DIR, f), "utf8")) as Order;
        if (o.customer.email.toLowerCase() === email.toLowerCase()) orders.push(o);
      } catch {
        // пропускаємо биті файли
      }
    }
    return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

export async function updateOrder(number: string, patch: Partial<Order>): Promise<Order | null> {
  const order = await getOrder(number);
  if (!order) return null;
  const next = { ...order, ...patch, payment: { ...order.payment, ...patch.payment } };
  await saveOrder(next);
  return next;
}

export async function findOrderByInvoiceId(invoiceId: string): Promise<Order | null> {
  try {
    const files = await readdir(ORDERS_DIR);
    for (const f of files) {
      if (!f.endsWith(".json")) continue;
      const o = JSON.parse(await readFile(path.join(ORDERS_DIR, f), "utf8")) as Order;
      if (o.payment.invoiceId === invoiceId) return o;
    }
  } catch {
    // ignore
  }
  return null;
}
