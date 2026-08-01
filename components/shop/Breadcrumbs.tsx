import Link from "next/link";

export type Crumb = { title: string; href: string };

/** Візуальні хлібні крихти. JSON-LD BreadcrumbList додає SEO-шар (Етап 8). */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Ви тут" className="text-[12px] text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/" className="transition-colors hover:text-ink">
            Головна
          </Link>
        </li>
        {items.map((c, i) => (
          <li key={c.href} className="flex items-center gap-1.5">
            <span aria-hidden="true">/</span>
            {i === items.length - 1 ? (
              <span aria-current="page" className="text-ink">
                {c.title}
              </span>
            ) : (
              <Link href={c.href} className="transition-colors hover:text-ink">
                {c.title}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
