"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { IconClose } from "@/components/ui/icons";
import { backdropFade, modalPanel } from "@/lib/motion";

const CLOTHES_ROWS = [
  ["XS", "42", "82–86", "62–66", "88–92"],
  ["S", "44", "86–90", "66–70", "92–96"],
  ["M", "46", "90–94", "70–74", "96–100"],
  ["L", "48", "94–98", "74–78", "100–104"],
  ["XL", "50", "98–102", "78–84", "104–110"],
];

const SHOES_ROWS = [
  ["36", "23,5"],
  ["37", "24"],
  ["38", "24,5–25"],
  ["39", "25,5"],
  ["40", "26"],
];

/** Модалка «Таблиця розмірів»: одяг або взуття залежно від типу розмірів. */
export function SizeChartModal({
  open,
  onClose,
  kind,
  modelParams,
}: {
  open: boolean;
  onClose: () => void;
  kind: "clothes" | "shoes";
  modelParams?: string;
}) {
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
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: "var(--z-modal)" }}>
          <motion.button
            type="button"
            aria-label="Закрити"
            variants={backdropFade}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-ink/45"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Таблиця розмірів"
            variants={modalPanel}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-lg bg-paper p-6 shadow-soft md:p-8"
          >
            <button type="button" onClick={onClose} aria-label="Закрити" className="absolute right-3 top-3 p-2">
              <IconClose className="h-5 w-5" />
            </button>
            <h2 className="font-display text-xl font-light">Таблиця розмірів</h2>
            {modelParams && <p className="mt-2 text-[13px] text-muted">{modelParams}</p>}
            <div className="mt-5 overflow-x-auto">
              {kind === "clothes" ? (
                <table className="w-full border-collapse text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-ink text-[11px] uppercase tracking-[0.1em]">
                      <th className="py-2 pr-3">Розмір</th>
                      <th className="py-2 pr-3">UA</th>
                      <th className="py-2 pr-3">Груди, см</th>
                      <th className="py-2 pr-3">Талія, см</th>
                      <th className="py-2">Стегна, см</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CLOTHES_ROWS.map((row) => (
                      <tr key={row[0]} className="border-b border-line">
                        {row.map((cell, i) => (
                          <td key={i} className={`py-2.5 ${i < row.length - 1 ? "pr-3" : ""} ${i === 0 ? "font-medium" : ""}`}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full border-collapse text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-ink text-[11px] uppercase tracking-[0.1em]">
                      <th className="py-2 pr-3">Розмір EU</th>
                      <th className="py-2">Довжина устілки, см</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SHOES_ROWS.map((row) => (
                      <tr key={row[0]} className="border-b border-line">
                        <td className="py-2.5 pr-3 font-medium">{row[0]}</td>
                        <td className="py-2.5">{row[1]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <p className="mt-4 text-[12.5px] leading-relaxed text-muted">
              Сумніваєтесь між двома розмірами? Напишіть нам у Telegram — підкажемо по конкретній моделі.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
