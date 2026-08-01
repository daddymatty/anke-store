import "server-only";

import crypto from "node:crypto";
import { SITE } from "@/lib/site";

/**
 * Mono Acquiring (Інтернет-еквайринг monobank).
 * Без MONO_ACQUIRING_TOKEN — sandbox: повертає редирект одразу на «Дякуємо»
 * з міткою тестової оплати. Контракт createInvoice/webhook — фінальний.
 * Docs: https://monobank.ua/api-docs/acquiring
 */

const API = "https://api.monobank.ua";

export type MonoInvoice = { invoiceId: string; pageUrl: string };

export async function createInvoice(params: {
  amountKop: number;
  orderNumber: string;
  destination: string;
  customerEmail?: string;
  /** Оплата частинами від mono */
  paymentType?: "debit" | "installments";
}): Promise<MonoInvoice> {
  const token = process.env.MONO_ACQUIRING_TOKEN;
  if (!token) {
    // Sandbox-режим для розробки без мерчанта
    return {
      invoiceId: `dev-${params.orderNumber}`,
      pageUrl: `${SITE.url}/dyakuyemo/${params.orderNumber}?dev_paid=1`,
    };
  }
  const res = await fetch(`${API}/api/merchant/invoice/create`, {
    method: "POST",
    headers: { "X-Token": token, "content-type": "application/json" },
    body: JSON.stringify({
      amount: params.amountKop,
      ccy: 980, // UAH
      merchantPaymInfo: {
        reference: params.orderNumber,
        destination: params.destination,
        comment: params.destination,
      },
      redirectUrl: `${SITE.url}/dyakuyemo/${params.orderNumber}`,
      webHookUrl: `${SITE.url}/api/webhooks/mono`,
      validity: 3600 * 24,
      paymentType: params.paymentType === "installments" ? "debit" : "debit",
    }),
  });
  if (!res.ok) {
    throw new Error(`Mono invoice failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as MonoInvoice;
}

let cachedPubKey: string | null = null;

/** Перевірка підпису вебхука (X-Sign, ECDSA-SHA256, base64) */
export async function verifyMonoWebhook(rawBody: string, xSign: string | null): Promise<boolean> {
  const token = process.env.MONO_ACQUIRING_TOKEN;
  if (!token) return true; // sandbox
  if (!xSign) return false;
  if (!cachedPubKey) {
    const res = await fetch(`${API}/api/merchant/pubkey`, { headers: { "X-Token": token } });
    if (!res.ok) return false;
    const data = (await res.json()) as { key: string };
    cachedPubKey = Buffer.from(data.key, "base64").toString("utf8");
  }
  try {
    const verify = crypto.createVerify("SHA256");
    verify.update(rawBody);
    verify.end();
    return verify.verify(cachedPubKey, Buffer.from(xSign, "base64"));
  } catch {
    return false;
  }
}

export type MonoWebhookPayload = {
  invoiceId: string;
  status: "created" | "processing" | "hold" | "success" | "failure" | "reversed" | "expired";
  reference?: string;
  amount?: number;
};
