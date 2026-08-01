"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import type { NavColumn } from "@/lib/nav";
import { menuReveal } from "@/lib/motion";

/**
 * Мегаменю категорії: колонки підкатегорій + промо-блок.
 * Відкривається з Header по hover/focus; закриття керує Header.
 */
export function MegaMenu({
  open,
  columns,
  parentHref,
  parentTitle,
}: {
  open: boolean;
  columns: NavColumn[];
  parentHref: string;
  parentTitle: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={menuReveal}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute inset-x-0 top-full border-t border-line bg-paper shadow-soft"
          style={{ zIndex: "var(--z-megamenu)" }}
        >
          <div className="mx-auto grid w-full max-w-[1440px] grid-cols-[1fr_300px] gap-10 px-4 py-10 md:px-8 xl:px-12">
            <div className="grid grid-cols-3 gap-8 xl:grid-cols-4">
              {columns.map((col) => (
                <div key={col.href}>
                  <Link
                    href={col.href}
                    className="text-[13px] font-medium uppercase tracking-[0.12em] text-ink hover:text-rose-deep"
                  >
                    {col.title}
                  </Link>
                  {col.items.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {col.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className="text-[13px] text-muted transition-colors hover:text-ink"
                          >
                            {item.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
              <div className="self-end">
                <Link
                  href={parentHref}
                  className="text-[12px] uppercase tracking-[0.14em] text-rose-deep underline-offset-4 hover:underline"
                >
                  Весь розділ «{parentTitle}»
                </Link>
              </div>
            </div>

            {/* Промо-блок (керується з адмінки на Етапі 12) */}
            <Link href="/novynky" className="group relative hidden aspect-[3/4] max-h-80 overflow-hidden bg-beige lg:block">
              <Image
                src="/demo/powder.jpg"
                alt="Нова колекція ANKE"
                fill
                sizes="300px"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/50 to-transparent p-4 pt-10 text-[13px] font-medium uppercase tracking-[0.14em] text-paper">
                Нова колекція →
              </span>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
