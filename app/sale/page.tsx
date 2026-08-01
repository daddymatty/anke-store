import type { Metadata } from "next";
import { CatalogView } from "@/components/shop/CatalogView";
import type { CatalogSearchParams } from "@/lib/catalog/url";
import { catalogRobotsAndCanonical } from "@/lib/seo/meta";

export const revalidate = 600;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}): Promise<Metadata> {
  return {
  title: "SALE — знижки на жіночий одяг",
  description:
    "Розпродаж ANKE: улюблені моделі зі знижками. Розміри закінчуються швидко — встигніть обрати своє.",
    ...catalogRobotsAndCanonical("/sale", await searchParams),
  };
}

export default async function SalePage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  return (
    <CatalogView
      title="SALE"
      description="Знижки на моделі поточної колекції. Кількість розмірів обмежена."
      breadcrumbs={[{ title: "SALE", href: "/sale" }]}
      basePath="/sale"
      forcedFilters={{ onSaleOnly: true }}
      searchParams={await searchParams}
    />
  );
}
