"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { getCartLines, setCartQty } from "@/app/actions/cart";
import { IconClose } from "@/components/ui/icons";
import { backdropFade, drawerPanel } from "@/lib/motion";
import { formatPrice } from "@/lib/money";
import {
  getCartServerSnapshot,
  getCartSnapshot,
  notifyCartChanged,
  subscribeCart,
} from "@/lib/cart-client";

/**
 * Drawer кошика (справа): позиції, кількість, прогрес до безкоштовної доставки,
 * апсейл і перехід у checkout. Дані позицій тягне server action-ами,
 * тригер оновлення — зміна cookie (useSyncExternalStore).
 */

type DrawerItem = {
  slug: string;
  size: string;
  qty: number;
  title: string;
  price: number;
  image: string;
  alt: string;
};

export function CartDrawer({
  open,
  onClose,
  freeShippingFrom,
}: {
  open: boolean;
  onClose: () => void;
  freeShippingFrom: number;
}) {
  const cartRaw = useSyncExternalStore(subscribeCart, getCartSnapshot, getCartServerSnapshot);
  const [items, setItems] = useState<DrawerItem[] | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // Підвантаження деталей позицій (назви/фото/ціни) — за зміни cookie або відкриття
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      const lines = await getCartLines();
      const res = await fetch("/api/cart-items", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lines }),
      });
      const data = (await res.json()) as { items: DrawerItem[] };
      if (!cancelled) setItems(data.items);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, cartRaw]);

  const subtotal = (items ?? []).reduce((a, i) => a + i.price * i.qty, 0);
  const progress = Math.min(1, subtotal / freeShippingFrom);
  const left = Math.max(0, freeShippingFrom - subtotal);

  const changeQty = (slug: string, size: string, qty: number) => {
    startTransition(async () => {
      await setCartQty(slug, size, qty);
      notifyCartChanged();
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0" style={{ zIndex: "var(--z-drawer)" }}>
          <motion.button
            type="button"
            aria-label="Закрити кошик"
            className="absolute inset-0 bg-ink/40"
            variants={backdropFade}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Кошик"
            variants={drawerPanel}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-y-0 right-0 flex w-full max-w-105 flex-col bg-paper shadow-drawer"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-[14px] font-medium uppercase tracking-[0.14em]">Кошик</h2>
              <button type="button" className="-mr-2 p-2" aria-label="Закрити кошик" onClick={onClose}>
                <IconClose className="h-6 w-6" />
              </button>
            </div>

            {/* Прогрес безкоштовної доставки */}
            <div className="border-b border-line px-5 py-3.5">
              <p className="text-[12.5px] text-muted">
                {left > 0 ? (
                  <>
                    Ще <span className="font-medium text-ink">{formatPrice(left)}</span> — і доставка
                    безкоштовна
                  </>
                ) : (
                  <span className="font-medium text-ink">Доставка безкоштовна 🎉</span>
                )}
              </p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-beige">
                <div
                  className="h-full origin-left rounded-full bg-rose transition-transform duration-500"
                  style={{ transform: `scaleX(${progress})` }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5">
              {items === null ? (
                <p className="py-10 text-center text-[13px] text-muted">Завантаження…</p>
              ) : items.length === 0 ? (
                <div className="py-14 text-center">
                  <p className="font-display text-xl font-light">Кошик порожній</p>
                  <Link
                    href="/novynky"
                    onClick={onClose}
                    className="mt-5 inline-block border border-ink px-7 py-2.5 text-[12px] font-medium uppercase tracking-[0.14em] transition-colors hover:bg-ink hover:text-paper"
                  >
                    До новинок
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-line">
                  {items.map((item) => (
                    <li key={`${item.slug}-${item.size}`} className="flex gap-4 py-4">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={onClose}
                        className="relative block h-28 w-20 shrink-0 overflow-hidden bg-beige"
                      >
                        <Image src={item.image} alt={item.alt} fill sizes="80px" className="object-cover" />
                      </Link>
                      <div className="flex flex-1 flex-col">
                        <Link href={`/product/${item.slug}`} onClick={onClose} className="text-[13px] leading-snug">
                          {item.title}
                        </Link>
                        <p className="mt-0.5 text-[12px] text-muted">Розмір: {item.size}</p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center border border-line">
                            <button
                              type="button"
                              aria-label="Менше"
                              className="px-2.5 py-1 text-[15px]"
                              onClick={() => changeQty(item.slug, item.size, item.qty - 1)}
                            >
                              −
                            </button>
                            <span className="min-w-7 text-center text-[13px]">{item.qty}</span>
                            <button
                              type="button"
                              aria-label="Більше"
                              className="px-2.5 py-1 text-[15px]"
                              onClick={() => changeQty(item.slug, item.size, item.qty + 1)}
                            >
                              +
                            </button>
                          </div>
                          <span className="text-[13px] font-medium">{formatPrice(item.price * item.qty)}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items !== null && items.length > 0 && (
              <div className="border-t border-line p-5">
                <div className="flex items-center justify-between text-[14px]">
                  <span>Разом</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <p className="mt-1 text-[11.5px] text-muted">Доставка і промокод — на кроці оформлення</p>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="mt-4 block w-full bg-ink py-3.5 text-center text-[13px] font-medium uppercase tracking-[0.14em] text-paper transition-colors hover:bg-ink/85"
                >
                  Оформити замовлення
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
