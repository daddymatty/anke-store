import { LocalProvider } from "./local";
import { MedusaProvider } from "./medusa";
import type { CatalogProvider } from "./provider";

/**
 * Точка входу каталогу.
 * MEDUSA_BACKEND_URL + MEDUSA_PUBLISHABLE_KEY задані → Medusa (продакшн),
 * інакше — локальний демо-сід (розробка без інфраструктури).
 */
function createProvider(): CatalogProvider {
  const url = process.env.MEDUSA_BACKEND_URL;
  const key = process.env.MEDUSA_PUBLISHABLE_KEY;
  if (url && key) {
    return new MedusaProvider(url, key);
  }
  return new LocalProvider();
}

export const catalog: CatalogProvider = createProvider();

export type * from "./types";
