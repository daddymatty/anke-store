import { googleMerchantFeed } from "@/lib/feeds";

/** Фід для Performance Max: + custom labels (маржа / сезон / розпродаж). */
export const revalidate = 3600;

export async function GET() {
  const xml = await googleMerchantFeed(true);
  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
