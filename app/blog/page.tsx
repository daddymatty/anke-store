import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { pageAlternates } from "@/lib/seo/meta";
import { BLOG } from "@/content/blog";

export const metadata: Metadata = {
  title: "Блог про стиль і догляд за одягом",
  description:
    "Блог ANKE: як обирати і поєднувати речі, доглядати за тканинами і збирати капсульний гардероб. Поради стилістів без води.",
  alternates: pageAlternates("/blog"),
};

export default function BlogPage() {
  return (
    <Container className="py-6 md:py-10">
      <Breadcrumbs items={[{ title: "Блог", href: "/blog" }]} />
      <h1 className="mt-5 font-display text-display-sm font-light md:text-display">Блог</h1>
      <p className="mt-2 max-w-xl text-[14px] text-muted">
        Про стиль, тканини і догляд — коротко і по суті, від стилістів ANKE.
      </p>
      <ul className="mt-10 grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
        {BLOG.map((a) => (
          <li key={a.slug}>
            <Link href={`/blog/${a.slug}`} className="group block">
              <span className="relative block aspect-[3/2] overflow-hidden bg-beige">
                <Image
                  src={`/demo/${a.tone}.jpg`}
                  alt={a.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </span>
              <time dateTime={a.datePublished} className="mt-4 block text-[12px] text-muted">
                {new Date(a.datePublished).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" })}{" "}
                · {a.minutes} хв
              </time>
              <h2 className="mt-1.5 font-display text-xl font-light leading-snug group-hover:text-rose-deep">
                {a.title}
              </h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{a.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
