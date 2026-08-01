"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";

// Важкі оверлеї не входять у перший бандл — довантажуються при першому відкритті
const CartDrawer = dynamic(() => import("@/components/shop/CartDrawer").then((m) => m.CartDrawer), { ssr: false });
const SearchOverlayLazy = dynamic(() => import("./SearchOverlay").then((m) => m.SearchOverlay), { ssr: false });
const MobileMenuLazy = dynamic(() => import("./MobileMenu").then((m) => m.MobileMenu), { ssr: false });
import { Logo } from "@/components/ui/Logo";
import { Portal } from "@/components/ui/Portal";
import { IconBag, IconHeart, IconMenu, IconSearch, IconUser } from "@/components/ui/icons";
import {
  cartCount,
  getCartServerSnapshot,
  getCartSnapshot,
  subscribeCart,
} from "@/lib/cart-client";
import type { NavEntry } from "@/lib/nav";
import { SITE } from "@/lib/site";
import { MegaMenu } from "./MegaMenu";

/**
 * Sticky-хедер: стискається на скролі, мегаменю по hover/focus,
 * пошук-оверлей, іконки вішліста/кабінета/кошика.
 * Навігація приходить з layout (дерево категорій каталогу).
 */
export function Header({ nav }: { nav: NavEntry[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [megaFor, setMegaFor] = useState<string | null>(null);
  // Прапорці «хоч раз відкривали» — щоб чанк оверлея не тягнувся до взаємодії
  const [everCart, setEverCart] = useState(false);
  const [everSearch, setEverSearch] = useState(false);
  const [everMenu, setEverMenu] = useState(false);
  const count = cartCount(
    useSyncExternalStore(subscribeCart, getCartSnapshot, getCartServerSnapshot),
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const onOpenCart = () => {
      setEverCart(true);
      setCartOpen(true);
    };
    window.addEventListener("anke:open-cart", onOpenCart);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("anke:open-cart", onOpenCart);
    };
  }, []);

  const activeMega = nav.find((n) => n.href === megaFor && n.columns?.length);

  return (
    <header
      // Без backdrop-filter: він створює containing block, і всі fixed-оверлеї
      // (меню, пошук, кошик) обрізаються до висоти хедера.
      className={`sticky top-0 bg-paper transition-[box-shadow] duration-200 ${
        scrolled ? "shadow-[0_1px_0_var(--color-line)]" : ""
      }`}
      style={{ zIndex: "var(--z-header)" }}
      onMouseLeave={() => setMegaFor(null)}
    >
      <div className="relative mx-auto flex w-full max-w-[1440px] items-center px-4 md:px-8 xl:px-12">
        {/* Мобільний бургер. flex-1 з обох боків — щоб лого стояло по центру екрана */}
        <div className="flex flex-1 items-center lg:hidden">
          <button
            type="button"
            className="-ml-2 p-2"
            aria-label="Відкрити меню"
            aria-expanded={menuOpen}
            onClick={() => {
              setEverMenu(true);
              setMenuOpen(true);
            }}
          >
            <IconMenu className="h-6 w-6" />
          </button>
        </div>

        {/* Лого: full на desktop, solo на мобільному */}
        <Link
          href="/"
          aria-label="ANKE — на головну"
          className={`mx-auto flex-shrink-0 text-ink transition-[padding] duration-200 lg:mx-0 lg:mr-10 ${
            scrolled ? "py-2.5" : "py-4"
          }`}
          onMouseEnter={() => setMegaFor(null)}
        >
          <Logo
            variant="full"
            className={`hidden transition-[height] duration-200 lg:block ${scrolled ? "h-9" : "h-11"}`}
          />
          <Logo variant="solo" className="h-6 lg:hidden" />
        </Link>

        {/* Навігація (desktop) */}
        <nav aria-label="Головна навігація" className="hidden flex-1 self-stretch lg:block">
          <ul className="flex h-full items-stretch gap-6 xl:gap-7">
            {nav.map((item) => (
              <li key={item.href} className="flex items-stretch">
                <Link
                  href={item.href}
                  onMouseEnter={() => setMegaFor(item.columns?.length ? item.href : null)}
                  onFocus={() => setMegaFor(item.columns?.length ? item.href : null)}
                  aria-expanded={item.columns?.length ? megaFor === item.href : undefined}
                  className={`group relative flex items-center text-[13px] font-normal uppercase tracking-[0.12em] transition-colors ${
                    item.accent ? "text-rose-deep" : "text-ink hover:text-rose-deep"
                  }`}
                >
                  {item.title}
                  <span className="absolute inset-x-0 bottom-3 h-px origin-left scale-x-0 bg-current transition-transform duration-300 group-hover:scale-x-100" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Дії */}
        <div className="flex flex-1 items-center justify-end gap-1 md:gap-2 lg:flex-none">
          <button
            type="button"
            className="p-2"
            aria-label="Пошук"
            onClick={() => {
              setEverSearch(true);
              setSearchOpen(true);
            }}
          >
            <IconSearch className="h-[22px] w-[22px]" />
          </button>
          <Link href="/kabinet" className="hidden p-2 md:block" aria-label="Особистий кабінет">
            <IconUser className="h-[22px] w-[22px]" />
          </Link>
          <Link href="/vishlist" className="hidden p-2 md:block" aria-label="Вішліст">
            <IconHeart className="h-[22px] w-[22px]" />
          </Link>
          <button
            type="button"
            className="relative p-2"
            aria-label={count > 0 ? `Кошик, ${count} тов.` : "Кошик"}
            onClick={() => {
              setEverCart(true);
              setCartOpen(true);
            }}
          >
            <IconBag className="h-[22px] w-[22px]" />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  aria-hidden="true"
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                  className="absolute -right-0.5 top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose px-1 text-[10px] font-medium text-paper"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Мегаменю */}
        <MegaMenu
          open={Boolean(activeMega)}
          columns={activeMega?.columns ?? []}
          parentHref={activeMega?.href ?? "/"}
          parentTitle={activeMega?.title ?? ""}
        />
      </div>

      {/* Оверлеї — у <body>: усередині хедера вони лишалися б у його stacking context */}
      <Portal>
        {everMenu && <MobileMenuLazy open={menuOpen} onClose={() => setMenuOpen(false)} nav={nav} />}
        {everSearch && <SearchOverlayLazy open={searchOpen} onClose={() => setSearchOpen(false)} />}
        {everCart && (
          <CartDrawer
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            freeShippingFrom={SITE.freeShippingFrom * 100}
          />
        )}
      </Portal>
    </header>
  );
}
