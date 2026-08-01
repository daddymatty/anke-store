/**
 * Експортує демо-каталог (lib/catalog/seed.ts) у JSON для Medusa-сідера.
 * Запуск з кореня: npx tsx tools/export-seed-json.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { CATEGORY_TREE, PRODUCTS } from "../lib/catalog/seed";

const out = new URL("../medusa/apps/backend/src/scripts/anke-seed-data.json", import.meta.url);
mkdirSync(new URL(".", out), { recursive: true });
writeFileSync(out, JSON.stringify({ categories: CATEGORY_TREE, products: PRODUCTS }, null, 1));
console.log(`✓ ${PRODUCTS.length} товарів, дерево категорій → medusa/apps/backend/src/scripts/anke-seed-data.json`);
