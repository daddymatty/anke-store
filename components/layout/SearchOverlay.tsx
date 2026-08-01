"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconClose, IconSearch } from "@/components/ui/icons";
import { menuReveal, backdropFade } from "@/lib/motion";
import { formatPrice } from "@/lib/money";

type Suggestion = {
  slug: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  image: string | null;
  alt: string;
};

const POPULAR = ["сукня міді", "льон", "костюм", "кашемір", "сумка"];

/** Пошук: панель під хедером, підказки з дебаунсом, фолбек на популярні запити. */
export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (q.trim().length < 2) return;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = (await res.json()) as { items: Suggestion[] };
        setItems(data.items);
        setSearched(true);
      } catch {
        setItems([]);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const changeQuery = (value: string) => {
    setQ(value);
    if (value.trim().length < 2) {
      setItems([]);
      setSearched(false);
    }
  };

  const close = () => {
    setQ("");
    setItems([]);
    setSearched(false);
    onClose();
  };

  const submit = () => {
    if (q.trim().length < 2) return;
    const query = q.trim();
    close();
    router.push(`/poshuk?q=${encodeURIComponent(query)}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Закрити пошук"
            className="fixed inset-0 bg-ink/30"
            style={{ zIndex: "var(--z-megamenu)" }}
            variants={backdropFade}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={close}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Пошук"
            variants={menuReveal}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-x-0 top-0 bg-paper shadow-soft"
            style={{ zIndex: "var(--z-drawer)" }}
          >
            <div className="mx-auto w-full max-w-[860px] px-4 py-6 md:px-8">
              <div className="flex items-center gap-3 border-b border-ink pb-3">
                <IconSearch className="h-5 w-5 shrink-0 text-muted" />
                <input
                  ref={inputRef}
                  type="search"
                  value={q}
                  onChange={(e) => changeQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submit();
                    if (e.key === "Escape") close();
                  }}
                  placeholder="Шукати: сукня, льон, кашемір…"
                  aria-label="Пошук по каталогу"
                  className="w-full bg-transparent text-[16px] focus:outline-none"
                />
                <button type="button" onClick={close} aria-label="Закрити пошук" className="-mr-1 p-1">
                  <IconClose className="h-5 w-5" />
                </button>
              </div>

              {items.length > 0 && (
                <ul className="mt-4 divide-y divide-line">
                  {items.map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={`/product/${s.slug}`}
                        onClick={close}
                        className="flex items-center gap-4 py-2.5 transition-colors hover:bg-beige/50"
                      >
                        {s.image && (
                          <span className="relative block h-16 w-12 shrink-0 overflow-hidden bg-beige">
                            <Image src={s.image} alt={s.alt} fill sizes="48px" className="object-cover" />
                          </span>
                        )}
                        <span className="flex-1 text-[13px]">{s.title}</span>
                        <span className="text-[13px] font-medium">{formatPrice(s.price)}</span>
                      </Link>
                    </li>
                  ))}
                  <li className="pt-3">
                    <button
                      type="button"
                      onClick={submit}
                      className="text-[12px] uppercase tracking-[0.14em] text-rose-deep underline-offset-4 hover:underline"
                    >
                      Всі результати за «{q}» →
                    </button>
                  </li>
                </ul>
              )}

              {searched && items.length === 0 && (
                <p className="mt-4 text-[13px] text-muted">
                  За запитом «{q}» нічого не знайдено. Спробуйте інакше — або погляньте{" "}
                  <Link href="/novynky" onClick={close} className="text-ink underline underline-offset-4">
                    новинки
                  </Link>
                  .
                </p>
              )}

              {!searched && (
                <div className="mt-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Популярні запити</p>
                  <ul className="mt-2.5 flex flex-wrap gap-2">
                    {POPULAR.map((p) => (
                      <li key={p}>
                        <button
                          type="button"
                          onClick={() => setQ(p)}
                          className="border border-line px-3 py-1.5 text-[13px] transition-colors hover:border-ink"
                        >
                          {p}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
