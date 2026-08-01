/**
 * Доменні типи каталогу ANKE.
 * Сторфронт працює ТІЛЬКИ з цими типами — джерело даних (Medusa або локальний сід)
 * ховається за CatalogProvider (lib/catalog/provider.ts).
 */

/** Гроші — завжди в копійках (integer), валюта UAH */
export type Money = number;

/** SEO-перевизначення сторінки (редагуються в metadata товару/категорії в адмінці) */
export type PageSeo = {
  title?: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
};

export type CategoryNode = {
  id: string;
  /** Сегмент URL: "sukni" */
  slug: string;
  /** Повний шлях від кореня: ["odyah", "sukni", "midi"] */
  path: string[];
  title: string;
  description?: string;
  /** SEO-текст під лістингом (редагується в адмінці, 800–1500 знаків) */
  seoText?: string;
  seo?: PageSeo;
  children: CategoryNode[];
};

export type ProductImage = {
  url: string;
  alt: string;
  width: number;
  height: number;
};

export type SizeStock = {
  /** "XS" | "S" | "M" | "L" | "XL" | "36".. для взуття | "One size" */
  size: string;
  inStock: boolean;
  /** ID варіанта в Medusa (для кошика/замовлень); у локальному сіді відсутній */
  variantId?: string;
};

/** Інший колір цього ж товару = окремий продукт (окремий URL для індексації) */
export type ColorSibling = {
  name: string;
  hex: string;
  productSlug: string;
};

/** Мінімум для картки в сітці каталогу */
export type ProductCard = {
  id: string;
  slug: string;
  title: string;
  brand: "ANKE";
  sku: string;
  price: Money;
  /** Стара ціна — якщо є, товар у SALE */
  compareAtPrice?: Money;
  /** [головне фото, фото для hover-crossfade] */
  images: ProductImage[];
  color: { name: string; hex: string };
  /** Спільний id для всіх кольорів однієї моделі (item_group_id у фідах) */
  colorGroupId: string;
  sizes: SizeStock[];
  inStock: boolean;
  isNew: boolean;
  /** Шлях категорії: ["odyah", "sukni", "midi"] */
  categoryPath: string[];
  material: string;
};

export type ProductReview = {
  id: string;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  date: string; // ISO
  approved: boolean;
};

export type Product = ProductCard & {
  description: string;
  /** Склад тканини: "Льон 100%" */
  materialFull: string;
  care: string[];
  madeIn: string;
  /** "Параметри моделі: зріст 175 см, на моделі розмір S" */
  modelParams?: string;
  colors: ColorSibling[];
  /** Слаги товарів «Створи образ» */
  outfitWith: string[];
  rating?: { value: number; count: number };
  reviews: ProductReview[];
  seo?: PageSeo;
};

export type SortKey = "new" | "price-asc" | "price-desc" | "popular";

export type CatalogFilters = {
  sizes?: string[];
  colors?: string[];
  /** У гривнях (не копійках) — приходить з URL */
  priceMin?: number;
  priceMax?: number;
  materials?: string[];
  inStockOnly?: boolean;
  onSaleOnly?: boolean;
  newOnly?: boolean;
};

export type FacetValue = { value: string; count: number; hex?: string };

export type ProductListResult = {
  items: ProductCard[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  facets: {
    sizes: FacetValue[];
    colors: FacetValue[];
    materials: FacetValue[];
    priceRange: { min: number; max: number };
  };
};

export type ListProductsOptions = {
  categoryPath?: string[];
  filters?: CatalogFilters;
  sort?: SortKey;
  page?: number;
  perPage?: number;
};
