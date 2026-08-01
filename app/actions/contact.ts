"use server";

import { z } from "zod";
import { sendTelegram } from "@/lib/integrations/telegram";

/** Форма звернення споживача (сторінка «Контакти», вимога розділу 8 ТЗ). */

const schema = z.object({
  name: z.string().min(2, "Вкажіть ім'я").max(120),
  contact: z.string().min(5, "Вкажіть телефон або email").max(120),
  message: z.string().min(10, "Опишіть звернення докладніше").max(2000),
});

export async function submitContact(input: {
  name: string;
  contact: string;
  message: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Перевірте форму" };
  }
  await sendTelegram(
    `✉️ <b>Звернення з сайту</b>\n${parsed.data.name} (${parsed.data.contact})\n\n${parsed.data.message}`,
  );
  return { ok: true };
}
