import "server-only";

import { catalog } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import { priceDecimal } from "@/lib/money";
import { SITE } from "@/lib/site";

/**
 * Товарні фіди для PPC (розділ 5 ТЗ).
 * Валідація перед віддачею: позиції без обов'язкових полів пропускаються з логом.
 * Оновлення — ISR route-хендлерів раз на годину.
 */

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const GOOGLE_CATEGORY: Record<string, string> = {
  odyah: "Apparel & Accessories > Clothing",
  vzuttya: "Apparel & Accessories > Shoes",
  aksesuary: "Apparel & Accessories > Clothing Accessories",
  prykrasy: "Apparel & Accessories > Jewelry",
};

function validate(p: Product): boolean {
  const ok = Boolean(p.sku && p.title && p.description && p.images[0]?.url && p.price > 0);
  if (!ok) console.warn(`[feed] пропущено ${p.slug}: бракує обов'язкових полів`);
  return ok;
}

/** Кастомні лейбли для Performance Max: маржа / сезон / розпродаж */
function customLabels(p: Product): { l0: string; l1: string; l2: string } {
  const marginTier = p.price >= 400000 ? "high-margin" : p.price >= 200000 ? "mid-margin" : "entry";
  const season =
    p.categoryPath.includes("verkhniy-odyah") || p.material === "Кашемір" || p.material === "Вовна"
      ? "fw"
      : "ss";
  return { l0: marginTier, l1: season, l2: p.compareAtPrice ? "sale" : "regular" };
}

async function feedProducts(): Promise<Product[]> {
  const slugs = await catalog.getAllProductSlugs();
  const products: Product[] = [];
  for (const slug of slugs) {
    const p = await catalog.getProduct(slug);
    if (p && validate(p)) products.push(p);
  }
  return products;
}

function itemXml(p: Product, withLabels: boolean): string {
  const url = `${SITE.url}/product/${p.slug}`;
  const [main, ...rest] = p.images;
  const availability = p.inStock ? "in stock" : "out of stock";
  const sizes = p.sizes.map((s) => s.size).join(",");
  const labels = withLabels ? customLabels(p) : null;
  const category = GOOGLE_CATEGORY[p.categoryPath[0]] ?? GOOGLE_CATEGORY.odyah;
  const productType = p.categoryPath.join(" > ");
  return `  <item>
   <g:id>${esc(p.sku)}</g:id>
   <g:item_group_id>${esc(p.colorGroupId)}</g:item_group_id>
   <g:title>${esc(p.title)}</g:title>
   <g:description>${esc(p.description)}</g:description>
   <g:link>${esc(url)}</g:link>
   <g:image_link>${esc(SITE.url + main.url)}</g:image_link>
${rest.slice(0, 5).map((i) => `   <g:additional_image_link>${esc(SITE.url + i.url)}</g:additional_image_link>`).join("\n")}
   <g:availability>${availability}</g:availability>
   <g:price>${p.compareAtPrice ? priceDecimal(p.compareAtPrice) : priceDecimal(p.price)} UAH</g:price>
${p.compareAtPrice ? `   <g:sale_price>${priceDecimal(p.price)} UAH</g:sale_price>` : ""}
   <g:brand>${esc(p.brand)}</g:brand>
   <g:mpn>${esc(p.sku)}</g:mpn>
   <g:condition>new</g:condition>
   <g:google_product_category>${esc(category)}</g:google_product_category>
   <g:product_type>${esc(productType)}</g:product_type>
   <g:color>${esc(p.color.name)}</g:color>
   <g:size>${esc(sizes)}</g:size>
   <g:gender>female</g:gender>
   <g:age_group>adult</g:age_group>
   <g:shipping>
    <g:country>UA</g:country>
    <g:service>Нова Пошта</g:service>
    <g:price>0 UAH</g:price>
   </g:shipping>
${labels ? `   <g:custom_label_0>${labels.l0}</g:custom_label_0>\n   <g:custom_label_1>${labels.l1}</g:custom_label_1>\n   <g:custom_label_2>${labels.l2}</g:custom_label_2>` : ""}
  </item>`;
}

export async function googleMerchantFeed(withLabels = false): Promise<string> {
  const products = await feedProducts();
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
 <channel>
  <title>${esc(SITE.name)} — каталог</title>
  <link>${SITE.url}</link>
  <description>${esc(SITE.description)}</description>
${products.map((p) => itemXml(p, withLabels)).join("\n")}
 </channel>
</rss>`;
}

/** Facebook / Meta catalog — той самий RSS-діалект з g:-полями */
export async function facebookCatalogFeed(): Promise<string> {
  return googleMerchantFeed(false);
}
