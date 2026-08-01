"use client";

import { useState, type ReactNode } from "react";
import { IconChevronDown } from "./icons";

/**
 * Акордеон карток товару (склад, догляд, доставка, повернення).
 * Нативна доступність: button[aria-expanded] + region.
 */
export function Accordion({
  items,
  defaultOpen,
}: {
  items: { id: string; title: string; content: ReactNode }[];
  defaultOpen?: string;
}) {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null);

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item) => {
        const isOpen = open === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              aria-controls={`acc-${item.id}`}
              className="flex w-full items-center justify-between py-4 text-left text-[13px] font-medium uppercase tracking-[0.12em]"
            >
              {item.title}
              <IconChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
              <div id={`acc-${item.id}`} role="region" className="pb-5 text-[13.5px] leading-relaxed text-muted">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
