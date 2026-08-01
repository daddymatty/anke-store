"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addToCart } from "@/app/actions/cart";
import { notifyWhenAvailable } from "@/app/actions/notify";
import { toggleWishlist } from "@/app/actions/wishlist";
import { notifyCartChanged, openCartDrawer } from "@/lib/cart-client";
import { notifyWishlistChanged } from "@/lib/wishlist-client";
import { IconHeart } from "@/components/ui/icons";
import type { ColorSibling, SizeStock } from "@/lib/catalog/types";
import { SizeChartModal } from "./SizeChart";

type Props = {
  slug: string;
  sizes: SizeStock[];
  colors: ColorSibling[];
  currentColor: { name: string; hex: string };
  modelParams?: string;
  inStock: boolean;
};

const notifySchema = z.object({
  email: z.email("Вкажіть коректний email"),
});
type NotifyForm = z.infer<typeof notifySchema>;

/**
 * Вибір варіанта: розмір + колір (колір = окремий URL-товар).
 * Розмір без наявності → форма «Повідомити про надходження».
 * «Додати в кошик» підключається до серверного кошика на Етапі 6.
 */
export function VariantPicker({ slug, sizes, colors, currentColor, modelParams, inStock }: Props) {
  const [selected, setSelected] = useState<string | null>(
    sizes.length === 1 && sizes[0].inStock ? sizes[0].size : null,
  );
  const [chartOpen, setChartOpen] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [notifySent, setNotifySent] = useState(false);
  const [addedFlash, setAddedFlash] = useState(false);
  const [, startTransition] = useTransition();

  const selectedStock = sizes.find((s) => s.size === selected);
  const showNotify = (selectedStock && !selectedStock.inStock) || !inStock;
  const isShoes = sizes.some((s) => /^\d+$/.test(s.size));
  const oneSize = sizes.length === 1 && sizes[0].size === "One size";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NotifyForm>({ resolver: zodResolver(notifySchema) });

  const onNotify = handleSubmit(async ({ email }) => {
    const res = await notifyWhenAvailable({ slug, size: selected ?? sizes[0]?.size ?? "", email });
    if (res.ok) setNotifySent(true);
  });

  const onAddToCart = () => {
    if (!oneSize && !selected) {
      setSizeError(true);
      return;
    }
    if (selectedStock && !selectedStock.inStock) return;
    const size = oneSize ? sizes[0].size : selected!;
    startTransition(async () => {
      await addToCart(slug, size, 1);
      notifyCartChanged();
      setAddedFlash(true);
      openCartDrawer();
      setTimeout(() => setAddedFlash(false), 1800);
    });
  };

  const onWishlist = () => {
    startTransition(async () => {
      await toggleWishlist(slug);
      notifyWishlistChanged();
    });
  };

  return (
    <div>
      {/* Кольори (окремі товари для індексації) */}
      {colors.length > 0 && (
        <div className="mt-6">
          <p className="text-[12px] uppercase tracking-[0.14em] text-muted">
            Колір: <span className="text-ink normal-case tracking-normal">{currentColor.name}</span>
          </p>
          <ul className="mt-2.5 flex gap-2">
            <li>
              <span
                aria-current="true"
                title={currentColor.name}
                className="block h-8 w-8 rounded-full border-2 border-ink p-0.5"
              >
                <span className="block h-full w-full rounded-full" style={{ backgroundColor: currentColor.hex }} />
              </span>
            </li>
            {colors.map((c) => (
              <li key={c.productSlug}>
                <Link
                  href={`/product/${c.productSlug}`}
                  title={c.name}
                  aria-label={`Колір ${c.name}`}
                  className="block h-8 w-8 rounded-full border border-line p-0.5 transition-colors hover:border-ink"
                >
                  <span className="block h-full w-full rounded-full" style={{ backgroundColor: c.hex }} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Розміри */}
      {!oneSize && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p id="size-label" className="text-[12px] uppercase tracking-[0.14em] text-muted">
              Розмір
            </p>
            <button
              type="button"
              onClick={() => setChartOpen(true)}
              className="text-[12px] text-muted underline underline-offset-4 transition-colors hover:text-ink"
              data-analytics="size-chart-open"
            >
              Таблиця розмірів
            </button>
          </div>
          <div role="radiogroup" aria-labelledby="size-label" className="mt-2.5 flex flex-wrap gap-2">
            {sizes.map((s) => {
              const isSel = selected === s.size;
              return (
                <button
                  key={s.size}
                  type="button"
                  role="radio"
                  aria-checked={isSel}
                  onClick={() => {
                    setSelected(s.size);
                    setSizeError(false);
                    setNotifySent(false);
                  }}
                  className={`min-w-12 border px-3 py-2.5 text-[13px] transition-colors ${
                    isSel
                      ? "border-ink bg-ink text-paper"
                      : s.inStock
                        ? "border-line hover:border-ink"
                        : "border-line text-muted line-through opacity-60 hover:opacity-90"
                  }`}
                >
                  {s.size}
                </button>
              );
            })}
          </div>
          {sizeError && (
            <p role="alert" className="mt-2 text-[12.5px] text-rose-deep">
              Оберіть розмір
            </p>
          )}
          {modelParams && <p className="mt-2.5 text-[12.5px] text-muted">{modelParams}</p>}
        </div>
      )}

      {/* Повідомити про надходження */}
      {showNotify && (
        <div className="mt-5 border border-line bg-beige/50 p-4">
          {notifySent ? (
            <p className="text-[13px]">
              Дякуємо! Повідомимо на пошту, щойно розмір {selected ?? ""} з&apos;явиться.
            </p>
          ) : (
            <>
              <p className="text-[13px] font-medium">
                {selected ? `Розміру ${selected} зараз немає` : "Товару немає в наявності"}
              </p>
              <p className="mt-1 text-[12.5px] text-muted">Залиште email — повідомимо про надходження.</p>
              <form onSubmit={onNotify} className="mt-3 flex gap-2">
                <input
                  type="email"
                  placeholder="you@example.com"
                  aria-label="Email для повідомлення"
                  {...register("email")}
                  className="w-full border border-line bg-paper px-3 py-2.5 text-[13px] focus:border-ink focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="whitespace-nowrap bg-ink px-4 py-2.5 text-[12px] font-medium uppercase tracking-[0.12em] text-paper disabled:opacity-50"
                >
                  Повідомити
                </button>
              </form>
              {errors.email && (
                <p role="alert" className="mt-1.5 text-[12.5px] text-rose-deep">
                  {errors.email.message}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="mt-7 flex gap-2.5">
        <button
          type="button"
          onClick={onAddToCart}
          disabled={Boolean(selectedStock && !selectedStock.inStock)}
          className="h-13 flex-1 bg-ink text-[14px] font-medium uppercase tracking-[0.14em] text-paper transition-colors hover:bg-ink/85 active:scale-[0.99] disabled:opacity-40"
          data-analytics="add-to-cart"
        >
          {addedFlash ? "Додано ✓" : "Додати в кошик"}
        </button>
        <button
          type="button"
          onClick={onWishlist}
          aria-label="Додати у вішліст"
          className="flex h-13 w-13 items-center justify-center border border-line transition-colors hover:border-ink"
        >
          <IconHeart className="h-5 w-5" />
        </button>
      </div>

      {/* Sticky CTA на мобільному */}
      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-paper p-3 lg:hidden" style={{ zIndex: "var(--z-header)" }}>
        <button
          type="button"
          onClick={onAddToCart}
          disabled={Boolean(selectedStock && !selectedStock.inStock)}
          className="h-12 w-full bg-ink text-[13px] font-medium uppercase tracking-[0.14em] text-paper disabled:opacity-40"
        >
          {addedFlash ? "Додано ✓" : "Додати в кошик"}
        </button>
      </div>

      <SizeChartModal
        open={chartOpen}
        onClose={() => setChartOpen(false)}
        kind={isShoes ? "shoes" : "clothes"}
        modelParams={modelParams}
      />
    </div>
  );
}
