"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconClose } from "@/components/ui/icons";
import { backdropFade, drawerPanel } from "@/lib/motion";
import { countActiveFilters } from "@/lib/catalog/url";
import type { CatalogFilters, ProductListResult } from "@/lib/catalog/types";

type Props = {
  facets: ProductListResult["facets"];
  active: CatalogFilters;
};

/**
 * Фільтри каталогу: сайдбар на desktop, drawer на mobile.
 * Стан живе в URL — кожна зміна = router.push (без перезавантаження, RSC-рефетч).
 */
export function FiltersPanel({ facets, active }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [priceMin, setPriceMin] = useState(active.priceMin?.toString() ?? "");
  const [priceMax, setPriceMax] = useState(active.priceMax?.toString() ?? "");

  // Синхронізація інпутів ціни зі станом URL (адаптація стану під час рендера,
  // рекомендований React-патерн замість setState в ефекті)
  const [prevPrice, setPrevPrice] = useState<[number | undefined, number | undefined]>([
    active.priceMin,
    active.priceMax,
  ]);
  if (prevPrice[0] !== active.priceMin || prevPrice[1] !== active.priceMax) {
    setPrevPrice([active.priceMin, active.priceMax]);
    setPriceMin(active.priceMin?.toString() ?? "");
    setPriceMax(active.priceMax?.toString() ?? "");
  }

  const activeCount = countActiveFilters(active);

  const update = (mutate: (q: URLSearchParams) => void) => {
    const q = new URLSearchParams(sp.toString());
    mutate(q);
    q.delete("page");
    q.delete("limit");
    router.push(`${pathname}${q.size ? `?${q}` : ""}`, { scroll: false });
  };

  const toggleListValue = (key: string, value: string) => {
    update((q) => {
      const cur = q.get(key)?.split(",").filter(Boolean) ?? [];
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      if (next.length) q.set(key, next.join(","));
      else q.delete(key);
    });
  };

  const toggleFlag = (key: string) => {
    update((q) => {
      if (q.get(key) === "1") q.delete(key);
      else q.set(key, "1");
    });
  };

  const applyPrice = () => {
    update((q) => {
      if (priceMin) q.set("price_min", priceMin);
      else q.delete("price_min");
      if (priceMax) q.set("price_max", priceMax);
      else q.delete("price_max");
    });
  };

  const clearAll = () => {
    update((q) => {
      for (const k of ["size", "color", "material", "price_min", "price_max", "instock", "sale"]) {
        q.delete(k);
      }
    });
    setMobileOpen(false);
  };

  const body = (
    <div className="space-y-7">
      <FilterGroup title="Розмір">
        <div className="flex flex-wrap gap-2">
          {facets.sizes.map((s) => {
            const checked = active.sizes?.includes(s.value) ?? false;
            return (
              <button
                key={s.value}
                type="button"
                aria-pressed={checked}
                onClick={() => toggleListValue("size", s.value)}
                className={`min-w-11 border px-2.5 py-2 text-[12px] transition-colors ${
                  checked
                    ? "border-ink bg-ink text-paper"
                    : "border-line text-ink hover:border-ink"
                }`}
              >
                {s.value}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup title="Колір">
        <ul className="space-y-2">
          {facets.colors.map((c) => {
            const checked = active.colors?.includes(c.value) ?? false;
            return (
              <li key={c.value}>
                <label className="flex cursor-pointer items-center gap-2.5 text-[13px]">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleListValue("color", c.value)}
                    className="h-4 w-4 accent-ink"
                  />
                  <span
                    className="h-4 w-4 rounded-full border border-line"
                    style={{ backgroundColor: c.hex }}
                    aria-hidden="true"
                  />
                  {c.value}
                  <span className="text-muted">({c.count})</span>
                </label>
              </li>
            );
          })}
        </ul>
      </FilterGroup>

      <FilterGroup title="Ціна, ₴">
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder={String(facets.priceRange.min)}
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            onBlur={applyPrice}
            onKeyDown={(e) => e.key === "Enter" && applyPrice()}
            aria-label="Ціна від"
            className="w-full border border-line px-2.5 py-2 text-[13px] focus:border-ink focus:outline-none"
          />
          <span className="text-muted">–</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder={String(facets.priceRange.max)}
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            onBlur={applyPrice}
            onKeyDown={(e) => e.key === "Enter" && applyPrice()}
            aria-label="Ціна до"
            className="w-full border border-line px-2.5 py-2 text-[13px] focus:border-ink focus:outline-none"
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Матеріал">
        <ul className="space-y-2">
          {facets.materials.map((m) => (
            <li key={m.value}>
              <label className="flex cursor-pointer items-center gap-2.5 text-[13px]">
                <input
                  type="checkbox"
                  checked={active.materials?.includes(m.value) ?? false}
                  onChange={() => toggleListValue("material", m.value)}
                  className="h-4 w-4 accent-ink"
                />
                {m.value}
                <span className="text-muted">({m.count})</span>
              </label>
            </li>
          ))}
        </ul>
      </FilterGroup>

      <div className="space-y-2 border-t border-line pt-5">
        <label className="flex cursor-pointer items-center gap-2.5 text-[13px]">
          <input
            type="checkbox"
            checked={active.inStockOnly ?? false}
            onChange={() => toggleFlag("instock")}
            className="h-4 w-4 accent-ink"
          />
          Тільки в наявності
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 text-[13px]">
          <input
            type="checkbox"
            checked={active.onSaleOnly ?? false}
            onChange={() => toggleFlag("sale")}
            className="h-4 w-4 accent-ink"
          />
          Зі знижкою
        </label>
      </div>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="text-[12px] uppercase tracking-[0.12em] text-rose-deep underline-offset-4 hover:underline"
        >
          Скинути фільтри ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Кнопка фільтрів (mobile) */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="flex items-center gap-2 border border-line px-4 py-2 text-[13px] lg:hidden"
        aria-expanded={mobileOpen}
      >
        Фільтри
        {activeCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose text-[11px] text-paper">
            {activeCount}
          </span>
        )}
      </button>

      {/* Сайдбар (desktop) */}
      <div className="hidden lg:block">{body}</div>

      {/* Drawer (mobile) */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 lg:hidden" style={{ zIndex: "var(--z-drawer)" }}>
            <motion.button
              type="button"
              aria-label="Закрити фільтри"
              className="absolute inset-0 bg-ink/40"
              variants={backdropFade}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Фільтри"
              variants={drawerPanel}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute inset-y-0 right-0 flex w-[88%] max-w-95 flex-col bg-paper shadow-drawer"
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <span className="text-[14px] font-medium uppercase tracking-[0.12em]">Фільтри</span>
                <button type="button" className="-mr-2 p-2" aria-label="Закрити" onClick={() => setMobileOpen(false)}>
                  <IconClose className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-5">{body}</div>
              <div className="border-t border-line p-4">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="w-full bg-ink py-3 text-[13px] font-medium uppercase tracking-[0.14em] text-paper"
                >
                  Показати результати
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 text-[12px] font-medium uppercase tracking-[0.14em] text-ink">{title}</legend>
      {children}
    </fieldset>
  );
}
