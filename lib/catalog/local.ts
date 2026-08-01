import type { CatalogProvider } from "./provider";
import { CATEGORY_TREE, PRODUCTS } from "./seed";
import type {
  CatalogFilters,
  CategoryNode,
  FacetValue,
  ListProductsOptions,
  Product,
  ProductCard,
  ProductListResult,
  SortKey,
} from "./types";

/**
 * Локальний провайдер каталогу — працює з демо-сідом без бекенда.
 * Використовується, коли MEDUSA_BACKEND_URL не задано (dev/preview без інфраструктури).
 * Логіка фільтрів/фасетів/сортування тут — еталон і для Medusa-провайдера.
 */

const DEFAULT_PER_PAGE = 24;

function inCategory(p: Product, path?: string[]): boolean {
  if (!path?.length) return true;
  return path.every((seg, i) => p.categoryPath[i] === seg);
}

export function applyFilters(items: Product[], f?: CatalogFilters): Product[] {
  if (!f) return items;
  return items.filter((p) => {
    if (f.sizes?.length && !p.sizes.some((s) => s.inStock && f.sizes!.includes(s.size))) return false;
    if (f.colors?.length && !f.colors.includes(p.color.name)) return false;
    if (f.materials?.length && !f.materials.includes(p.material)) return false;
    if (f.priceMin != null && p.price < f.priceMin * 100) return false;
    if (f.priceMax != null && p.price > f.priceMax * 100) return false;
    if (f.inStockOnly && !p.inStock) return false;
    if (f.onSaleOnly && !p.compareAtPrice) return false;
    if (f.newOnly && !p.isNew) return false;
    return true;
  });
}

export function applySort(items: Product[], sort: SortKey = "new"): Product[] {
  const arr = [...items];
  switch (sort) {
    case "price-asc":
      return arr.sort((a, b) => a.price - b.price);
    case "price-desc":
      return arr.sort((a, b) => b.price - a.price);
    case "popular":
      // Демо-евристика: спершу з відгуками, далі новинки
      return arr.sort(
        (a, b) => (b.rating?.count ?? 0) - (a.rating?.count ?? 0) || Number(b.isNew) - Number(a.isNew),
      );
    case "new":
    default:
      return arr.sort((a, b) => Number(b.isNew) - Number(a.isNew));
  }
}

export function buildFacets(items: Product[]): ProductListResult["facets"] {
  const sizeCount = new Map<string, number>();
  const colorCount = new Map<string, { count: number; hex: string }>();
  const materialCount = new Map<string, number>();
  let min = Infinity;
  let max = 0;
  for (const p of items) {
    for (const s of p.sizes) {
      if (s.inStock) sizeCount.set(s.size, (sizeCount.get(s.size) ?? 0) + 1);
    }
    const c = colorCount.get(p.color.name);
    colorCount.set(p.color.name, { count: (c?.count ?? 0) + 1, hex: p.color.hex });
    materialCount.set(p.material, (materialCount.get(p.material) ?? 0) + 1);
    min = Math.min(min, p.price);
    max = Math.max(max, p.price);
  }
  const toFacet = (m: Map<string, number>): FacetValue[] =>
    [...m.entries()].map(([value, count]) => ({ value, count }));
  return {
    sizes: toFacet(sizeCount),
    colors: [...colorCount.entries()].map(([value, v]) => ({ value, count: v.count, hex: v.hex })),
    materials: toFacet(materialCount),
    priceRange: {
      min: Math.floor((min === Infinity ? 0 : min) / 100),
      max: Math.ceil(max / 100),
    },
  };
}

function toCard(p: Product): ProductCard {
  // Тільки поля, потрібні картці в сітці (без описів, відгуків тощо)
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    brand: p.brand,
    sku: p.sku,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    images: p.images,
    color: p.color,
    colorGroupId: p.colorGroupId,
    sizes: p.sizes,
    inStock: p.inStock,
    isNew: p.isNew,
    categoryPath: p.categoryPath,
    material: p.material,
  };
}

function findCategory(nodes: CategoryNode[], path: string[]): CategoryNode | null {
  if (!path.length) return null;
  const [head, ...rest] = path;
  const node = nodes.find((n) => n.slug === head);
  if (!node) return null;
  if (!rest.length) return node;
  return findCategory(node.children, rest);
}

export class LocalProvider implements CatalogProvider {
  async getCategoryTree(): Promise<CategoryNode[]> {
    return CATEGORY_TREE;
  }

  async getCategoryByPath(path: string[]): Promise<CategoryNode | null> {
    return findCategory(CATEGORY_TREE, path);
  }

  async listProducts(opts: ListProductsOptions): Promise<ProductListResult> {
    const perPage = opts.perPage ?? DEFAULT_PER_PAGE;
    const page = Math.max(1, opts.page ?? 1);
    const inCat = PRODUCTS.filter((p) => inCategory(p, opts.categoryPath));
    const facets = buildFacets(inCat);
    const filtered = applySort(applyFilters(inCat, opts.filters), opts.sort);
    const total = filtered.length;
    const items = filtered.slice((page - 1) * perPage, page * perPage).map(toCard);
    return { items, total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)), facets };
  }

  async getProduct(slug: string): Promise<Product | null> {
    return PRODUCTS.find((p) => p.slug === slug) ?? null;
  }

  async getAllProductSlugs(): Promise<string[]> {
    return PRODUCTS.map((p) => p.slug);
  }

  async searchProducts(query: string, limit = 8): Promise<ProductCard[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const scored = PRODUCTS.map((p) => {
      const hay = `${p.title} ${p.material} ${p.color.name} ${p.categoryPath.join(" ")}`.toLowerCase();
      let score = 0;
      for (const word of q.split(/\s+/)) {
        if (p.title.toLowerCase().includes(word)) score += 3;
        else if (hay.includes(word)) score += 1;
      }
      return { p, score };
    }).filter((x) => x.score > 0);
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((x) => toCard(x.p));
  }

  async getRelated(slug: string, limit = 8): Promise<ProductCard[]> {
    const cur = PRODUCTS.find((p) => p.slug === slug);
    if (!cur) return [];
    return PRODUCTS.filter(
      (p) => p.slug !== slug && p.colorGroupId !== cur.colorGroupId &&
        p.categoryPath[0] === cur.categoryPath[0],
    )
      .sort((a, b) => {
        const depth = (x: Product) => x.categoryPath.filter((s, i) => s === cur.categoryPath[i]).length;
        return depth(b) - depth(a);
      })
      .slice(0, limit)
      .map(toCard);
  }

  async getNewArrivals(limit = 8): Promise<ProductCard[]> {
    return PRODUCTS.filter((p) => p.isNew).slice(0, limit).map(toCard);
  }

  async getSaleProducts(limit = 8): Promise<ProductCard[]> {
    return PRODUCTS.filter((p) => p.compareAtPrice).slice(0, limit).map(toCard);
  }
}
