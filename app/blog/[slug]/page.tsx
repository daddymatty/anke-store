import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { renderParagraph } from "@/lib/md";
import { articleJsonLd, breadcrumbsJsonLd } from "@/lib/seo/jsonld";
import { pageAlternates } from "@/lib/seo/meta";
import { BLOG, getArticle } from "@/content/blog";

export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return BLOG.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    alternates: pageAlternates(`/blog/${article.slug}`),
    openGraph: { images: [{ url: `/demo/${article.tone}.jpg` }], type: "article" },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const crumbs = [
    { title: "Блог", href: "/blog" },
    { title: article.title, href: `/blog/${article.slug}` },
  ];

  return (
    <Container className="py-6 md:py-10">
      <JsonLd
        data={[
          articleJsonLd({
            title: article.title,
            description: article.description,
            slug: article.slug,
            datePublished: article.datePublished,
            image: `/demo/${article.tone}.jpg`,
          }),
          breadcrumbsJsonLd(crumbs),
        ]}
      />
      <Breadcrumbs items={crumbs} />
      <article className="mx-auto mt-8 max-w-2xl">
        <time dateTime={article.datePublished} className="block text-[12px] text-muted">
          {new Date(article.datePublished).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" })}{" "}
          · {article.minutes} хв читання
        </time>
        <h1 className="mt-3 font-display text-display-sm font-light leading-tight md:text-display">
          {article.title}
        </h1>
        <div className="relative mt-8 aspect-[2/1] overflow-hidden bg-beige">
          <Image
            src={`/demo/${article.tone}.jpg`}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 672px"
            className="object-cover"
          />
        </div>
        <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-ink/90">
          {article.body.map((par, i) => (
            <p key={i}>{renderParagraph(par)}</p>
          ))}
        </div>

        <aside className="mt-12 border-t border-line pt-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-muted">
            З цієї статті
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {article.relatedCategories.map((c) => (
              <li key={c.href}>
                <Link
                  href={c.href}
                  className="block border border-line px-4 py-2 text-[13px] transition-colors hover:border-ink"
                >
                  {c.title} →
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </article>
    </Container>
  );
}
