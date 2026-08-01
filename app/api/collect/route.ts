import { NextRequest, NextResponse } from "next/server";

/**
 * Заготовка server-side GTM: перший обробник first-party збору.
 * Коли розгорнеться sGTM-контейнер — постав SGTM_URL, і події
 * почнуть проксіюватися туди без змін на клієнті.
 */
export async function POST(req: NextRequest) {
  const sgtm = process.env.SGTM_URL;
  const body = await req.text();
  if (!sgtm) {
    // контейнера ще немає — приймаємо і мовчки підтверджуємо
    return new NextResponse(null, { status: 204 });
  }
  try {
    const res = await fetch(`${sgtm.replace(/\/$/, "")}/collect`, {
      method: "POST",
      headers: {
        "content-type": req.headers.get("content-type") ?? "application/json",
        "x-forwarded-for": req.headers.get("x-forwarded-for") ?? "",
        "user-agent": req.headers.get("user-agent") ?? "",
      },
      body,
    });
    return new NextResponse(null, { status: res.ok ? 204 : 502 });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
