import Image from "next/image";
import Link from "next/link";
import { discountPercent, formatPrice } from "@/lib/money";
import type { ProductCard as ProductCardType } from "@/lib/catalog/types";

/**
 * Картка товару в сітці. Hover-crossfade другого фото — чистий CSS
 * (motion-шар Етапу 10 додасть whileInView-появу через обгортку).
 */
export function ProductCard({ product, priority = false }: { product: ProductCardType; priority?: boolean }) {
  const [main, hover] = product.images;
  const sale = product.compareAtPrice ? discountPercent(product.compareAtPrice, product.price) : 0;

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-beige">
        <Image
          src={main.url}
          alt={main.alt}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
          priority={priority}
          className="object-cover"
        />
        {hover && hover.url !== main.url && (
          <Image
            src={hover.url}
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}
        {/* Бейджі */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {sale > 0 && (
            <span className="bg-rose px-2 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-paper">
              −{sale}%
            </span>
          )}
          {product.isNew && sale === 0 && (
            <span className="bg-ink px-2 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-paper">
              New
            </span>
          )}
        </div>
        {!product.inStock && (
          <span className="absolute inset-x-0 bottom-0 bg-paper/85 py-2 text-center text-[11px] uppercase tracking-[0.1em] text-muted">
            Немає в наявності
          </span>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="text-[13px] leading-snug text-ink">{product.title}</h3>
        <p className="flex items-baseline gap-2 text-[14px]">
          <span className={product.compareAtPrice ? "font-medium text-rose-deep" : "font-medium"}>
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <s className="text-[12px] text-muted">{formatPrice(product.compareAtPrice)}</s>
          )}
        </p>
      </div>
    </Link>
  );
}
