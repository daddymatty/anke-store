import type { Metadata } from "next";
import Link from "next/link";
import { HeroTitle } from "@/components/motion/HeroTitle";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { ProductCard } from "@/components/shop/ProductCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { catalog } from "@/lib/catalog";
import { localBusinessJsonLd } from "@/lib/seo/jsonld";
import { pageAlternates } from "@/lib/seo/meta";
import { NAV } from "@/lib/site";

export const metadata: Metadata = {
  alternates: pageAlternates(""),
};

/**
 * Головна — каркасна версія Етапу 2.
 * Hero з реальним фото, банери з адмінки, добірки товарів і motion-шар
 * додаються на Етапах 4, 10 і 12.
 */
export default async function Home() {
  const newArrivals = await catalog.getNewArrivals(8);
  return (
    <>
      <JsonLd data={localBusinessJsonLd()} />
      {/* Hero */}
      <section className="bg-beige">
        <Container className="grid min-h-[62vh] items-center gap-10 py-16 lg:grid-cols-[3fr_2fr]">
          <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-rose-deep">
            Нова колекція
          </p>
          <HeroTitle
            text="Одяг, у якому повітря більше, ніж тканини"
            className="mt-4 max-w-2xl font-display text-display-sm font-light md:text-display-lg"
          />
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">
            Сукні, костюми і трикотаж українського виробництва. Доставка Новою Поштою
            1–3 дні, примірка у шоурумі в Києві.
          </p>
          <div className="mt-8 flex gap-3">
            <ButtonLink href="/novynky" variant="primary" size="lg">
              Новинки
            </ButtonLink>
            <ButtonLink href="/odyah" variant="outline" size="lg">
              Каталог
            </ButtonLink>
          </div>
          </div>
          <ParallaxImage
            src="/demo/powder.jpg"
            alt="Нова колекція ANKE — пудрові відтінки сезону"
            priority
            sizes="(max-width: 1024px) 0px, 38vw"
            className="hidden aspect-[3/4] max-h-[68vh] w-full lg:block"
          />
        </Container>
      </section>

      {/* Новинки */}
      <section aria-labelledby="home-new">
        <Container className="pt-16">
          <div className="flex items-end justify-between">
            <h2 id="home-new" className="font-display text-display-sm font-light">
              Новинки
            </h2>
            <Link
              href="/novynky"
              className="text-[12px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-ink"
            >
              Дивитись усі
            </Link>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4">
            {newArrivals.map((p, i) => (
              <li key={p.id}>
                <ProductCard product={p} priority={i < 2} />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Категорії */}
      <section aria-labelledby="home-categories">
        <Container className="py-16">
          <h2 id="home-categories" className="font-display text-display-sm font-light">
            Категорії
          </h2>
          <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex aspect-[4/5] items-end p-4 text-[13px] uppercase tracking-[0.12em] transition-colors ${
                    item.accent
                      ? "bg-rose-soft text-rose-deep hover:bg-rose hover:text-paper"
                      : "bg-beige text-ink hover:bg-beige-deep"
                  }`}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
