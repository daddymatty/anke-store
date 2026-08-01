import type {
  CategoryNode,
  ListProductsOptions,
  Product,
  ProductCard,
  ProductListResult,
} from "./types";

/**
 * Контракт джерела даних каталогу.
 * Реалізації: MedusaProvider (продакшн, lib/catalog/medusa.ts)
 * і LocalProvider (демо-сід без бекенда, lib/catalog/local.ts).
 */
export interface CatalogProvider {
  getCategoryTree(): Promise<CategoryNode[]>;
  getCategoryByPath(path: string[]): Promise<CategoryNode | null>;
  listProducts(opts: ListProductsOptions): Promise<ProductListResult>;
  getProduct(slug: string): Promise<Product | null>;
  /** Всі слаги — для sitemap і generateStaticParams */
  getAllProductSlugs(): Promise<string[]>;
  searchProducts(query: string, limit?: number): Promise<ProductCard[]>;
  getRelated(slug: string, limit?: number): Promise<ProductCard[]>;
  getNewArrivals(limit?: number): Promise<ProductCard[]>;
  getSaleProducts(limit?: number): Promise<ProductCard[]>;
}
