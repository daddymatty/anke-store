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
  // TODO(Етап 12): персист у кастомний модуль Medusa зі статусом "pending"
  console.info("[review-submitted]", parsed.data);
  return { ok: true };
}
