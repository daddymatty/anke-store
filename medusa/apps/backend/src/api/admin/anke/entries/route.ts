import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ANKE_CONTENT_MODULE } from "../../../../modules/anke-content";
import type AnkeContentService from "../../../../modules/anke-content/service";

/** GET /admin/anke/entries?type=&status= — список для адмінки */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<AnkeContentService>(ANKE_CONTENT_MODULE);
  const filters: Record<string, unknown> = {};
  if (req.query.type) filters.type = String(req.query.type);
  if (req.query.status) filters.status = String(req.query.status);
  const entries = await service.listContentEntries(filters, { order: { created_at: "DESC" } });
  res.json({ entries });
}

/** POST /admin/anke/entries — створити запис (банер тощо) */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<AnkeContentService>(ANKE_CONTENT_MODULE);
  const body = req.body as { type?: string; ref?: string; data?: unknown; status?: string };
  if (!body?.type || body?.data === undefined) {
    res.status(400).json({ error: "type і data — обов'язкові" });
    return;
  }
  const entry = await service.createContentEntries({
    type: body.type,
    ref: body.ref ?? null,
    data: body.data as Record<string, unknown>,
    status: body.status ?? "approved",
  });
  res.json({ entry });
}
