import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { pageAlternates } from "@/lib/seo/meta";

export const metadata: Metadata = {
  title: "Таблиця розмірів",
  description:
    "Таблиця розмірів ANKE: обміри в сантиметрах для одягу (XS–XL) і взуття (36–40), поради з вибору розміру.",
  alternates: pageAlternates("/rozmirna-sitka"),
};

const CLOTHES = [
  ["XS", "42", "82–86", "62–66", "88–92"],
  ["S", "44", "86–90", "66–70", "92–96"],
  ["M", "46", "90–94", "70–74", "96–100"],
  ["L", "48", "94–98", "74–78", "100–104"],
  ["XL", "50", "98–102", "78–84", "104–110"],
];

const SHOES = [
  ["36", "23,5"],
  ["37", "24"],
  ["38", "24,5–25"],
  ["39", "25,5"],
  ["40", "26"],
];

export default function SizeGuidePage() {
  return (
    <Container className="py-6 md:py-10">
      <Breadcrumbs items={[{ title: "Таблиця розмірів", href: "/rozmirna-sitka" }]} />
      <h1 className="mt-5 font-display text-display-sm font-light md:text-display">Таблиця розмірів</h1>
      <p className="mt-2 max-w-xl text-[14px] text-muted">
        Міряйте по білизні, не натягуючи сантиметр. Якщо ви між розмірами — для облягаючих силуетів
        беріть менший, для вільних — більший.
      </p>

      <div className="mt-10 grid max-w-3xl gap-12 md:grid-cols-[3fr_2fr]">
        <section aria-labelledby="sg-clothes">
          <h2 id="sg-clothes" className="text-[13px] font-medium uppercase tracking-[0.16em]">Одяг</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-left text-[13.5px]">
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
                {CLOTHES.map((row) => (
                  <tr key={row[0]} className="border-b border-line">
                    {row.map((cell, i) => (
                      <td key={i} className={`py-2.5 ${i < 4 ? "pr-3" : ""} ${i === 0 ? "font-medium" : ""}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="sg-shoes">
          <h2 id="sg-shoes" className="text-[13px] font-medium uppercase tracking-[0.16em]">Взуття</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-ink text-[11px] uppercase tracking-[0.1em]">
                  <th className="py-2 pr-3">Розмір EU</th>
                  <th className="py-2">Устілка, см</th>
                </tr>
              </thead>
              <tbody>
                {SHOES.map((row) => (
                  <tr key={row[0]} className="border-b border-line">
                    <td className="py-2.5 pr-3 font-medium">{row[0]}</td>
                    <td className="py-2.5">{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <p className="mt-10 max-w-xl text-[13.5px] text-muted">
        Сумніваєтесь між двома розмірами? Напишіть нам у Telegram — стилісти підкажуть по конкретній
        моделі, бо посадка в різних тканинах відрізняється.
      </p>
    </Container>
  );
}
