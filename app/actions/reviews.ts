"use server";

import { z } from "zod";

/**
 * Відгук про товар. Потрапляє в чергу модерації (адмінка, Етап 12);
 * на сайті з'являється лише після схвалення.
 */

const schema = z.object({
  slug: z.string().min(1),
  author: z.string().min(2, "Вкажіть ім'я").max(60),
  rating: z.number().int().min(1).max(5),
  text: z.string().min(10, "Відгук закороткий — напишіть хоча б речення").max(2000),
});

export type ReviewResult = { ok: true } | { ok: false; error: string };

export async function submitReview(input: {
  slug: string;
  author: string;
  rating: number;
  text: string;
}): Promise<ReviewResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Невірні дані" };
  }
  const base = process.env.MEDUSA_BACKEND_URL?.replace(/\/$/, "");
  const key = process.env.MEDUSA_PUBLISHABLE_KEY;
  if (base && key) {
    try {
      const res = await fetch(`${base}/store/anke/reviews`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-publishable-api-key": key },
        body: JSON.stringify({
          handle: parsed.data.slug,
          author: parsed.data.author,
          rating: parsed.data.rating,
          text: parsed.data.text,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      return { ok: true };
    } catch (e) {
      console.error("[review-submit] medusa error:", e);
      return { ok: false, error: "Не вдалося надіслати відгук — спробуйте пізніше" };
    }
  }
  // Без Medusa (локальний режим) — лог
  console.info("[review-submitted:dev]", parsed.data);
  return { ok: true };
}
