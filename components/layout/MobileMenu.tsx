"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { IconClose } from "@/components/ui/icons";
import { backdropFade, drawerPanel } from "@/lib/motion";
import { NAV, SITE } from "@/lib/site";

/** Мобільне меню-drawer (зліва). Фокус-пастка і повна дерево-навігація — Етап 4. */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
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
            style={{ x: 0 }}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <span className="font-display text-xl tracking-[0.14em]">ANKE</span>
              <button type="button" className="-mr-2 p-2" aria-label="Закрити меню" onClick={onClose}>
                <IconClose className="h-6 w-6" />
              </button>
            </div>
            <nav aria-label="Мобільна навігація" className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="space-y-1">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`block py-3 text-[15px] uppercase tracking-[0.1em] ${
                        item.accent ? "text-rose-deep" : "text-ink"
                      }`}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
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
