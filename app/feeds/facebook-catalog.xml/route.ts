import { facebookCatalogFeed } from "@/lib/feeds";

/** Фід Meta (Facebook/Instagram) catalog. Оновлення щогодини (ISR). */
export const revalidate = 3600;

export async function GET() {
  const xml = await facebookCatalogFeed();
  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
