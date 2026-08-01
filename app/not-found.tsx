import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { NAV } from "@/lib/site";

/** Кастомна 404: пошук + популярні категорії (розділ 4 ТЗ). */
export default function NotFound() {
  return (
    <Container className="py-20 text-center md:py-28">
      <p className="font-display text-[100px] font-light leading-none text-beige-deep md:text-[140px]">404</p>
      <h1 className="mt-4 font-display text-display-sm font-light">Такої сторінки немає</h1>
      <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-muted">
        Можливо, товар розпродано або посилання застаріло. Скористайтесь пошуком — або починайте з
        улюблених розділів.
      </p>

      <form action="/poshuk" method="GET" className="mx-auto mt-8 flex max-w-md gap-2">
        <input
          type="search"
          name="q"
          placeholder="Шукати: сукня, льон, кашемір…"
          aria-label="Пошук по каталогу"
          className="w-full border border-line px-4 py-3 text-[14px] focus:border-ink focus:outline-none"
        />
        <button
          type="submit"
          className="whitespace-nowrap bg-ink px-6 text-[12px] font-medium uppercase tracking-[0.12em] text-paper"
        >
          Знайти
        </button>
      </form>

      <ul className="mt-8 flex flex-wrap justify-center gap-2">
        {NAV.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`block border px-4 py-2 text-[13px] transition-colors ${
                item.accent
                  ? "border-rose-soft bg-rose-soft text-rose-deep hover:bg-rose hover:text-paper"
                  : "border-line hover:border-ink"
              }`}
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
