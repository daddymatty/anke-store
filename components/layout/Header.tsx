"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { IconBag, IconHeart, IconMenu, IconSearch, IconUser } from "@/components/ui/icons";
import type { NavEntry } from "@/lib/nav";
import { MegaMenu } from "./MegaMenu";
import { MobileMenu } from "./MobileMenu";
import { SearchOverlay } from "./SearchOverlay";

/**
 * Sticky-хедер: стискається на скролі, мегаменю по hover/focus,
 * пошук-оверлей, іконки вішліста/кабінета/кошика.
 * Навігація приходить з layout (дерево категорій каталогу).
 */
export function Header({ nav }: { nav: NavEntry[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [megaFor, setMegaFor] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const activeMega = nav.find((n) => n.href === megaFor && n.columns?.length);

  return (
    <header
      className={`sticky top-0 bg-paper/95 backdrop-blur-sm transition-[box-shadow] duration-200 ${
        scrolled ? "shadow-[0_1px_0_var(--color-line)]" : ""
      }`}
      style={{ zIndex: "var(--z-header)" }}
      onMouseLeave={() => setMegaFor(null)}
    >
      <div className="relative mx-auto flex w-full max-w-[1440px] items-center px-4 md:px-8 xl:px-12">
        {/* Мобільний бургер */}
        <button
          type="button"
          className="-ml-2 p-2 lg:hidden"
          aria-label="Відкрити меню"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <IconMenu className="h-6 w-6" />
        </button>

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
        <div className="flex items-center justify-end gap-1 md:gap-2">
          <button type="button" className="p-2" aria-label="Пошук" onClick={() => setSearchOpen(true)}>
            <IconSearch className="h-[22px] w-[22px]" />
          </button>
          <Link href="/kabinet" className="hidden p-2 md:block" aria-label="Особистий кабінет">
            <IconUser className="h-[22px] w-[22px]" />
          </Link>
          <Link href="/vishlist" className="hidden p-2 md:block" aria-label="Вішліст">
            <IconHeart className="h-[22px] w-[22px]" />
          </Link>
          <button type="button" className="relative p-2" aria-label="Кошик">
            <IconBag className="h-[22px] w-[22px]" />
            {/* Лічильник з'явиться з кошиком (Етап 6) */}
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

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} nav={nav} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
