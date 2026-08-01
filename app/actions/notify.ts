"use server";

import { z } from "zod";

/**
 * «Повідомити про надходження»: підписка на розмір, якого немає.
 * Зберігання і транзакційний лист підключаються на Етапі 6 (SMTP)
 * — контракт екшена вже фінальний.
 */

const schema = z.object({
  slug: z.string().min(1),
  size: z.string().min(1),
  email: z.email("Вкажіть коректний email"),
});

export type NotifyResult = { ok: true } | { ok: false; error: string };

export async function notifyWhenAvailable(input: {
  slug: string;
  size: string;
  email: string;
}): Promise<NotifyResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Невірні дані" };
  }
  // TODO(Етап 6): персист у БД + лист-підтвердження; поки що лог для розробки
  console.info("[notify-when-available]", parsed.data);
  return { ok: true };
}
