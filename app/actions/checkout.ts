"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { clearCart, getCartLines } from "@/app/actions/cart";
import { resolveCart } from "@/lib/cart/summary";
import { createInvoice } from "@/lib/integrations/mono";
import { sendOrderConfirmation } from "@/lib/integrations/email";
import { sendTelegram } from "@/lib/integrations/telegram";
import { mirrorOrderToMedusa } from "@/lib/orders/medusa-mirror";
import { buildOrder, saveOrder, updateOrder } from "@/lib/orders/store";
import { formatPrice } from "@/lib/money";
import { validatePromo } from "@/lib/promo";

/** Оформлення замовлення: валідація → замовлення → (Mono-інвойс) → сповіщення. */

const PROMO_COOKIE = "anke_promo";

const phoneRegex = /^\+380\d{9}$/;

const checkoutSchema = z
  .object({
    name: z.string().min(5, "Вкажіть прізвище та ім'я").max(120),
    phone: z.string().regex(phoneRegex, "Телефон у форматі +380XXXXXXXXX"),
    email: z.email("Вкажіть коректний email"),
    deliveryMethod: z.enum(["np-warehouse", "np-postomat", "np-address"]),
    cityName: z.string().min(2, "Оберіть місто"),
    cityRef: z.string().optional(),
    warehouseName: z.string().optional(),
    warehouseRef: z.string().optional(),
    addressLine: z.string().optional(),
    paymentMethod: z.enum(["online", "installments", "cod"]),
    comment: z.string().max(500).optional(),
    promoCode: z.string().max(30).optional(),
  })
  .check((ctx) => {
    const v = ctx.value;
    if (v.deliveryMethod !== "np-address" && !v.warehouseName) {
      ctx.issues.push({ code: "custom", message: "Оберіть відділення чи поштомат", path: ["warehouseName"], input: v.warehouseName });
    }
    if (v.deliveryMethod === "np-address" && !v.addressLine?.trim()) {
      ctx.issues.push({ code: "custom", message: "Вкажіть адресу доставки", path: ["addressLine"], input: v.addressLine });
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export type PlaceOrderResult =
  | { ok: true; redirect: string }
  | { ok: false; error: string };

export async function placeOrder(input: CheckoutInput): Promise<PlaceOrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Перевірте дані форми" };
  }
  const data = parsed.data;

  const lines = await getCartLines();
  if (!lines.length) return { ok: false, error: "Кошик порожній" };
  const cart = await resolveCart(lines, data.promoCode ?? null);
  if (!cart.items.length) return { ok: false, error: "Кошик порожній" };
  const unavailable = cart.items.find((i) => !i.inStock);
  if (unavailable) {
    return { ok: false, error: `«${unavailable.title}» (${unavailable.size}) вже розкупили — приберіть з кошика` };
  }

  const order = buildOrder(
    {
      customer: { name: data.name, phone: data.phone, email: data.email },
      delivery: {
        method: data.deliveryMethod,
        cityName: data.cityName,
        cityRef: data.cityRef,
        warehouseName: data.warehouseName,
        warehouseRef: data.warehouseRef,
        addressLine: data.addressLine,
      },
      paymentMethod: data.paymentMethod,
      comment: data.comment,
      promoCode: data.promoCode,
    },
    cart,
  );

  await saveOrder(order);

  // Дзеркало в Medusa (для адмінки) — не блокує
  mirrorOrderToMedusa(order, cart).then((id) => {
    if (id) void updateOrder(order.number, { medusaOrderId: id });
  });

  // Сповіщення (fire-and-forget)
  void sendTelegram(
    `🛍 <b>Нове замовлення ${order.number}</b>\n` +
      order.items.map((i) => `• ${i.title}, ${i.size} × ${i.qty}`).join("\n") +
      `\nРазом: <b>${formatPrice(order.totals.total)}</b>\n${order.customer.name}, ${order.customer.phone}\n` +
      `${order.delivery.cityName}, ${order.delivery.warehouseName ?? order.delivery.addressLine ?? ""}\nОплата: ${order.payment.method}`,
  );
  void sendOrderConfirmation(order);

  if (data.paymentMethod === "online" || data.paymentMethod === "installments") {
    try {
      const invoice = await createInvoice({
        amountKop: order.totals.total,
        orderNumber: order.number,
        destination: `Оплата замовлення ${order.number} — ANKE`,
        customerEmail: order.customer.email,
        paymentType: data.paymentMethod === "installments" ? "installments" : "debit",
      });
      await updateOrder(order.number, { payment: { ...order.payment, invoiceId: invoice.invoiceId } });
      await clearCart();
      return { ok: true, redirect: invoice.pageUrl };
    } catch (e) {
      console.error("[checkout] mono invoice failed:", e);
      // Замовлення вже збережене — ведемо на «Дякуємо», оплата рахунком/при отриманні
      await clearCart();
      return { ok: true, redirect: `/dyakuyemo/${order.number}?pay=failed` };
    }
  }

  await clearCart();
  return { ok: true, redirect: `/dyakuyemo/${order.number}` };
}

/** Перевірка промокода з форми checkout: повертає нові тотали. */
export async function applyPromo(code: string): Promise<
  | { ok: true; label: string; discount: number; freeShipping: boolean; total: number }
  | { ok: false; error: string }
> {
  const lines = await getCartLines();
  const cart = await resolveCart(lines);
  const promo = validatePromo(code, cart.subtotal);
  if (!promo) return { ok: false, error: "Промокод не знайдено або умови не виконані" };
  const store = await cookies();
  store.set(PROMO_COOKIE, promo.code, { maxAge: 3600 * 24, path: "/", sameSite: "lax", httpOnly: false });
  const withPromo = await resolveCart(lines, promo.code);
  return {
    ok: true,
    label: promo.label,
    discount: withPromo.discount,
    freeShipping: promo.freeShipping,
    total: withPromo.total,
  };
}
