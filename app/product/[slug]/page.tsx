import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Accordion } from "@/components/ui/Accordion";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs, type Crumb } from "@/components/shop/Breadcrumbs";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { RecentlyViewed } from "@/components/shop/RecentlyViewed";
import { ReviewsSection, Stars } from "@/components/shop/ReviewsSection";
import { VariantPicker } from "@/components/shop/VariantPicker";
import { ViewedTracker } from "@/components/shop/ViewedTracker";
import { ViewItemTracker } from "@/components/analytics/trackers";
import { JsonLd } from "@/components/seo/JsonLd";
import { catalog } from "@/lib/catalog";
import { discountPercent, formatPrice, priceDecimal } from "@/lib/money";
import { breadcrumbsJsonLd, productJsonLd } from "@/lib/seo/jsonld";
import { pageAlternates } from "@/lib/seo/meta";
import { SITE } from "@/lib/site";

/** Картка товару. ISR 300с; JSON-LD Product+Offer додає Етап 8. */

export const revalidate = 300;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await catalog.getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await catalog.getProduct(slug);
  if (!product) return {};
  const alternates = pageAlternates(`/product/${product.slug}`);
  return {
    // SEO-поля з адмінки (metadata товару) мають пріоритет над шаблоном
    title: product.seo?.title ?? `${product.title} — купити в Києві та Україні`,
    description:
      product.seo?.description ??
      `${product.title} за ${priceDecimal(product.price)} грн. ${product.materialFull}. Доставка Новою Поштою 1–3 дні, обмін і повернення 14 днів | ${SITE.name}`,
    alternates: product.seo?.canonical
      ? { ...alternates, canonical: product.seo.canonical }
      : alternates,
    ...(product.seo?.noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      images: product.seo?.ogImage
        ? [{ url: product.seo.ogImage }]
        : product.images[0]
          ? [{ url: product.images[0].url, alt: product.images[0].alt }]
          : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await catalog.getProduct(slug);
  if (!product) notFound();

  const crumbs: Crumb[] = [];
  for (let i = 0; i < product.categoryPath.length; i++) {
    const node = await catalog.getCategoryByPath(product.categoryPath.slice(0, i + 1));
    if (node) crumbs.push({ title: node.title, href: `/${node.path.join("/")}` });
  }
  crumbs.push({ title: product.title, href: `/product/${product.slug}` });

  const related = await catalog.getRelated(slug, 4);
  const outfit = (
    await Promise.all(product.outfitWith.map((s) => catalog.getProduct(s)))
  ).filter((p): p is NonNullable<typeof p> => Boolean(p));

  const sale = product.compareAtPrice ? discountPercent(product.compareAtPrice, product.price) : 0;

  return (
    <Container className="py-6 pb-24 md:py-10 lg:pb-10">
      <JsonLd data={[productJsonLd(product), breadcrumbsJsonLd(crumbs)]} />
      <ViewItemTracker
        item={{
          item_id: product.sku,
          item_name: product.title,
          item_brand: product.brand,
          item_variant: product.color.name,
          price: Math.round(product.price) / 100,
          quantity: 1,
        }}
        value={Math.round(product.price) / 100}
      />
      <ViewedTracker
        item={{
          slug: product.slug,
          title: product.title,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          image: product.images[0]?.url ?? "",
          alt: product.images[0]?.alt ?? product.title,
        }}
      />
      <Breadcrumbs items={crumbs} />

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
        <ProductGallery images={product.images} title={product.title} />

        <div>
          <h1 className="font-display text-[26px] font-light leading-snug md:text-[30px]">{product.title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="flex items-baseline gap-2.5">
              <span className={`text-[20px] font-medium ${product.compareAtPrice ? "text-rose-deep" : ""}`}>
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <>
                  <s className="text-[14px] text-muted">{formatPrice(product.compareAtPrice)}</s>
                  <span className="bg-rose px-1.5 py-0.5 text-[11px] font-medium text-paper">−{sale}%</span>
                </>
              )}
            </p>
            {product.rating && (
              <a href="#reviews" className="flex items-center gap-1.5 text-[12.5px] text-muted hover:text-ink">
                <Stars value={product.rating.value} className="text-ink" />
                ({product.rating.count})
              </a>
            )}
          </div>

          <VariantPicker
            slug={product.slug}
            sizes={product.sizes}
            colors={product.colors}
            currentColor={product.color}
            modelParams={product.modelParams}
            inStock={product.inStock}
          />

          <div className="mt-8">
            <Accordion
              defaultOpen="desc"
              items={[
                {
                  id: "desc",
                  title: "Опис",
                  content: <p>{product.description}</p>,
                },
                {
                  id: "care",
                  title: "Склад і догляд",
                  content: (
                    <div>
                      <p>{product.materialFull}</p>
                      <ul className="mt-2 list-inside list-disc space-y-1">
                        {product.care.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                      <p className="mt-2">Виробництво: {product.madeIn}. Артикул: {product.sku}.</p>
                    </div>
                  ),
                },
                {
                  id: "delivery",
                  title: "Доставка й оплата",
                  content: (
                    <ul className="list-inside list-disc space-y-1">
                      <li>Нова Пошта: відділення, поштомат або адресна доставка, 1–3 дні</li>
                      <li>Безкоштовна доставка від {formatPrice(SITE.freeShippingFrom * 100)}</li>
                      <li>Оплата онлайн (Apple Pay / Google Pay / картка), частинами або накладений платіж</li>
                    </ul>
                  ),
                },
                {
                  id: "returns",
                  title: "Обмін і повернення",
                  content: (
                    <p>
                      Обмін або повернення протягом 14 днів з моменту отримання — за ЗУ «Про захист прав
                      споживачів». Речі мають бути без слідів носіння, з бирками. Деталі — на сторінці{" "}
                      <Link href="/povernennya" className="text-ink underline underline-offset-4">
                        «Обмін і повернення»
                      </Link>
                      .
                    </p>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>

      {outfit.length > 0 && (
        <section aria-labelledby="outfit-title" className="mt-20">
          <h2 id="outfit-title" className="font-display text-display-sm font-light">
            Створи образ
          </h2>
          <p className="mt-1 text-[13px] text-muted">Речі, з якими цю модель носять стилісти ANKE.</p>
          <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4">
            {outfit.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="mt-20">
          <h2 id="related-title" className="font-display text-display-sm font-light">
            Схожі товари
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4">
            {related.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <ReviewsSection slug={product.slug} reviews={product.reviews} rating={product.rating} />

      <RecentlyViewed excludeSlug={product.slug} />
    </Container>
  );
}
