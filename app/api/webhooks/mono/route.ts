import { NextRequest, NextResponse } from "next/server";
import { fiscalizeOrder } from "@/lib/integrations/checkbox";
import { verifyMonoWebhook, type MonoWebhookPayload } from "@/lib/integrations/mono";
import { sendTelegram } from "@/lib/integrations/telegram";
import { findOrderByInvoiceId, getOrder, updateOrder } from "@/lib/orders/store";

/**
 * Вебхук Mono Acquiring: підтвердження оплати → статус замовлення →
 * фіскалізація Checkbox (чек на email) → сповіщення адміну.
 */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const valid = await verifyMonoWebhook(raw, req.headers.get("X-Sign"));
  if (!valid) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let payload: MonoWebhookPayload;
  try {
    payload = JSON.parse(raw) as MonoWebhookPayload;
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const order =
    (payload.reference ? await getOrder(payload.reference) : null) ??
    (await findOrderByInvoiceId(payload.invoiceId));
  if (!order) return NextResponse.json({ ok: true }); // невідомий інвойс — ack, щоб не ретраїли

  if (payload.status === "success" && order.payment.status !== "paid") {
    const receiptId = await fiscalizeOrder(order);
    await updateOrder(order.number, {
      status: "processing",
      payment: { ...order.payment, status: "paid", receiptId: receiptId ?? undefined },
    });
    void sendTelegram(`💳 Оплату за <b>${order.number}</b> отримано${receiptId ? ` (чек ${receiptId})` : ""}`);
  } else if (payload.status === "failure" || payload.status === "expired") {
    await updateOrder(order.number, { payment: { ...order.payment, status: "failed" } });
  }

  return NextResponse.json({ ok: true });
}
