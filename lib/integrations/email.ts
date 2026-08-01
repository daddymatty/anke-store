import "server-only";

import nodemailer from "nodemailer";
import { formatPrice } from "@/lib/money";
import type { Order } from "@/lib/orders/types";
import { SITE } from "@/lib/site";

/** Транзакційні листи через SMTP. Без SMTP_* — лог у консоль. */

function transport() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });
}

const PAYMENT_LABEL: Record<Order["payment"]["method"], string> = {
  online: "Оплата онлайн",
  installments: "Оплата частинами",
  cod: "Накладений платіж",
};

export function orderEmailHtml(order: Order): string {
  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #E5E0D8">${i.title}, ${i.size} × ${i.qty}</td><td align="right" style="padding:8px 0;border-bottom:1px solid #E5E0D8">${formatPrice(i.price * i.qty)}</td></tr>`,
    )
    .join("");
  return `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#141414">
    <h1 style="font-family:Georgia,serif;font-weight:300;letter-spacing:0.2em">ANKE</h1>
    <p>Дякуємо за замовлення <b>${order.number}</b>! Ми вже його збираємо.</p>
    <table width="100%" style="border-collapse:collapse;font-size:14px">${rows}</table>
    <table width="100%" style="font-size:14px;margin-top:12px">
      ${order.totals.discount ? `<tr><td>Знижка${order.promo ? ` (${order.promo.code})` : ""}</td><td align="right">−${formatPrice(order.totals.discount)}</td></tr>` : ""}
      <tr><td>Доставка</td><td align="right">${order.totals.shipping === 0 ? "Безкоштовно" : "за тарифами перевізника"}</td></tr>
      <tr><td style="padding-top:8px"><b>Разом</b></td><td align="right" style="padding-top:8px"><b>${formatPrice(order.totals.total)}</b></td></tr>
    </table>
    <p style="font-size:14px">Доставка: ${order.delivery.cityName}, ${order.delivery.warehouseName ?? order.delivery.addressLine ?? ""}<br>
    Оплата: ${PAYMENT_LABEL[order.payment.method]}</p>
    <p style="font-size:12px;color:#6B6459">Питання? Відповідайте на цей лист або пишіть у Telegram ${SITE.contacts.telegram}</p>
  </div>`;
}

export async function sendOrderConfirmation(order: Order): Promise<void> {
  const t = transport();
  const subject = `ANKE: замовлення ${order.number} прийнято`;
  if (!t) {
    console.info(`[email:dev] → ${order.customer.email}: ${subject}`);
    return;
  }
  try {
    await t.sendMail({
      from: `"ANKE" <${process.env.SMTP_USER}>`,
      to: order.customer.email,
      bcc: process.env.ADMIN_EMAIL || undefined,
      subject,
      html: orderEmailHtml(order),
    });
  } catch (e) {
    console.error("[email] send failed:", e);
  }
}
