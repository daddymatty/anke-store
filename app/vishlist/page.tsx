import type { Metadata } from "next";
import Link from "next/link";
import { getWishlist } from "@/app/actions/wishlist";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Container } from "@/components/ui/Container";
import { catalog } from "@/lib/catalog";
import type { ProductCard } from "@/lib/catalog/types";

export const metadata: Metadata = {
  title: "Вішліст",
  robots: { index: false, follow: true },
};

/** Вішліст гостя (cookie). Синхронізація з акаунтом — Етап 7. */
export default async function WishlistPage() {
  const slugs = await getWishlist();
  const items: ProductCard[] = [];
  for (const slug of slugs) {
    const p = await catalog.getProduct(slug);
    if (p) items.push(p);
  }

  return (
    <Container className="py-6 md:py-10">
      <Breadcrumbs items={[{ title: "Вішліст", href: "/vishlist" }]} />
      <h1 className="mt-5 font-display text-display-sm font-light md:text-display">Вішліст</h1>
      {items.length ? (
        <div className="mt-8">
          <ProductGrid items={items} />
        </div>
      ) : (
        <div className="mt-16 max-w-md">
          <p className="font-display text-xl font-light">Тут поки порожньо</p>
          <p className="mt-2 text-[14px] text-muted">
            Натискайте на сердечко на картці товару — і він збережеться тут, навіть якщо ви не маєте акаунта.
          </p>
          <Link
            href="/novynky"
            className="mt-6 inline-block border border-ink px-8 py-3 text-[13px] font-medium uppercase tracking-[0.14em] transition-colors hover:bg-ink hover:text-paper"
          >
            Дивитись новинки
          </Link>
        </div>
      )}
    </Container>
  );
}
