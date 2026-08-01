import Link from "next/link";
import { catalog } from "@/lib/catalog";
import type { CatalogFilters, CategoryNode } from "@/lib/catalog/types";
import { PER_PAGE, parseCatalogParams, type CatalogSearchParams } from "@/lib/catalog/url";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";
import { FiltersPanel } from "./FiltersPanel";
import { Pagination } from "./Pagination";
import { ProductGrid } from "./ProductGrid";
import { SortSelect } from "./SortSelect";

type Props = {
  title: string;
  description?: string;
  seoText?: string;
  breadcrumbs: Crumb[];
  basePath: string;
  categoryPath?: string[];
  /** Примусові фільтри сторінки (напр. SALE, Новинки) — не відображаються в UI */
  forcedFilters?: Partial<CatalogFilters>;
  subcategories?: CategoryNode[];
  searchParams: CatalogSearchParams;
};

/** Спільний лістинг для категорій, /novynky і /sale. */
export async function CatalogView({
  title,
  description,
  seoText,
  breadcrumbs,
  basePath,
  categoryPath,
  forcedFilters,
  subcategories,
  searchParams,
}: Props) {
  const state = parseCatalogParams(searchParams);
  const merged = { ...state.filters, ...forcedFilters };
  const showMoreMode = state.limit > PER_PAGE;

  const result = await catalog.listProducts({
    categoryPath,
    filters: merged,
    sort: state.sort,
    page: showMoreMode ? 1 : state.page,
    perPage: showMoreMode ? state.limit : PER_PAGE,
  });

  return (
    <Container className="py-6 md:py-10">
      <Breadcrumbs items={breadcrumbs} />

      <header className="mt-5">
        <h1 className="font-display text-display-sm font-light md:text-display">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-[14px] text-muted">{description}</p>}
      </header>

      {subcategories && subcategories.length > 0 && (
        <nav aria-label="Підкатегорії" className="mt-6">
          <ul className="flex flex-wrap gap-2">
            {subcategories.map((sc) => (
              <li key={sc.id}>
                <Link
                  href={`/${sc.path.join("/")}`}
                  className="block border border-line px-4 py-2 text-[13px] transition-colors hover:border-ink"
                >
                  {sc.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="mt-8 flex items-center justify-between gap-4 border-y border-line py-3">
        <p className="text-[13px] text-muted">
          {result.total}{" "}
          {result.total % 10 === 1 && result.total % 100 !== 11
            ? "товар"
            : [2, 3, 4].includes(result.total % 10) && ![12, 13, 14].includes(result.total % 100)
              ? "товари"
              : "товарів"}
        </p>
        <div className="flex items-center gap-4">
          <div className="lg:hidden">
            <FiltersPanel facets={result.facets} active={state.filters} />
          </div>
          <SortSelect current={state.sort} />
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block" aria-label="Фільтри">
          <FiltersPanel facets={result.facets} active={state.filters} />
        </aside>

        <div>
          <ProductGrid items={result.items} priorityCount={2} />
          <Pagination
            basePath={basePath}
            state={{ ...state, filters: state.filters }}
            total={result.total}
            shown={result.items.length + (showMoreMode ? 0 : (state.page - 1) * PER_PAGE)}
            totalPages={result.totalPages}
          />
        </div>
      </div>

      {seoText && (
        <section className="mt-16 max-w-3xl border-t border-line pt-10" aria-label="Про категорію">
          <div className="space-y-3 text-[14px] leading-relaxed text-muted">
            {seoText.split("\n\n").map((par, i) => (
              <p key={i}>{par}</p>
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
