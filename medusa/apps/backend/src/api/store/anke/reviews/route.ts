import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ANKE_CONTENT_MODULE } from "../../../../modules/anke-content";
import type AnkeContentService from "../../../../modules/anke-content/service";

/** GET /store/anke/reviews?handle=... — схвалені відгуки товару */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<AnkeContentService>(ANKE_CONTENT_MODULE);
  const handle = String(req.query.handle ?? "");
  if (!handle) {
    res.json({ reviews: [] });
    return;
  }
  const entries = await service.listContentEntries({ type: "review", ref: handle, status: "approved" });
  res.json({
    reviews: entries.map((e) => ({ id: e.id, ...(e.data as Record<string, unknown>) })),
  });
}

/** POST /store/anke/reviews — новий відгук у чергу модерації */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<AnkeContentService>(ANKE_CONTENT_MODULE);
  const body = req.body as { handle?: string; author?: string; rating?: number; text?: string };
  if (!body?.handle || !body?.author || !body?.text || !body?.rating) {
    res.status(400).json({ error: "handle, author, rating, text — обов'язкові" });
    return;
  }
  const rating = Math.max(1, Math.min(5, Math.round(Number(body.rating))));
  await service.createContentEntries({
    type: "review",
    ref: body.handle,
    status: "pending",
    data: {
      author: String(body.author).slice(0, 60),
      rating,
      text: String(body.text).slice(0, 2000),
      date: new Date().toISOString().slice(0, 10),
    },
  });
  res.json({ ok: true });
}
