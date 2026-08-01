import Link from "next/link";
import type { CatalogUrlState } from "@/lib/catalog/url";
import { PER_PAGE, buildCatalogQuery } from "@/lib/catalog/url";

type Props = {
  basePath: string;
  state: CatalogUrlState;
  total: number;
  shown: number;
  totalPages: number;
};

/**
 * Пагінація сторінками (?page=N) + «Показати ще» (?limit=N — сторінки 1..N стрічкою).
 * Обидва стани живуть в URL — жодного infinite scroll без URL (вимога ТЗ).
 */
export function Pagination({ basePath, state, total, shown, totalPages }: Props) {
  const currentPage = state.limit > PER_PAGE ? 1 : state.page;
  const canShowMore = shown < total;

  const pageHref = (page: number) =>
    `${basePath}${buildCatalogQuery({ ...state, page, limit: PER_PAGE })}`;
  const showMoreHref = `${basePath}${buildCatalogQuery({
    ...state,
    page: 1,
    limit: Math.min(shown + PER_PAGE, 96 + PER_PAGE * 100),
  })}`;

  if (total <= PER_PAGE) return null;

  return (
    <div className="mt-12 flex flex-col items-center gap-6">
      {canShowMore && (
        <Link
          href={showMoreHref}
          scroll={false}
          className="border border-ink px-10 py-3 text-[13px] font-medium uppercase tracking-[0.14em] transition-colors hover:bg-ink hover:text-paper"
        >
          Показати ще ({total - shown})
        </Link>
      )}
      <nav aria-label="Сторінки каталогу">
        <ul className="flex items-center gap-1.5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <li key={p}>
              {p === currentPage && state.limit === PER_PAGE ? (
                <span aria-current="page" className="flex h-9 w-9 items-center justify-center bg-ink text-[13px] text-paper">
                  {p}
                </span>
              ) : (
                <Link
                  href={pageHref(p)}
                  className="flex h-9 w-9 items-center justify-center border border-line text-[13px] transition-colors hover:border-ink"
                >
                  {p}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
