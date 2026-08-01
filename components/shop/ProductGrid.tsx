import { ProductCard } from "./ProductCard";
import { CardActions } from "./CardActions";
import type { ProductCard as ProductCardType } from "@/lib/catalog/types";

/** Сітка товарів: 2 колонки на mobile, 3–4 на desktop. */
export function ProductGrid({
  items,
  priorityCount = 0,
}: {
  items: ProductCardType[];
  priorityCount?: number;
}) {
  if (!items.length) {
    return (
      <div className="py-20 text-center">
        <p className="font-display text-xl font-light">За цими фільтрами нічого не знайдено</p>
        <p className="mt-2 text-[13px] text-muted">Спробуйте прибрати частину фільтрів або подивіться новинки.</p>
      </div>
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((p, i) => (
        <li key={p.id} className="group relative">
          <ProductCard product={p} priority={i < priorityCount} />
          <CardActions product={p} />
        </li>
      ))}
    </ul>
  );
}
