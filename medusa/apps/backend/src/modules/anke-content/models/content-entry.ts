import { model } from "@medusajs/framework/utils";

/**
 * Універсальний контент-запис ANKE:
 *  - type "review": відгук про товар (ref = handle товару, data = {author, rating, text, date})
 *  - type "banner": банер головної (data = {title, subtitle, image, href, cta})
 *  - type "blog":   чернетка статті (data = структура BlogArticle)
 * status: pending → approved (модерація в адмінці) | rejected
 */
export const ContentEntry = model.define("anke_content_entry", {
  id: model.id({ prefix: "ance" }).primaryKey(),
  type: model.text(),
  ref: model.text().nullable(),
  data: model.json(),
  status: model.text().default("pending"),
});
