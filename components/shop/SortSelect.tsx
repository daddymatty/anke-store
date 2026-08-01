"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { SortKey } from "@/lib/catalog/types";

const OPTIONS: { value: SortKey; label: string }[] = [
  { value: "new", label: "Новинки" },
  { value: "popular", label: "Популярність" },
  { value: "price-asc", label: "Ціна: за зростанням" },
  { value: "price-desc", label: "Ціна: за спаданням" },
];

export function SortSelect({ current }: { current: SortKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const onChange = (value: string) => {
    const q = new URLSearchParams(sp.toString());
    if (value === "new") q.delete("sort");
    else q.set("sort", value);
    q.delete("page");
    q.delete("limit");
    router.push(`${pathname}${q.size ? `?${q}` : ""}`, { scroll: false });
  };

  return (
    <label className="flex items-center gap-2 text-[13px]">
      <span className="text-muted">Сортування:</span>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer border-0 bg-transparent py-1 pr-6 text-[13px] font-medium focus:ring-0"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
