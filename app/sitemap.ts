import type { MetadataRoute } from "next";
import { catalog } from "@/lib/catalog";
import type { CategoryNode } from "@/lib/catalog/types";
import { SITE } from "@/lib/site";

/**
 * Sitemap-індекс: /sitemap/0.xml — статичні, /sitemap/1.xml — категорії,
 * /sitemap/2.xml — товари (блог додається на Етапі 11).
 * lastmod: у товарів/категорій — час генерації (ISR оновлює його при ревалідації);
 * TODO: підтягувати updated_at з Medusa, коли адмінка стане джерелом контенту.
 */

export async function generateSitemaps() {
  return [{ id: 0 }, { id: 1 }, { id: 2 }];
}

const STATIC_PATHS = [
  "",
  "/novynky",
  "/sale",
  "/pro-brend",
  "/dostavka-oplata",
  "/povernennya",
  "/faq",
  "/kontakty",
  "/lookbook",
  "/blog",
];

export default async function sitemap({
  id: rawId,
}: {
  id: number | Promise<number>;
}): Promise<MetadataRoute.Sitemap> {
  const id = Number(await rawId); // у Next 16 id — async
  const now = new Date();

  if (id === 0) {
    return STATIC_PATHS.map((p) => ({
      url: `${SITE.url}${p}`,
      lastModified: now,
      changeFrequency: p === "" ? "daily" : "weekly",
      priority: p === "" ? 1 : 0.6,
    }));
  }

  if (id === 1) {
    const tree = await catalog.getCategoryTree();
    const urls: MetadataRoute.Sitemap = [];
    const walk = (nodes: CategoryNode[]) => {
      for (const n of nodes) {
        urls.push({
          url: `${SITE.url}/${n.path.join("/")}`,
          lastModified: now,
          changeFrequency: "daily",
          priority: n.path.length === 1 ? 0.9 : 0.8,
        });
        walk(n.children);
      }
    };
    walk(tree);
    return urls;
  }

  const slugs = await catalog.getAllProductSlugs();
  return slugs.map((slug) => ({
    url: `${SITE.url}/product/${slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.7,
  }));
}
