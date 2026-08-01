import type { CatalogFilters, SortKey } from "./types";

/**
 * URL ↔ стан каталогу.
 * Правила фасетної навігації (розділ 4 ТЗ):
 *  - 1 обраний фільтр → сторінка індексується (canonical на себе)
 *  - 2+ фільтрів, сортування, page>1, пошук → noindex, follow
 */

export type CatalogSearchParams = {
  page?: string;
  limit?: string;
  sort?: string;
  size?: string | string[];
  color?: string | string[];
  material?: string | string[];
  price_min?: string;
  price_max?: string;
  instock?: string;
  sale?: string;
};

const SORT_KEYS: SortKey[] = ["new", "price-asc", "price-desc", "popular"];
export const PER_PAGE = 24;

const asArray = (v?: string | string[]): string[] =>
  v == null ? [] : Array.isArray(v) ? v : v.split(",").filter(Boolean);

const asInt = (v?: string): number | undefined => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined;
};

export type CatalogUrlState = {
  page: number;
  /** limit>perPage — режим «Показати ще» (сторінки 1..N однією стрічкою) */
  limit: number;
  sort: SortKey;
  filters: CatalogFilters;
};

export function parseCatalogParams(sp: CatalogSearchParams): CatalogUrlState {
  const sort = SORT_KEYS.includes(sp.sort as SortKey) ? (sp.sort as SortKey) : "new";
  const filters: CatalogFilters = {
    sizes: asArray(sp.size),
    colors: asArray(sp.color),
    materials: asArray(sp.material),
    priceMin: asInt(sp.price_min),
    priceMax: asInt(sp.price_max),
    inStockOnly: sp.instock === "1",
    onSaleOnly: sp.sale === "1",
  };
  const rawLimit = asInt(sp.limit);
  return {
    page: asInt(sp.page) ?? 1,
    limit: rawLimit && rawLimit > PER_PAGE ? Math.min(rawLimit, 96) : PER_PAGE,
    sort,
    filters,
  };
}

/** Кількість активних фільтрів (для правил індексації і бейджа на кнопці) */
export function countActiveFilters(f: CatalogFilters): number {
  return (
    (f.sizes?.length ?? 0) +
    (f.colors?.length ?? 0) +
    (f.materials?.length ?? 0) +
    (f.priceMin != null || f.priceMax != null ? 1 : 0) +
    (f.inStockOnly ? 1 : 0) +
    (f.onSaleOnly ? 1 : 0)
  );
}

/** Серіалізація стану назад у query-рядок (стабільний порядок ключів) */
export function buildCatalogQuery(state: Partial<CatalogUrlState>): string {
  const q = new URLSearchParams();
  const f = state.filters ?? {};
  if (f.sizes?.length) q.set("size", f.sizes.join(","));
  if (f.colors?.length) q.set("color", f.colors.join(","));
  if (f.materials?.length) q.set("material", f.materials.join(","));
  if (f.priceMin != null) q.set("price_min", String(f.priceMin));
  if (f.priceMax != null) q.set("price_max", String(f.priceMax));
  if (f.inStockOnly) q.set("instock", "1");
  if (f.onSaleOnly) q.set("sale", "1");
  if (state.sort && state.sort !== "new") q.set("sort", state.sort);
  if (state.limit && state.limit > PER_PAGE) q.set("limit", String(state.limit));
  else if (state.page && state.page > 1) q.set("page", String(state.page));
  const s = q.toString();
  return s ? `?${s}` : "";
}
