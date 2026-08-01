import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Container } from "@/components/ui/Container";
import { catalog } from "@/lib/catalog";

/** Сторінка результатів пошуку. Завжди noindex, follow (розділ 4 ТЗ). */

export const metadata: Metadata = {
  title: "Пошук",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const results = query.length >= 2 ? await catalog.searchProducts(query, 48) : [];
  const fallback = results.length === 0 ? await catalog.getNewArrivals(8) : [];

  return (
    <Container className="py-6 md:py-10">
      <Breadcrumbs items={[{ title: "Пошук", href: "/poshuk" }]} />
      <h1 className="mt-5 font-display text-display-sm font-light md:text-display">
        {query ? `Результати за «${query}»` : "Пошук"}
      </h1>
      {results.length > 0 ? (
        <>
          <p className="mt-2 text-[13px] text-muted">Знайдено: {results.length}</p>
          <div className="mt-8">
            <ProductGrid items={results} />
          </div>
        </>
      ) : (
        <div className="mt-8">
          <p className="text-[14px] text-muted">
            {query
              ? `За запитом «${query}» нічого не знайдено. Можливо, вам сподобається щось із новинок:`
              : "Введіть запит у пошуку зверху. А поки — новинки:"}
          </p>
          <div className="mt-8">
            <ProductGrid items={fallback} />
          </div>
        </div>
      )}
    </Container>
  );
}
