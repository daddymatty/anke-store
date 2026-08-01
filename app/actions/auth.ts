"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { consumeOtp, createOtp, signSession, verifySession } from "@/lib/auth";
import { getProfile, saveProfile, type NewsletterSegment, type Profile } from "@/lib/profiles";
import { sendTelegram } from "@/lib/integrations/telegram";

const SESSION_COOKIE = "anke_session";

export async function currentUserEmail(): Promise<string | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

export async function requestLoginCode(emailRaw: string): Promise<{ ok: boolean; error?: string; devCode?: string }> {
  const parsed = z.email().safeParse(emailRaw.trim());
  if (!parsed.success) return { ok: false, error: "Вкажіть коректний email" };
  const code = await createOtp(parsed.data);
  // TODO: лист з кодом через SMTP (lib/integrations/email); без SMTP — dev-режим
  if (!process.env.SMTP_HOST) {
    console.info(`[auth:dev] Код для ${parsed.data}: ${code}`);
    return { ok: true, devCode: code };
  }
  const { default: nodemailer } = await import("nodemailer");
  const t = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
  });
  await t.sendMail({
    from: `"ANKE" <${process.env.SMTP_USER}>`,
    to: parsed.data,
    subject: "Ваш код входу в ANKE",
    text: `Код для входу: ${code}. Дійсний 10 хвилин.`,
  });
  return { ok: true };
}

export async function verifyLoginCode(email: string, code: string): Promise<{ ok: boolean; error?: string }> {
  const valid = await consumeOtp(email, code);
  if (!valid) return { ok: false, error: "Невірний або протермінований код" };
  const store = await cookies();
  store.set(SESSION_COOKIE, signSession(email), {
    maxAge: 90 * 24 * 3600,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });
  return { ok: true };
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

const profileSchema = z.object({
  name: z.string().max(120).optional(),
  phone: z
    .string()
    .regex(/^\+380\d{9}$/, "Телефон у форматі +380XXXXXXXXX")
    .optional()
    .or(z.literal("")),
  defaultCity: z.string().max(80).optional(),
  defaultWarehouse: z.string().max(200).optional(),
});

export async function updateProfile(input: {
  name?: string;
  phone?: string;
  defaultCity?: string;
  defaultWarehouse?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const email = await currentUserEmail();
  if (!email) return { ok: false, error: "Сесія завершилась — увійдіть знову" };
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Невірні дані" };
  const profile = await getProfile(email);
  const next: Profile = {
    ...profile,
    ...parsed.data,
    phone: parsed.data.phone || undefined,
  };
  await saveProfile(next);
  return { ok: true };
}

export async function updateNewsletter(segments: NewsletterSegment[]): Promise<{ ok: boolean }> {
  const email = await currentUserEmail();
  if (!email) return { ok: false };
  const profile = await getProfile(email);
  const allowed: NewsletterSegment[] = ["novynky", "znyzhky", "styling"];
  profile.newsletter = segments.filter((s) => allowed.includes(s));
  await saveProfile(profile);
  void sendTelegram(`📬 Підписка оновлена: ${email} → ${profile.newsletter.join(", ") || "відписка"}`);
  return { ok: true };
}

/** Підписка з футера/попапів без кабінета */
export async function subscribeGuest(emailRaw: string, segments: NewsletterSegment[]): Promise<{ ok: boolean; error?: string }> {
  const parsed = z.email().safeParse(emailRaw.trim());
  if (!parsed.success) return { ok: false, error: "Вкажіть коректний email" };
  const profile = await getProfile(parsed.data);
  const allowed: NewsletterSegment[] = ["novynky", "znyzhky", "styling"];
  profile.newsletter = segments.filter((s) => allowed.includes(s));
  await saveProfile(profile);
  void sendTelegram(`📬 Нова підписка: ${parsed.data} → ${profile.newsletter.join(", ")}`);
  return { ok: true };
}
