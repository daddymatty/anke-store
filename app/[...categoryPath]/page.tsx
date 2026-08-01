import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView } from "@/components/shop/CatalogView";
import { catalog } from "@/lib/catalog";
import type { CategoryNode } from "@/lib/catalog/types";
import type { CatalogSearchParams } from "@/lib/catalog/url";
import { catalogRobotsAndCanonical } from "@/lib/seo/meta";
import { SITE } from "@/lib/site";

/** Сторінка категорії: /odyah, /odyah/sukni, /odyah/sukni/midi */

export const revalidate = 600;
export const dynamicParams = true;

type Props = {
  params: Promise<{ categoryPath: string[] }>;
  searchParams: Promise<CatalogSearchParams>;
};

export async function generateStaticParams() {
  const tree = await catalog.getCategoryTree();
  const paths: { categoryPath: string[] }[] = [];
  const walk = (nodes: CategoryNode[]) => {
    for (const n of nodes) {
      paths.push({ categoryPath: n.path });
      walk(n.children);
    }
  };
  walk(tree);
  return paths;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { categoryPath } = await params;
  const sp = await searchParams;
  const category = await catalog.getCategoryByPath(categoryPath);
  if (!category) return {};
  const base = catalogRobotsAndCanonical(`/${categoryPath.join("/")}`, sp);
  return {
    title: category.seo?.title ?? `${category.title} — купити в Києві та Україні`,
    description:
      category.seo?.description ??
      category.description ??
      `${category.title} від ${SITE.name}: доставка Новою Поштою по Україні.`,
    ...base,
    ...(category.seo?.noindex ? { robots: { index: false, follow: true } } : {}),
    ...(category.seo?.ogImage ? { openGraph: { images: [{ url: category.seo.ogImage }] } } : {}),
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { categoryPath } = await params;
  const sp = await searchParams;
  const category = await catalog.getCategoryByPath(categoryPath);
  if (!category) notFound();

  // Хлібні крихти з реальних назв категорій дерева
  const crumbs: { title: string; href: string }[] = [];
  for (let i = 0; i < categoryPath.length; i++) {
    const node = await catalog.getCategoryByPath(categoryPath.slice(0, i + 1));
    if (node) crumbs.push({ title: node.title, href: `/${node.path.join("/")}` });
  }

  return (
    <CatalogView
      title={category.title}
      description={category.description}
      seoText={category.seoText}
      breadcrumbs={crumbs}
      basePath={`/${categoryPath.join("/")}`}
      categoryPath={categoryPath}
      subcategories={category.children}
      searchParams={sp}
      jsonLdCategory={category}
    />
  );
}
