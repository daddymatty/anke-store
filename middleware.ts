import { NextRequest, NextResponse } from "next/server";
import { ATTRIBUTION_COOKIE } from "@/lib/cookie-names";

/**
 * Збереження UTM + click id (gclid/fbclid/ttclid) у first-party cookie на 90 днів.
 * Атрибуція потрапляє в замовлення (order.attribution) для CRM.
 * First-touch зберігається, last-touch оновлює тільки click id.
 */

const CAPTURE = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "ttclid"];

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const found: Record<string, string> = {};
  for (const key of CAPTURE) {
    const v = url.searchParams.get(key);
    if (v) found[key] = v.slice(0, 200);
  }
  if (!Object.keys(found).length) return NextResponse.next();

  let existing: Record<string, string> = {};
  try {
    existing = JSON.parse(req.cookies.get(ATTRIBUTION_COOKIE)?.value ?? "{}");
  } catch {
    existing = {};
  }

  // first-touch UTM лишаються; click id оновлюються завжди
  const merged = { ...found, ...existing };
  for (const clickId of ["gclid", "fbclid", "ttclid"]) {
    if (found[clickId]) merged[clickId] = found[clickId];
  }

  const res = NextResponse.next();
  res.cookies.set(ATTRIBUTION_COOKIE, JSON.stringify(merged), {
    maxAge: 90 * 24 * 3600,
    path: "/",
    sameSite: "lax",
    httpOnly: false,
  });
  return res;
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
