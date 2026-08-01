import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ANKE_CONTENT_MODULE } from "../../../../modules/anke-content";
import type AnkeContentService from "../../../../modules/anke-content/service";

/** GET /store/anke/content?type=banner — схвалений контент (банери головної тощо) */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<AnkeContentService>(ANKE_CONTENT_MODULE);
  const type = String(req.query.type ?? "banner");
  const entries = await service.listContentEntries({ type, status: "approved" });
  res.json({ entries: entries.map((e) => ({ id: e.id, ref: e.ref, data: e.data })) });
}
