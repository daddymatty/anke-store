"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toggleWishlist } from "@/app/actions/wishlist";
import { IconClose, IconHeart } from "@/components/ui/icons";
import { backdropFade, modalPanel } from "@/lib/motion";
import { formatPrice } from "@/lib/money";
import {
  getWishlistServerSnapshot,
  getWishlistSnapshot,
  notifyWishlistChanged,
  subscribeWishlist,
  wishlistIncludes,
} from "@/lib/wishlist-client";
import type { ProductCard } from "@/lib/catalog/types";

/**
 * Клієнтські дії поверх серверної картки: сердечко вішліста + швидкий перегляд.
 * Рендериться абсолютом усередині relative-контейнера картки.
 */
export function CardActions({ product }: { product: ProductCard }) {
  const wishlistRaw = useSyncExternalStore(
    subscribeWishlist,
    getWishlistSnapshot,
    getWishlistServerSnapshot,
  );
  const inWishlist = wishlistIncludes(wishlistRaw, product.slug);
  const [quickOpen, setQuickOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const onHeart = () => {
    if (pending) return;
    startTransition(async () => {
      await toggleWishlist(product.slug);
      notifyWishlistChanged();
    });
  };

  return (
    <>
      {/* Оверлей прив'язаний до зони фото (та сама пропорція 3:4 від верху картки) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 aspect-[3/4]">
        <button
          type="button"
          onClick={onHeart}
          aria-label={inWishlist ? "Прибрати з вішліста" : "Додати у вішліст"}
          aria-pressed={inWishlist}
          className="pointer-events-auto absolute right-2.5 top-2.5 rounded-full bg-paper/80 p-2 backdrop-blur-sm transition-colors hover:bg-paper"
        >
          <IconHeart
            className={`h-[18px] w-[18px] transition-colors ${
              inWishlist ? "fill-rose-deep stroke-rose-deep" : ""
            }`}
          />
        </button>

        <button
          type="button"
          onClick={() => setQuickOpen(true)}
          className="pointer-events-auto absolute inset-x-0 bottom-0 hidden bg-paper/90 py-2.5 text-center text-[12px] uppercase tracking-[0.12em] opacity-0 backdrop-blur-sm transition-opacity duration-200 focus-visible:opacity-100 group-hover:opacity-100 lg:block"
        >
          Швидкий перегляд
        </button>
      </div>

      <AnimatePresence>
        {quickOpen && <QuickView product={product} onClose={() => setQuickOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

function QuickView({ product, onClose }: { product: ProductCard; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: "var(--z-modal)" }}>
      <motion.button
        type="button"
        aria-label="Закрити"
        className="absolute inset-0 bg-ink/45"
        variants={backdropFade}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={product.title}
        variants={modalPanel}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative grid w-full max-w-3xl grid-cols-1 overflow-hidden bg-paper shadow-soft md:grid-cols-2"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрити"
          className="absolute right-3 top-3 z-10 rounded-full bg-paper/80 p-2"
        >
          <IconClose className="h-5 w-5" />
        </button>
        <div className="relative aspect-[3/4] bg-beige">
          <Image
            src={product.images[0].url}
            alt={product.images[0].alt}
            fill
            sizes="(max-width: 768px) 100vw, 380px"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col p-6 md:p-8">
          <h2 className="font-display text-xl font-light leading-snug">{product.title}</h2>
          <p className="mt-3 flex items-baseline gap-2">
            <span className="text-lg font-medium">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <s className="text-[13px] text-muted">{formatPrice(product.compareAtPrice)}</s>
            )}
          </p>
          <div className="mt-6">
            <p className="mb-2 text-[12px] uppercase tracking-[0.14em] text-muted">Розмір</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <span
                  key={s.size}
                  className={`min-w-11 border px-2.5 py-2 text-center text-[12px] ${
                    s.inStock ? "border-line" : "border-line text-muted line-through opacity-50"
                  }`}
                >
                  {s.size}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-auto pt-8">
            <Link
              href={`/product/${product.slug}`}
              className="block w-full bg-ink py-3.5 text-center text-[13px] font-medium uppercase tracking-[0.14em] text-paper transition-colors hover:bg-ink/85"
              onClick={onClose}
            >
              Переглянути товар
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
