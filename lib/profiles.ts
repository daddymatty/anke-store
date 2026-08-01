import "server-only";

import crypto from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/** Профіль покупця (дані, адреса за замовчуванням, сегменти розсилки). */

export type NewsletterSegment = "novynky" | "znyzhky" | "styling";

export type Profile = {
  email: string;
  name?: string;
  phone?: string;
  defaultCity?: string;
  defaultWarehouse?: string;
  newsletter: NewsletterSegment[];
};

const DIR = path.join(process.cwd(), "var", "profiles");

const fileFor = (email: string) =>
  path.join(DIR, `${crypto.createHash("sha256").update(email.toLowerCase()).digest("hex").slice(0, 32)}.json`);

export async function getProfile(email: string): Promise<Profile> {
  try {
    return JSON.parse(await readFile(fileFor(email), "utf8")) as Profile;
  } catch {
    return { email: email.toLowerCase(), newsletter: [] };
  }
}

export async function saveProfile(profile: Profile): Promise<void> {
  await mkdir(DIR, { recursive: true });
  await writeFile(fileFor(profile.email), JSON.stringify(profile, null, 2));
}
