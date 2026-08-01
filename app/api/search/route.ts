import { NextRequest, NextResponse } from "next/server";
import { catalog } from "@/lib/catalog";

/** Підказки пошуку для оверлея (клієнт дебаунсить запити). */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (q.trim().length < 2) {
    return NextResponse.json({ items: [] });
  }
  const items = await catalog.searchProducts(q, 6);
  return NextResponse.json(
    {
      items: items.map((p) => ({
        slug: p.slug,
        title: p.title,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        image: p.images[0]?.url ?? null,
        alt: p.images[0]?.alt ?? p.title,
      })),
    },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
  );
}
