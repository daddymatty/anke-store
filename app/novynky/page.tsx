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
  title: "Новинки — нова колекція жіночого одягу",
  description:
    "Нові надходження ANKE: сукні, костюми, трикотаж і аксесуари. Першими обирайте нову колекцію з доставкою по Україні.",
    ...catalogRobotsAndCanonical("/novynky", await searchParams),
  };
}

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
