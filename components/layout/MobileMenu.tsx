"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { IconChevronDown, IconClose } from "@/components/ui/icons";
import { backdropFade, drawerPanel } from "@/lib/motion";
import type { NavEntry } from "@/lib/nav";
import { SITE } from "@/lib/site";

/** Мобільне меню-drawer з розкривними рівнями категорій. */
export function MobileMenu({
  open,
  onClose,
  nav,
}: {
  open: boolean;
  onClose: () => void;
  nav: NavEntry[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

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

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 lg:hidden" style={{ zIndex: "var(--z-drawer)" }}>
          <motion.button
            type="button"
            aria-label="Закрити меню"
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
            aria-label="Меню"
            className="absolute inset-y-0 left-0 flex w-[86%] max-w-90 flex-col bg-paper shadow-drawer"
            variants={drawerPanel}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <span className="font-display text-xl tracking-[0.14em]">ANKE</span>
              <button type="button" className="-mr-2 p-2" aria-label="Закрити меню" onClick={onClose}>
                <IconClose className="h-6 w-6" />
              </button>
            </div>
            <nav aria-label="Мобільна навігація" className="flex-1 overflow-y-auto px-5 py-4">
              <ul>
                {nav.map((item) => (
                  <li key={item.href} className="border-b border-line/60 last:border-0">
                    {item.columns?.length ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setExpanded(expanded === item.href ? null : item.href)}
                          aria-expanded={expanded === item.href}
                          className="flex w-full items-center justify-between py-3.5 text-[15px] uppercase tracking-[0.1em] text-ink"
                        >
                          {item.title}
                          <IconChevronDown
                            className={`h-4 w-4 transition-transform ${expanded === item.href ? "rotate-180" : ""}`}
                          />
                        </button>
                        {expanded === item.href && (
                          <ul className="pb-3 pl-3">
                            <li>
                              <Link
                                href={item.href}
                                onClick={onClose}
                                className="block py-2 text-[14px] font-medium text-ink"
                              >
                                Все з розділу «{item.title}»
                              </Link>
                            </li>
                            {item.columns.map((col) => (
                              <li key={col.href}>
                                <Link href={col.href} onClick={onClose} className="block py-2 text-[14px] text-ink">
                                  {col.title}
                                </Link>
                                {col.items.length > 0 && (
                                  <ul className="pl-3">
                                    {col.items.map((leaf) => (
                                      <li key={leaf.href}>
                                        <Link
                                          href={leaf.href}
                                          onClick={onClose}
                                          className="block py-1.5 text-[13px] text-muted"
                                        >
                                          {leaf.title}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`block py-3.5 text-[15px] uppercase tracking-[0.1em] ${
                          item.accent ? "text-rose-deep" : "text-ink"
                        }`}
                      >
                        {item.title}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
              <ul className="mt-6 space-y-2 border-t border-line pt-4">
                <li>
                  <Link href="/vishlist" onClick={onClose} className="block py-1.5 text-[14px] text-ink">
                    Вішліст
                  </Link>
                </li>
                <li>
                  <Link href="/kabinet" onClick={onClose} className="block py-1.5 text-[14px] text-ink">
                    Особистий кабінет
                  </Link>
                </li>
              </ul>
            </nav>
            <div className="border-t border-line px-5 py-4 text-[13px] text-muted">
              <p>{SITE.contacts.phone}</p>
              <p className="mt-1">{SITE.contacts.schedule}</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
