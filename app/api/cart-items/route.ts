import { NextRequest, NextResponse } from "next/server";
import { catalog } from "@/lib/catalog";

/** Деталі позицій кошика для drawer (назва/фото/актуальна ціна з каталогу). */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    lines?: { slug: string; size: string; qty: number }[];
  } | null;
  const lines = Array.isArray(body?.lines) ? body.lines.slice(0, 30) : [];
  const items = [];
  for (const line of lines) {
    if (typeof line?.slug !== "string" || typeof line?.size !== "string") continue;
    const p = await catalog.getProduct(line.slug);
    if (!p) continue;
    items.push({
      slug: p.slug,
      size: line.size,
      qty: Math.max(1, Math.min(10, Number(line.qty) || 1)),
      title: p.title,
      price: p.price,
      image: p.images[0]?.url ?? "",
      alt: p.images[0]?.alt ?? p.title,
    });
  }
  return NextResponse.json({ items });
}
