import "server-only";

import crypto from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Легка автентифікація без пароля: email + одноразовий код (OTP).
 * Сесія — HMAC-підписаний cookie. Без зовнішніх залежностей і БД:
 * OTP лежать у var/otp (TTL 10 хв), профілі — var/profiles.
 */

const OTP_DIR = path.join(process.cwd(), "var", "otp");
const OTP_TTL_MS = 10 * 60 * 1000;

function secret(): string {
  return process.env.SESSION_SECRET ?? "anke-dev-secret-change-me";
}

const emailKey = (email: string) =>
  crypto.createHash("sha256").update(email.toLowerCase()).digest("hex").slice(0, 32);

export async function createOtp(email: string): Promise<string> {
  const code = crypto.randomInt(100000, 999999).toString();
  await mkdir(OTP_DIR, { recursive: true });
  await writeFile(
    path.join(OTP_DIR, `${emailKey(email)}.json`),
    JSON.stringify({ code, email: email.toLowerCase(), expiresAt: new Date().getTime() + OTP_TTL_MS }),
  );
  return code;
}

export async function consumeOtp(email: string, code: string): Promise<boolean> {
  const file = path.join(OTP_DIR, `${emailKey(email)}.json`);
  try {
    const data = JSON.parse(await readFile(file, "utf8")) as {
      code: string;
      email: string;
      expiresAt: number;
    };
    const valid =
      data.code === code.trim() &&
      data.email === email.toLowerCase() &&
      data.expiresAt > new Date().getTime();
    if (valid) await unlink(file).catch(() => {});
    return valid;
  } catch {
    return false;
  }
}

/** Підписаний токен сесії: base64url(email|exp).hmac */
export function signSession(email: string, days = 90): string {
  const exp = new Date().getTime() + days * 24 * 3600 * 1000;
  const payload = Buffer.from(`${email.toLowerCase()}|${exp}`).toString("base64url");
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySession(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const [email, expRaw] = Buffer.from(payload, "base64url").toString("utf8").split("|");
  if (!email || Number(expRaw) < new Date().getTime()) return null;
  return email;
}
