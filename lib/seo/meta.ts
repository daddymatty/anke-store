import type { Metadata } from "next";
import type { CatalogSearchParams } from "@/lib/catalog/url";
import { countActiveFilters, parseCatalogParams } from "@/lib/catalog/url";
import { SITE } from "@/lib/site";

/**
 * SEO-правила фасетної навігації (розділ 4 ТЗ):
 *  - без фільтрів → index, canonical на чистий шлях
 *  - рівно 1 фільтр → index, canonical на себе (з цим фільтром)
 *  - 2+ фільтрів, сортування, page>1, limit — noindex, follow
 * hreflang: uk + x-default (en додається після наповнення).
 */

/** Поки домен — плейсхолдер, увесь сайт лишається noindex (запобіжник). */
export const SITE_INDEXABLE = !SITE.url.includes("example");

export function catalogRobotsAndCanonical(
  pathname: string,
  sp: CatalogSearchParams,
): Pick<Metadata, "robots" | "alternates"> {
  const state = parseCatalogParams(sp);
  const activeFilters = countActiveFilters(state.filters);
  const hasSort = state.sort !== "new";
  const hasPagination = state.page > 1 || state.limit > 24;

  const indexable = SITE_INDEXABLE && activeFilters <= 1 && !hasSort && !hasPagination;

  let canonicalPath = pathname;
  if (activeFilters === 1 && !hasSort && !hasPagination) {
    // canonical на себе разом з єдиним фільтром
    const q = new URLSearchParams();
    const f = state.filters;
    if (f.sizes?.length) q.set("size", f.sizes.join(","));
    if (f.colors?.length) q.set("color", f.colors.join(","));
    if (f.materials?.length) q.set("material", f.materials.join(","));
    if (f.priceMin != null) q.set("price_min", String(f.priceMin));
    if (f.priceMax != null) q.set("price_max", String(f.priceMax));
    if (f.inStockOnly) q.set("instock", "1");
    if (f.onSaleOnly) q.set("sale", "1");
    if (q.size) canonicalPath = `${pathname}?${q}`;
  }

  return {
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
    alternates: {
      canonical: `${SITE.url}${canonicalPath}`,
      languages: hreflangFor(pathname),
    },
  };
}

export function hreflangFor(pathname: string): Record<string, string> {
  // en вмикається додаванням "en" у SITE.locales — розмітка з'явиться автоматично
  const langs: Record<string, string> = {
    uk: `${SITE.url}${pathname}`,
    "x-default": `${SITE.url}${pathname}`,
  };
  if ((SITE.locales as readonly string[]).includes("en")) {
    langs.en = `${SITE.url}/en${pathname}`;
  }
  return langs;
}

export function pageAlternates(pathname: string): Metadata["alternates"] {
  return {
    canonical: `${SITE.url}${pathname}`,
    languages: hreflangFor(pathname),
  };
}
