import type { Metadata } from "next";
import { CatalogView } from "@/components/shop/CatalogView";
import type { CatalogSearchParams } from "@/lib/catalog/url";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Новинки — нова колекція жіночого одягу",
  description:
    "Нові надходження ANKE: сукні, костюми, трикотаж і аксесуари. Першими обирайте нову колекцію з доставкою по Україні.",
};

export default async function NewArrivalsPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  return (
    <CatalogView
      title="Новинки"
      description="Свіжі надходження колекції — те, що ми самі носили б щодня."
      breadcrumbs={[{ title: "Новинки", href: "/novynky" }]}
      basePath="/novynky"
      forcedFilters={{ newOnly: true }}
      searchParams={await searchParams}
    />
  );
}
