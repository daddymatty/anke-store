import type { CatalogProvider } from "./provider";
import { applyFilters, applySort, buildFacets } from "./local";
import type {
  CategoryNode,
  ListProductsOptions,
  PageSeo,
  Product,
  ProductCard,
  ProductListResult,
  ProductReview,
} from "./types";

/**
 * Провайдер каталогу поверх Medusa Store API v2.
 * ISR: товари revalidate 300с (тег "products"), категорії 600с (тег "categories");
 * on-demand revalidate — через /api/revalidate (Етап 8) при зміні в адмінці.
 *
 * Фільтри/фасети рахуються в Node поверх повного набору категорії (кешованого ISR):
 * для каталогу до ~1000 SKU це швидше і простіше, ніж додатковий пошуковий сервіс.
 * Відгуки підключаються кастомним модулем Medusa на Етапі 12.
 */

const PRODUCT_REVALIDATE = 300;
const CATEGORY_REVALIDATE = 600;
const PAGE_SIZE_UPSTREAM = 100;

type MedusaImage = { url: string };
type MedusaVariant = {
  id: string;
  title: string;
  sku: string | null;
  inventory_quantity?: number;
  calculated_price?: { calculated_amount: number } | null;
};
type MedusaCategory = {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  parent_category_id: string | null;
  metadata: Record<string, unknown> | null;
};

/** metadata → SEO-перевизначення (ключі: seoTitle, seoDescription, ogImage, canonical, noindex) */
function seoFromMeta(meta: Record<string, unknown> | null | undefined): PageSeo | undefined {
  if (!meta) return undefined;
  const seo: PageSeo = {};
  if (typeof meta.seoTitle === "string" && meta.seoTitle) seo.title = meta.seoTitle;
  if (typeof meta.seoDescription === "string" && meta.seoDescription) seo.description = meta.seoDescription;
  if (typeof meta.ogImage === "string" && meta.ogImage) seo.ogImage = meta.ogImage;
  if (typeof meta.canonical === "string" && meta.canonical) seo.canonical = meta.canonical;
  if (meta.noindex === true || meta.noindex === "true" || meta.noindex === "1") seo.noindex = true;
  return Object.keys(seo).length ? seo : undefined;
}
type MedusaProduct = {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  images: MedusaImage[];
  variants: MedusaVariant[];
  categories?: { id: string }[];
  metadata: Record<string, unknown> | null;
};

export class MedusaProvider implements CatalogProvider {
  private baseUrl: string;
  private key: string;
  private regionId: string | null = null;

  constructor(baseUrl: string, publishableKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.key = publishableKey;
  }

