import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * On-demand ревалідація ISR при зміні контенту в адмінці (Medusa webhook / вручну).
 * POST /api/revalidate?secret=...&tag=products|categories|regions
 */
export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const tag = req.nextUrl.searchParams.get("tag") ?? "products";
  if (!["products", "categories", "regions"].includes(tag)) {
    return NextResponse.json({ error: "unknown tag" }, { status: 400 });
  }
  revalidateTag(tag, "max");
  return NextResponse.json({ revalidated: tag });
}
