import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ANKE_CONTENT_MODULE } from "../../../../../modules/anke-content";
import type AnkeContentService from "../../../../../modules/anke-content/service";

/** POST /admin/anke/entries/:id — оновити статус/дані (approve/reject/edit) */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<AnkeContentService>(ANKE_CONTENT_MODULE);
  const id = req.params.id;
  const body = req.body as { status?: string; data?: unknown };
  const patch: Record<string, unknown> = { id };
  if (body.status) patch.status = body.status;
  if (body.data !== undefined) patch.data = body.data;
  const entry = await service.updateContentEntries(patch as never);
  res.json({ entry });
}

/** DELETE /admin/anke/entries/:id */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<AnkeContentService>(ANKE_CONTENT_MODULE);
  await service.deleteContentEntries(req.params.id);
  res.json({ ok: true });
}