  private async fetchJson<T>(
    path: string,
    { revalidate, tags }: { revalidate: number; tags: string[] },
  ): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: { "x-publishable-api-key": this.key },
      next: { revalidate, tags },
    });
    if (!res.ok) {
      throw new Error(`Medusa ${path} → ${res.status}`);
    }
    return res.json() as Promise<T>;
  }

  private async getRegionId(): Promise<string> {
    if (this.regionId) return this.regionId;
    const data = await this.fetchJson<{ regions: { id: string; currency_code: string }[] }>(
      "/store/regions",
      { revalidate: 3600, tags: ["regions"] },
    );
    const uah = data.regions.find((r) => r.currency_code === "uah") ?? data.regions[0];
    if (!uah) throw new Error("Medusa: не знайдено жодного регіону");
    this.regionId = uah.id;
    return uah.id;
  }

  // ---------- Категорії ----------

  private categoryCache: { tree: CategoryNode[]; byId: Map<string, CategoryNode> } | null = null;

  private async loadCategories(): Promise<{ tree: CategoryNode[]; byId: Map<string, CategoryNode> }> {
    const data = await this.fetchJson<{ product_categories: MedusaCategory[] }>(
      "/store/product-categories?limit=200&fields=id,name,handle,description,parent_category_id,metadata",
      { revalidate: CATEGORY_REVALIDATE, tags: ["categories"] },
    );
    const byId = new Map<string, CategoryNode>();
    const raw = data.product_categories;
    for (const rc of raw) {
      byId.set(rc.id, {
        id: rc.id,
        seo: seoFromMeta(rc.metadata),
        // handle верхніх рівнів = slug; вкладені мають складений handle (odyah-sukni),
        // беремо останній сегмент як slug
        slug: rc.handle.split("-").length > 1 && raw.some((x) => x.id === rc.parent_category_id)
          ? rc.handle
          : rc.handle,
        path: [],
        title: rc.name,
        description: rc.description ?? undefined,
        seoText: typeof rc.metadata?.seoText === "string" ? (rc.metadata.seoText as string) : undefined,
        children: [],
      });
    }
    const tree: CategoryNode[] = [];
    for (const rc of raw) {
      const node = byId.get(rc.id)!;
      if (rc.parent_category_id && byId.has(rc.parent_category_id)) {
        byId.get(rc.parent_category_id)!.children.push(node);
      } else {
        tree.push(node);
      }
    }
    // Проставляємо path і чистимо складені slug-и (handle "odyah-sukni" → slug "sukni")
    const fixPaths = (nodes: CategoryNode[], parentPath: string[]) => {
      for (const n of nodes) {
        const lastSeg = n.slug.startsWith(parentPath.join("-") + "-") && parentPath.length
          ? n.slug.slice(parentPath.join("-").length + 1)
          : n.slug;
        n.slug = lastSeg;
        n.path = [...parentPath, lastSeg];
        fixPaths(n.children, n.path);
      }
    };
    fixPaths(tree, []);
    this.categoryCache = { tree, byId };
    return this.categoryCache;
  }

  async getCategoryTree(): Promise<CategoryNode[]> {
    return (await this.loadCategories()).tree;
  }

  async getCategoryByPath(path: string[]): Promise<CategoryNode | null> {
    let nodes = (await this.loadCategories()).tree;
    let found: CategoryNode | null = null;
    for (const seg of path) {
      found = nodes.find((n) => n.slug === seg) ?? null;
      if (!found) return null;
      nodes = found.children;
    }
    return found;
  }

  // ---------- Товари ----------

  private mapProduct(mp: MedusaProduct): Product {
    const meta = (mp.metadata ?? {}) as Record<string, unknown>;
    const alts = Array.isArray(meta.imageAlts) ? (meta.imageAlts as string[]) : [];
    const sizes = mp.variants.map((v) => ({
      size: v.title,
      inStock: (v.inventory_quantity ?? 0) > 0,
      variantId: v.id,
    }));
    const price = mp.variants[0]?.calculated_price?.calculated_amount ?? 0;
    const compareAt = typeof meta.compareAtPrice === "number" ? meta.compareAtPrice : undefined;
    return {
      id: mp.id,
      slug: mp.handle,
      title: mp.title,
      brand: "ANKE",
      sku: mp.variants[0]?.sku?.replace(/-[^-]+$/, "") ?? mp.handle,
      price,
      compareAtPrice: compareAt,
      images: mp.images.map((img, i) => ({
        url: img.url,
        alt: alts[i] ?? mp.title,
        width: 1200,
        height: 1600,
      })),
      color: {
        name: String(meta.colorName ?? ""),
        hex: String(meta.colorHex ?? "#CCCCCC"),
      },
      colorGroupId: String(meta.colorGroupId ?? mp.id),
      sizes,
      inStock: sizes.some((s) => s.inStock),
      isNew: Boolean(meta.isNew),
      categoryPath: [], // проставляється після зіставлення з деревом
      material: String(meta.material ?? ""),
      description: mp.description ?? "",
      materialFull: String(meta.materialFull ?? ""),
      care: Array.isArray(meta.care) ? (meta.care as string[]) : [],
      madeIn: String(meta.madeIn ?? "Україна"),
      modelParams: meta.modelParams ? String(meta.modelParams) : undefined,
      colors: [], // сіблінги проставляються нижче (по colorGroupId)
      outfitWith: Array.isArray(meta.outfitWith) ? (meta.outfitWith as string[]) : [],
      rating: undefined,
      reviews: [],
      seo: seoFromMeta(meta),
    };
  }

  /** Схвалені відгуки з модуля anke-content */
  private async fetchReviews(handle: string): Promise<ProductReview[]> {
    try {
      const data = await this.fetchJson<{ reviews: { id: string; author: string; rating: number; text: string; date: string }[] }>(
        `/store/anke/reviews?handle=${encodeURIComponent(handle)}`,
        { revalidate: PRODUCT_REVALIDATE, tags: ["products", `reviews:${handle}`] },
      );
      return data.reviews.map((r) => ({
        id: r.id,
        author: r.author,
        rating: Math.max(1, Math.min(5, Math.round(r.rating))) as ProductReview["rating"],
        text: r.text,
        date: r.date,
        approved: true,
      }));
    } catch {
      return [];
    }
  }

  /** Повний набір товарів (кешується ISR на рівні fetch) */
  private async allProducts(): Promise<Product[]> {
    const regionId = await this.getRegionId();
    const { byId } = await this.loadCategories();
    const fields =
      "id,title,handle,description,metadata,*images,*variants,*variants.calculated_price,+variants.inventory_quantity,*categories";
    const items: MedusaProduct[] = [];
    let offset = 0;
    for (;;) {
      const data = await this.fetchJson<{ products: MedusaProduct[]; count: number }>(
        `/store/products?limit=${PAGE_SIZE_UPSTREAM}&offset=${offset}&region_id=${regionId}&fields=${encodeURIComponent(fields)}`,
        { revalidate: PRODUCT_REVALIDATE, tags: ["products"] },
      );
      items.push(...data.products);
      offset += PAGE_SIZE_UPSTREAM;
      if (offset >= data.count) break;
    }
    const products = items.map((mp) => {
      const p = this.mapProduct(mp);
      // Найглибша категорія товару → categoryPath
      let best: CategoryNode | null = null;
      for (const cref of mp.categories ?? []) {
        const node = byId.get(cref.id);
        if (node && (!best || node.path.length > best.path.length)) best = node;
      }
      p.categoryPath = best?.path ?? [];
      return p;
    });
    // Кольори-сіблінги по colorGroupId
    const byGroup = new Map<string, Product[]>();
    for (const p of products) {
      const arr = byGroup.get(p.colorGroupId) ?? [];
      arr.push(p);
      byGroup.set(p.colorGroupId, arr);
    }
    for (const p of products) {
      p.colors = (byGroup.get(p.colorGroupId) ?? [])
        .filter((s) => s.slug !== p.slug)
        .map((s) => ({ name: s.color.name, hex: s.color.hex, productSlug: s.slug }));
    }
    return products;
  }

  async listProducts(opts: ListProductsOptions): Promise<ProductListResult> {
    const perPage = opts.perPage ?? 24;
    const page = Math.max(1, opts.page ?? 1);
    const all = await this.allProducts();
    const inCat = all.filter(
      (p) => !opts.categoryPath?.length || opts.categoryPath.every((seg, i) => p.categoryPath[i] === seg),
    );
    const facets = buildFacets(inCat);
    const filtered = applySort(applyFilters(inCat, opts.filters), opts.sort);
    const total = filtered.length;
    return {
      items: filtered.slice((page - 1) * perPage, page * perPage),
      total,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
      facets,
    };
  }

  async getProduct(slug: string): Promise<Product | null> {
    const all = await this.allProducts();
    const product = all.find((p) => p.slug === slug);
    if (!product) return null;
    const reviews = await this.fetchReviews(slug);
    if (!reviews.length) return product;
    const value =
      Math.round((reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) * 10) / 10;
    return { ...product, reviews, rating: { value, count: reviews.length } };
  }

  async getAllProductSlugs(): Promise<string[]> {
    return (await this.allProducts()).map((p) => p.slug);
  }

  async searchProducts(query: string, limit = 8): Promise<ProductCard[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const all = await this.allProducts();
    return all
      .map((p) => {
        const hay = `${p.title} ${p.material} ${p.color.name}`.toLowerCase();
        let score = 0;
        for (const w of q.split(/\s+/)) {
          if (p.title.toLowerCase().includes(w)) score += 3;
          else if (hay.includes(w)) score += 1;
        }
        return { p, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((x) => x.p);
  }

  async getRelated(slug: string, limit = 8): Promise<ProductCard[]> {
    const all = await this.allProducts();
    const cur = all.find((p) => p.slug === slug);
    if (!cur) return [];
    return all
      .filter((p) => p.slug !== slug && p.colorGroupId !== cur.colorGroupId && p.categoryPath[0] === cur.categoryPath[0])
      .slice(0, limit);
  }

  async getNewArrivals(limit = 8): Promise<ProductCard[]> {
    return (await this.allProducts()).filter((p) => p.isNew).slice(0, limit);
  }

  async getSaleProducts(limit = 8): Promise<ProductCard[]> {
    return (await this.allProducts()).filter((p) => p.compareAtPrice).slice(0, limit);
  }
}
